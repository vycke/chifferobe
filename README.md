# Pubbel

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/@crinkle/pubbel.svg?style=flat)](https://www.npmjs.com/package/@crinkle/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/@crinkle/pubbel.svg?style=flat)](https://www.npmjs.com/package/@crinkle/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/@crinkle/pubbel@latest?label=minified)](https://www.npmjs.com/package/@crinkle/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a light-weight JavaScript library around event-driven elements that can be used in front-end applications. It offers different usages for a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation (wrapped as an event emitter), and an asynchronous queue that emits events.

## Event Emitter

An event emitter can be created by using the `emitter` function.

```js
import { emitter } from '@crinkle/pubbel';
const _emitter = emitter();
```

You subscribe to a topic by using the `on(topic: string, callback: Function)` function. The callbacks can either be synchronous or asynchronous (**NOTE**: topic '\*' is a wildcard topic that triggers on every emit).

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
import { channel } from '@crinkle/pubbel';

const myChannel = channel('my-channel');
myChannel.on('message-1', myCallback);
myChannel.emit('message-1', data);
```
