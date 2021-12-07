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
  "websocketEndpoint": "wss://ws.s0.t.hmny.io/",
  "pollInterval": 1000,
  "stateFilename": "./state.json",
  "contracts": [
    {
      "address": "0x5100bd31b822371108a0f63dcfb6594b9919eaf4",
      "pubSubTopic": "yourTopic",
      "firstBlock": 19875503
    }
  ]
}
```

Provide credentials for PubSub through the `GOOGLE_APPLICATION_CREDENTIALS` environment variable as described 
[here](https://cloud.google.com/pubsub/docs/reference/libraries#client-libraries-install-nodejs).

### Future plans
Let third parties/the Community subscribe to PubSub topics, closing the gap between the blockchain and web2 tools.
