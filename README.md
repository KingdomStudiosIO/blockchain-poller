# Blockchain Polling Node

### Credit
This app was originally created by Magg at Kingdom.Watch, and then donated to DefiKingdoms for further development

### About
This script can be used for feeding interesting transactions from the blockchain to a 
[PubSub](https://cloud.google.com/pubsub) topic. The idea is to then process the transactions with 
[Cloud Functions](https://cloud.google.com/functions) and finally persisting the state in
[Firestore](https://cloud.google.com/firestore) or other suitable state stores.

This provides flexibility and let the solution scale automatically. 


### Getting started
To get started with PubSub sign up for the free tier over at [Google Cloud](https://cloud.google.com), and 
[create](https://console.cloud.google.com/cloudpubsub/topic/) a PubSub topic.

Edit `config.json` with the smart contract addresses you want to watch, as well as the PubSub topics to publish the 
transactions to.

Example config:
```json
{
  "firstBlockToProcess": 19000000,
  "lastBlockToProcess": 19000010,
  "websocketEndpoint": "wss://ws.s0.t.hmny.io/",
  "pollInterval": 1000,
  "contracts": [
    {
      "address": "0xabD4741948374b1f5DD5Dd7599AC1f85A34cAcDD",
      "pubSubTopic": "projects/YOUR_PROJECT/topics/YOUR_TOPIC",
      "firstBlock": 16339595
    }
  ]
}
```

Provide credentials for PubSub through the `GOOGLE_APPLICATION_CREDENTIALS` environment variable as described 
[here](https://cloud.google.com/pubsub/docs/reference/libraries#client-libraries-install-nodejs).
