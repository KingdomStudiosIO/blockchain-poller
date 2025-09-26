const log4js = require("log4js");

const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub()

class PubSubProxy {
    constructor(topicAddress, delayMs) {
        this.topic = pubsub.topic(topicAddress)
        this.logger = log4js.getLogger(`PSP-${topicAddress}`)
        this.delayMs = delayMs
    }

    sendMessage(message) {
        // const json = JSON.stringify(message)

        this.publishWithDelay(message)
            .then(
                id => {},//this.logger.info(`Transaction ${message.hash} sent with id ${id}`),
                rejected => this.logger.error(`Transaction ${message.hash} rejected ${rejected}`)
            )
            .catch(err => this.logger.error(err))
    }

    async publishWithDelay(message) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs))

        const json = JSON.stringify(message)
        const dataBuffer = Buffer.from(json)

        return this.topic.publishMessage({data: dataBuffer})
    }
}

module.exports = {
    PubSubProxy
}
