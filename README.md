# Pubbel

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/pubbel?label=minified)](https://www.npmjs.com/package/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a light-weight JavaScript library around event-driven elements that can be used in front-end applications. It offers different usages for a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation (e.g. browser tab synchronization), an event-driven data storage with a decoupled state interface that can be used for state-management, and an asynchronous queue that emits events.

## Event Emitter

An event emitter can be created by using the `emitter` function.

```js
import { emitter } from 'pubbel';
const _emitter = emitter();
```

You subscribe to a topic by using the `on(topic: string, callback: Function)` function. The callbacks can either be synchronous or asynchronous.

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

## Event-driven store

The store can be created by importing the `store` function. It provides the possibility to set an initial state, and add some optional configurations. In the configuration, you have the ability to set:

- `onUpdate(path, value): void`: a callback that is triggered on each update event in the data storage.

After creation, there are several actions you can perform with the store.

- `get(path: string, def?: any)`: gives back the value for a given path in the store.
- `update(path: string, fn: Function)`: uses a function to mutate the original value in the store, for a given path (e.g. `store.update('counter', (c) => c + 1)`).
- `subscribe(path, cb: Function)`: creates a subscription similar to the pub/sub subscription.

```js
import { store } from 'pubbel';

const initialState = { counter: 1 };
const config = {
  onUpdate: (path, value) => console.log(path, value)
};

const myStore = store(initialState, config);
store.update('key', () => 'value');
store.get('key');
```

### Using the storage in React components

You can use the store in combination with React to rerender components. It can easily be used to as a React Hook.

```js
// useStoreValue.js hook
import { useState, useRef } from 'react';
import { store } from 'pubbel';

const state = store({ count: 0 });

export default function useStoreValue(path, def) {
  // function to force rerender
  const [, rerender] = useReducer((c) => c + 1, 0);
  const value = useRef(store.get(path, def));

  // subscription to the pubsub events for the store
  useEffect(() => {
    const remove = store.subscribe(path, (v) => {
      value.current = v;
      rerender();
    });
    // remove subscription
    return () => remove();
  }, []);

  return value.current;
}
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
