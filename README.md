# Pubble

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/pubbel?label=minified)](https://www.npmjs.com/package/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a very light-weight JavaScript [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation for asynchronous communication between for instance UI components. It is a good and stable way to perform actions on the background (e.g. refreshing an authorization token) or make an application scalable. A queue is used to enforce sequential execution.

```js
import createPubbel from 'pubbel';
const pubbel = createPubbel();
```

Optionally, you can provide a logger function as a parameter in the `createPubbel(logger: Function)` function. This will post the message on every `publish` to the logger.

## Subscribing

You subscribe to a topic by using the `subscribe(topic, callback)` function. When subscribing, you are given back a 'subscription'. You can remove the subscription using the `unsubscribe(subscription)` function. The callbacks can either be synchronous or asynchronous.

```js
function myCallback(...args) { ... }
const mySubscription = pubbel.subscribe('message-1', myCallback);
pubbel.unsubscribe(mySubscription);
```

## Publishing

Publishing a message on your Pub/Sub can easily be done by using the `publish(message, ...args)` function;

```js
pubbel.publish('message-1');
pubbel.publish('message-2', data);
```

## Queue and Stack
