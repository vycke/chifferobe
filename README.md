# pubble

![](https://github.com/kevtiq/pubble/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/pubble.svg?style=flat)](https://www.npmjs.com/package/pubble)
[![NPM Downloads](https://img.shields.io/npm/dm/pubble.svg?style=flat)](https://www.npmjs.com/package/pubble)
[![Minified size](https://img.shields.io/bundlephobia/min/pubble@latest?label=minified)](https://www.npmjs.com/package/pubble)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

pubble is a light-weight JavaScript library around an command-driven proxy state management library.

## Store

The proxy store is tiny reactive atomic state management library that can be used in any modern front-end frameworks (e.g. React, Vue, etc.). It is build on several core principles.

- **Command-driven**: commands can be registered to te store, allowing for changes.
- **Decoupled**: commands can be registered anywhere (e.g. inside a component) and do not have to be registered near where the store is defined.
- **Immutable**: data can be made immutable and cannot be mutated directly. Changes can be made via commands.
- **Modular**: can be used as a single global store, or as many decoupled and distributed small stores.

```js
import { store } from 'pubble';
// declare a store and set the initial values
const myStore = store({ count: 0 });
myStore.increment = (state) => (amount) => (state.count += amount);
myStore.increment(2); // { count: 2 }

const l = (c) => console.log('Count updated:', c);
const remove = myStore.on('count', l); // register listener


remove(); // remove listener

// Reactive querying
let double = myStore.count * 2;
myStore.on('count', (c) => (double = c * 2)); // double = 2

// You can register functions on a wildcard for debugging purposes
function debugger(key, value) {
  console.log(`${key}: ${value}`);
}
myStore.on('*', debugger);
```

## React hooks example

A generic React Hook implementation that automatically rerenders if the store value changes.

```jsx
import { useReducer, useRef, useLayoutEffect } from 'react';
import { store } from 'pubble';

// Define the store
const myStore = store({ count: 0 });
const myStore.increment = (state) => () => state.count++;

// Define the hook
export function useReadStore(key) {
  const [, rerender] = useReducer((c) => c + 1, 0);
  const value = useRef();

  useLayoutEffect(() => {
    function updateCachedValue(val) {
      value.current = val;
      rerender();
    }

    const remove = myStore.on(key, updateCachedValue);
    return () => remove();
  }, []); //eslint-disable-line

  return value.current;
}

// Apply in a component
function MyButton() {
  // here a view on the data is being used in the hook
  const count = useReadStore('count');
  return <button onClick={store.increment}>{`value ${count}`}</button>;
}
```
