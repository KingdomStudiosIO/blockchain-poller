const log4js = require("log4js");
const {PubSubProxy} = require("../output/PubSubProxy");

class Indexer {
    constructor(pubSubTopic) {
        this.logger = log4js.getLogger(`Indexer`)
        this.pubsubproxy = new PubSubProxy(pubSubTopic)
    }

    processTransaction(transaction) {
        if(!transaction || !transaction.to) {
            return false
        }

        this.pubsubproxy.sendMessage(transaction)
        return true
    }
}


module.exports = {
    Indexer
}
