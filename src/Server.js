const log4js = require("log4js");

const Web3 = require("web3");
const {Indexer} = require("./indexer/Indexer")
const {Contract} = require("./contract/Contract")
const fs = require("fs");

let blockCounter = 0
let totalSpentMs = 0
let totalTransactionCount = 0
let totalUncleCount = 0

class Server {
    constructor(config) {
        this.logger = log4js.getLogger("Server")

        this.config = config
        this.pollInterval = config.pollInterval
        this.stateFilePath = config.stateFilenameAbsPath
        this.state = {}

        if(fs.existsSync(this.stateFilePath))
            this.state = require(this.stateFilePath)

        this.state["nextBlock"] = this.state["nextBlock"] || this.config.firstBlockToProcess || 0
        this.lastBlockToProcess = this.config.lastBlockToProcess || Infinity

        this.headOfChainBlockNumber = 0
        this.exit = false
        this.failcount = 0

        this.indexer = new Indexer()
    }

    start() {
        for(let contractConfig of this.config.contracts) {
            const contract = new Contract(contractConfig.address, contractConfig.pubSubTopic, contractConfig.firstBlock)
            this.indexer.registerContract(contract)
        }

        const startBlock = this.state["nextBlock"] || this.indexer.firstRelevantBlock()

        this.web3 = this.connectWeb3()

        this.web3.eth.getBlockNumber()
            .then(number => this.headOfChainBlockNumber = number)

        setTimeout(async () => this.fetchNextBlockWrapper(startBlock), 0)
    }

    async fetchNextBlockWrapper(blockNumber) {
        if(blockNumber > this.lastBlockToProcess) {
            this.exit = true
            this.logger.info(`We've passed lastBlockToProcess (${this.lastBlockToProcess}), so we're done`)
        }

        if (this.exit) {
            this.logger.info(`Exiting..`)
            process.exit()
        }

        if(this.failcount > 0) {
            // TODO Is this a memory leak?
            // Seems there isn't a web3.disconnect(), so we'll just overwrite the object
            this.web3 = this.connectWeb3()
        }

        let nextBlockNumber = blockNumber
        try {
            nextBlockNumber = await this.fetchNextBlock(blockNumber)
            this.failcount = 0
        } catch (err) {
            this.logger.error("Got exception while fetching next block, going to attempt to reconnect web3 endpoint " + err)
            this.failcount++
        }

        // Save state if changed
        if(nextBlockNumber > blockNumber)
            this.updateState(nextBlockNumber)

        let timeout = this.pollInterval
        if(nextBlockNumber < this.headOfChainBlockNumber)
            timeout = 0

        // If failing we're gonna wait two seconds longer per retry, up to max 1 min
        if(this.failcount > 0) {
            timeout = Math.min(this.failcount * 2000, 60000)
            this.logger.error(`Fail count is ${this.failcount}, waiting ${timeout/1000} seconds before trying to reconnect`)
        }

        setTimeout(async () => this.fetchNextBlockWrapper(nextBlockNumber),
            timeout)
    }

    async fetchNextBlock(blockNumber) {
        const startStamp = Date.now()

        let nextBlockNumber = blockNumber
        let transactionCount = 0
        let uncleTransactionCount = 0

        const block = await this.web3.eth.getBlock(blockNumber, true)

        if (block && block.number === blockNumber) {
            transactionCount = this.processBlock(block)
            for (let uncleHash of block.uncles) {
                const uncleBlock = await this.web3.eth.getBlock(uncleHash, true)
                if (uncleBlock)
                    uncleTransactionCount += this.processBlock(uncleBlock)
                else
                    this.logger.warn(`Got an uncle hash, but no block ${uncleHash}`)
            }

            const spentMs = Date.now() - startStamp
            blockCounter++
            totalSpentMs += spentMs
            totalTransactionCount += transactionCount
            totalUncleCount += uncleTransactionCount

            this.logger.info(`Processed block ${blockNumber} in ${spentMs} ms with ${transactionCount} transactions and ${uncleTransactionCount} uncle transactions`)
            this.logger.info(`${(totalSpentMs / blockCounter).toFixed(0)} ms avg over ${blockCounter} blocks with ${totalTransactionCount} transactions and ${totalUncleCount} uncle transactions` )

            nextBlockNumber++
        }

        return nextBlockNumber
    }

    processBlock(block) {
        let processedTransactions = 0
        for (let transaction of block.transactions) {
            if (this.indexer.processTransaction(transaction))
                processedTransactions++
        }

        return processedTransactions
    }

    updateState(block) {
        this.state["nextBlock"] = block

        try {
            fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state))
        } catch (err) {
            this.logger.error("Cannot write state, exiting " + err)
            this.exit = true
        }
    }

    connectWeb3() {
        return new Web3(new Web3.providers.WebsocketProvider(
            this.config.websocketEndpoint,
            {
                clientConfig: {
                    maxReceivedFrameSize: 100000000,
                    maxReceivedMessageSize: 100000000,
                }
            }))
    }
}


module.exports = {
    Server
}
