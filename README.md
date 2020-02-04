# Pubbel

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/pubbel?label=minified)](https://www.npmjs.com/package/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a very light-weight JavaScript [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation for asynchronous communication between for instance UI components. It is a good and stable way to perform actions on the background (e.g. refreshing an authorization token) or make an application scalable. It can optionally sync between browser windows of the same application. The library also holds a minimal implementation of an `observable`.

## Pubbel - minimal Pub/Sub

```js
import { pubbel } from 'pubbel';
const myPubbel = pubbel();
```

Optionally, you can turn on syncing between browser windows by adding a configuration `object` as a parameter to the `pubbel` function.

```js
const myPubbel = pubbel({ enableBrowserTabSync: true });
```

You subscribe to a topic by using the `subscribe(message: String, callback: Function)` function. This returns a `Function`. This function can be used to remove it from pubbel. The callbacks can either be synchronous or asynchronous.

```js
function myFunction(...args) { ... }
const removeSubscription = myPubbel.subscribe('message-1', myCallback);
removeSubscription();
```

Publishing a message on your `pubbel` can be done by using the `publish(message, ...args)` function. Removing a topic completely from the pubsub can be done with the `delete(message)` function.

```js
myPubbel.publish('message-1');
myPubbel.publish('message-2', data);
myPubbel.delete('message-1');
```

## Multiple pubbel instances

You can have multiple instances of pubbel running in your application. The `broker` helper enables you to register multiple pubbel instances and publish a message to all of them.

```js
import { pubbel, broker } from 'pubbel';

const br = broker();
const pubsub1 = pubbel();
...

br.register(pubsub1, pubsub2, ...);
br.publish('message-1', data);
br.delete(pubsub1);
```

## Observable - subscribe to value changes

An `observable` makes it possible to observe changes to a particular value, and execute one or more functions when the value changes.

```js
import { observable } from 'pubbel';

const myObservable = observable('start');
console.log(myObservable.get()); // 'start'
observable.set('second');
console.log(observable.get()); // 'second'
```

You can subscribe/listen to changes by using the `subscribe` function of the observable.

```js
let count = 0;
const myFunction(value) => count++;

myObservable.subscribe(myFunction);
myObservable.set('second');
console.log(count); // 1
```

Each `subscribe` gives back a `Function`. This function can be used to unsubscribe to the observable, if required.

```js
const remove = myObservable.subscribe(myFunction);
remove();
```
