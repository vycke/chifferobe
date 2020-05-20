# Pubbel

![](https://github.com/kevtiq/pubbel/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![NPM Downloads](https://img.shields.io/npm/dm/pubbel.svg?style=flat)](https://www.npmjs.com/package/pubbel)
[![Minified size](https://img.shields.io/bundlephobia/min/pubbel?label=minified)](https://www.npmjs.com/package/pubbel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pubbel is a light-weight JavaScript library around event-driven components. It includes a [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) implemementation for asynchronous communication between for instance UI components, an event-driven data storage with a decoupled state interface that can be used for state-management, and an asynchronous queue that emits events.

## Pub/Sub

A pubsub can be created by using the `pubsub` function. Optionally, you can turn on syncing between browser windows by adding a configuration `object` as a parameter to the `pubsub` function.

```js
import { pubsub } from 'pubbel';
const myPubsub = pubsub();
const myPubsub = pubsub({ enableBrowserTabSync?: true, onPublish?: (message) => myFn(message) });
```

You subscribe to a topic by using the `subscribe(message: String, callback: Function)` function. This returns a `Function`. This function can be used to remove it from pubbel. The callbacks can either be synchronous or asynchronous.

```js
function myFunction(...args) { ... }
const removeSubscription = myPubsub.subscribe('message-1', myCallback);
removeSubscription();
```

Publishing a message on your `pubsub` can be done by using the `publish(message, ...args)` function. Removing a topic completely from the pubsub can be done with the `delete(message)` function.

```js
myPubsub.publish('message-1');
myPubsub.publish('message-2', data);
myPubsub.delete('message-1');
```

## Event-driven store

The store can be created by importing the `default` value of the `stateq` package. It provides the possibility to set an initial state, and add some optional configurations. In the configuration, you have the ability to set:

- **`onEvent: (path, value, event) => void`**: a callback that is triggered on each event in the data storage.

```js
import { store } from 'pubbel';

const initialState = { counter: 1 };
const config = {
  onEvent: (path, value, type) => console.log(path, value, type)
};

const store = stateq(initialState, config);
```

### Store events

In total there are five different events that can be triggered on the data storage in stateq.

- **`get(path: string, def?: any)`**: gives back the value for a given path in the store;
- **`set(path: string, value: any)`**: sets the value for a given path in the store;
- **`update(path: string, fn: Function)`**: uses a function to mutate the original value in the store, for a given path (e.g. `store.update('counter', (c) => c + 1)`);
- **`remove(path: string)`**: removes a value for a given path in the store;

You can also chain the events together in a transaction. The code below does invoke the `onEvent` in the configuration once for each event in the transaction.

```js
// transaction example
import store from './store';

const { update, set } = store;

function transaction() {
  set('my.nested.object', 'value 1');
  update('my.other.nested.object', 'value 2');
  if (store.get('counter') > 10) set('counter', 0);
}
transaction();
```

### Using the storage in React components

When combined with an observable or something like a [pubsub](https://github.com/kevtiq/pubbel), it can easily be used to as a React Hook. First, the store and pubsub need to be configured.

```js
// store.js
import { pubbel, store } from 'pubbel';

export const pubsub = pubbel();
const config = { onEvent: (p, v) => pubsub.publish(p, v) };
export const store = stateq({}, config);
```

With the store and pubsub configured, a custom hook can be created.

```js
// useStoreValue.js hook
import { useState, useRef } from 'react';
import { store, pubsub } from './store';

export default function useStoreValue(path, def) {
  // function to force rerender
  const [, rerender] = useReducer((c) => c + 1, 0);
  const value = useRef(store.get(path, def));

  // subscription to the pubsub events for the store
  useEffect(() => {
    const removeSubscription = pubsub.subscribe(path, (v) => {
      value.current = v;
      rerender();
    });
    // remove subscription
    return () => removeSubscription();
  }, []);

  return value.current;
}
```

## Asynchronous queue

The API of the asynchronous queu allows for three different parameters:

- `concurrent: number`: the number of concurrent async jobs that can run simultaneously;
- `onEvent?: (result, status, resolve | reject)`: a function that is triggered in resolving or rejecting each job. The result of the job and the (new) status of jobbel are given as parameters;

```js
import { queue } from 'pubbel';

function event(result, state, type) { ... }
const manager = queue({ concurrent: 3, onEvent: resolve });

// .push requires (async) functions as input
manager.push(myAPICall);

...

console.log(manager.status); // { pending: 0, resolved: x, rejected: y }
```

In the `resolve` and `reject` callback functions, the second parameter shows the current state of the job manager. It holds the following properties:

- `pending`: the amount of jobs waiting to be executed;
- `resolved`: the amount of jobs successfully finished;
- `rejected`: the amount of jobs failed;
- `running`: the amount of currently running jobs;
