const log4js = require("log4js");
const {PubSubProxy} = require("../output/PubSubProxy")

class Contract {
    constructor(address, pubSubTopic, firstBlock) {
        this.address = address.toLowerCase()
        this.pubsubproxy = new PubSubProxy(pubSubTopic)
        this.firstBlock = firstBlock
        this.logger = log4js.getLogger(`Contract-${this.address}`)
    }

    getAddress() {
        return this.address
    }

    getFirstBlock() {
        return this.firstBlock
    }

    processTransaction(transaction){
        this.pubsubproxy.sendMessage(transaction)
    }
}

module.exports = {
    Contract
}