# Pubbel

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/pubbel?label=minified)](https://www.npmjs.com/package/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a light-weight JavaScript library around event-driven elements that can be used in front-end applications. It offers different usages for a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation (wrapped as an event emitter), and an asynchronous queue that emits events.

## Event Emitter

An event emitter can be created by using the `emitter` function.

```js
import { emitter } from 'pubbel';
const _emitter = emitter();
```

You subscribe to a topic by using the `on(topic: string, callback: Function)` function. The callbacks can either be synchronous or asynchronou (**NOTE**: topic '\*' is a wildcard topic that triggers on every emit).

```js
function myFunction(...args) { ... }
_emitter.on('message-1', myFunction);
_emitter.off('message-1', myFunction);
```

Publishing a message on your `emitter` can be done by using the `emit(topic, ...args)` function.

```js
_emitter.emit('message-2', data);
```

## Broadcast channel

The broadcast `channel` can be used to synhronize data between browser tabs of running web applications. Synchronization is done via the `localStorage` (due to browser support). However, no data persists in the `localStorage`. As input, it requires a `name` and an optional configuration object. The available functions are the same as for the event emitter.

```js
import { channel } from 'pubbel';

const myChannel = channel('my-channel');
myChannel.on('message-1', myCallback);
myChannel.emit('message-1', data);
```

## Asynchronous queue

The API of the asynchronous queu allows for three different parameters:

- `concurrent: number`: the number of concurrent async jobs that can run simultaneously;
- `instant: boolean`: if the the queue should process the request instantly when pushed (if not manually stopped in between);
- `onResolve?: (result, status)`: a function that is triggered after each job. The result of the job and the (new) status of jobbel are given as parameters;

```js
import { queue } from 'pubbel';

function resolve(result, state) { ... }
const manager = queue({ concurrent: 3, instant: false, onResolve: resolve });

// .push requires (async) functions as input
manager.push(myAPICall);
manager.start();
manager.stop();
```

In the `onResolve` callback function, the second parameter shows the current state of the job manager. It holds the amount of pending and running jobs, and if the queue is in an active state or not.
