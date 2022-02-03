const log4js = require("log4js");

const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub()

class PubSubProxy {
    constructor(topicAddress) {
        this.topic = pubsub.topic(topicAddress)
        this.logger = log4js.getLogger(`PSP-${topicAddress}`)
    }

    sendMessage(message) {
        // const json = JSON.stringify(message)

        this.topic.publishJSON(message)
            .then(
                id => this.logger.info(`Transaction ${message.hash} sent with id ${id}`),
                rejected => this.logger.error(`Transaction ${message.hash} rejected ${rejected}`)
            )
            .catch(err => this.logger.error(err))
    }
}

module.exports = {
    PubSubProxy
}
