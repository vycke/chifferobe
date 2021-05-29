# Pubbel

![](https://github.com/crinklesio/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/@crinkles/pubbel.svg?style=flat)](https://www.npmjs.com/package/@crinkles/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/@crinkles/pubbel.svg?style=flat)](https://www.npmjs.com/package/@crinkles/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/@crinkles/pubbel@latest?label=minified)](https://www.npmjs.com/package/@crinkles/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a light-weight JavaScript library around event-driven elements that can be used in front-end applications. It offers different usages for a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation (wrapped as an event emitter), and an asynchronous queue that emits events.

## Event Emitter

An event emitter can be created by using the `emitter` function.

```js
import { pubbel } from '@crinkles/pubbel';
const _emitter = pubbel();
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

### Example: broadcast channel

A broadcast channel makes it possible to synhronize data between browser tabs of running web applications. See the below implementation example. Synchronization is done via the `localStorage` (due to browser support). However, no data persists in the `localStorage`. As input, it requires a `name` and an optional configuration object. The available functions are the same as for the event emitter.

```js
import { pubbel } from '@crinkles/pubbel';

export function channel(name) {
  const _emitter = pubbel();

  // function used on the 'storage' event listener
  function parseWindowEvent([key, value]) {
    if (key !== name || !newValue) return;
    const { topic, args } = JSON.parse(newValue);
    _emitter.emit(topic, ...(args || []));
  }

  window.addEventListener('storage', parseWindowEvent);

  return {
    ..._emitter,
    // fire-and-forget mechanism
    emit(topic, ...args): void {
      localStorage.setItem(name, JSON.stringify({ topic, args }));
      localStorage.removeItem(name);
    },
  };
}
```

## Proxy store

The proxy store is tiny reactive atomic state management library that can be used in any modern front-end frameworks (e.g. React, Vue, etc.). It is build on several core principles, and uses the `emitter` under the hood.

- **Event-driven**: mutations can be registered on events and are only executed when an event is dispatched.
- **Immutable**: data can be made immutable and cannot be mutated directly, due to an access layer or state interface.
- **Decoupled**: events can be registered anywhere (e.g. inside a component) and do not have to be registered near where the store is defined.
- **Modular**: can be used as a single global store, or as many decoupled and distributed small stores.

```js
import { proxy } from '@crinkles/pubbel';
// declare a store and set the initial values
const store = proxy(() => ({ count: 0 }));
store.count++; // { count: 1 }

// you can declare listeners and use them similarly to the emitter, with the
// .on() and .off() functions.

const l = (c) => console.log('Count updated:', c);
store.on('count', l); // register listener
store.off('count', l); // remove listener
store.on('*', l); // register a listener on all store events

// an immutable store, with a custom event action 'add'
const store = proxy(
  (updater) => ({
    count: 0,
    add: () => updater('count', (count) => count + 1),
  }),
  true
);
store.update('count', (count) => count + 1); // { count: 1 }
```

### Generic React hooks example

A generic React Hook implementation that automatically rerenders if the store value changes.

```jsx
import { useReducer, useRef, useLayoutEffect } from 'react';
import { proxy } from '@crinkles/pubbel';

// Define the store
const store = proxy(() => ({ count: 0 }));

// Define the hook, with query for computed parameters
export function useCache(key, query) {
  const [, rerender] = useReducer((c) => c + 1, 0);
  const value = useRef(store[key]);

  useLayoutEffect(() => {
    function updateCachedValue(s) {
      value.current = s;
      rerender();
    }

    store.on(key, updateCachedValue);
    return () => store.off(key, updateCachedValue);
  }, []); //eslint-disable-line

  return query ? query(value.current) : value.current;
}

// Apply in a component
function MyButton() {
  // here a view on the data is being used in the hook
  const count = useStorive('count', (c) => c * 2);

  return (
    <button
      onClick={() =>
        store.update('count', (c) => c + 1)
      }>{`value ${count}`}</button>
  );
}
```
