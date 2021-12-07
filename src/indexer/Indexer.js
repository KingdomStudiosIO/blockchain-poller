const log4js = require("log4js");

class Indexer {
    constructor() {
        this.contracts = new Map()
        this.logger = log4js.getLogger(`Indexer`)

    }

    registerContract(contract) {
        this.contracts.set(contract.getAddress(), contract)
    }

    firstRelevantBlock() {
        let earliestBlock = Infinity

        for(let contract of this.contracts.values()) {
            if(contract.getFirstBlock() < earliestBlock)
                earliestBlock = contract.getFirstBlock()
        }

        return earliestBlock
    }

    processTransaction(transaction) {
        if(!transaction || !transaction.to) {
            return false
        }

        const address = transaction.to.toLowerCase()

        const contract = this.contracts.get(address)

        if(contract) {
            contract.processTransaction(transaction)
            return true
        } else {
            return false
        }
    }
}


module.exports = {
    Indexer
}