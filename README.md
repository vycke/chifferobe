# Pubby JS

Pubby JS is a very light-weight JavaScript [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation for asynchronous communication between for instance UI components. It is a good and stable way to perform actions on the background (e.g. refreshing an authorization token) or make an application scalable.

```js
import pubsub from 'pubby-js';
const myPubsub = pubsub();
```

## Subscribing

You subscribe to a topic by using the `subscribe(topic, callback)` function. When subscribing, you are given back a 'subscription'. You can remove the subscription using the `unsubscribe(subscription)` function.

```js
function myCallback(...args) { ... }
const mySubscription = myPubsub.subscribe('message-1', myCallback);
myPubsub.unsubscribe(mySubscription);
```

## Publishing

Publishing a message on your Pub/Sub can easily be done by using the `publish(message, ...args)` function;

```js
myPubsub.publish('message-1');
myPubsub.publish('message-2', data);
```
