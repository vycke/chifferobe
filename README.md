# pubble

![](https://github.com/crinklesio/pubble/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/@crinkles/pubble.svg?style=flat)](https://www.npmjs.com/package/pubble)
[![NPM Downloads](https://img.shields.io/npm/dm/@crinkles/pubble.svg?style=flat)](https://www.npmjs.com/package/pubble)
[![Minified size](https://img.shields.io/bundlephobia/min/@crinkles/pubble@latest?label=minified)](https://www.npmjs.com/package/pubble)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

pubble is a light-weight JavaScript library around an event-driven proxy state management library.

## Proxy store

The proxy store is tiny reactive atomic state management library that can be used in any modern front-end frameworks (e.g. React, Vue, etc.). It is build on several core principles, and uses the `emitter` under the hood.

- **Event-driven**: mutations can be registered on events and are only executed when an event is dispatched.
- **Immutable**: data can be made immutable and cannot be mutated directly, due to an access layer or state interface.
- **Decoupled**: events can be registered anywhere (e.g. inside a component) and do not have to be registered near where the store is defined.
- **Modular**: can be used as a single global store, or as many decoupled and distributed small stores.

```js
import proxy from 'pubble';
// declare a store and set the initial values
const store = proxy({ count: 0 });
store.count++; // { count: 1 }

const l = (c) => console.log('Count updated:', c);
const remove = store.subscribe('count', l); // register listener
remove(); // remove listener
```

## React hooks example

A generic React Hook implementation that automatically rerenders if the store value changes.

```jsx
import { useReducer, useRef, useLayoutEffect } from 'react';
import proxy from 'pubble';

// Define the store
const store = proxy({ count: 0 });

// Define the hook, with query for computed parameters
export function useCache(key, query) {
  const [, rerender] = useReducer((c) => c + 1, 0);
  const value = useRef(store[key]);

  useLayoutEffect(() => {
    function updateCachedValue(s) {
      value.current = s;
      rerender();
    }

    const remove = store.subscribe(key, updateCachedValue);
    return () => remove();
  }, []); //eslint-disable-line

  return query ? query(value.current) : value.current;
}

// Apply in a component
function MyButton() {
  // here a view on the data is being used in the hook
  const count = useCache('count', (c) => c * 2);
  return <button onClick={() => store.count++}>{`value ${count}`}</button>;
}
```
