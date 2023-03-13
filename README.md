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
const increment = (state) => (amount) => (state.count += amount);
const myStore = store({ count: 0 }, { increment });
myStore.increment(2); // { count: 2 }

const l = (state, key) => console.log(`${key} updated: ${state[key]}`);
const remove = myStore.subcribe(l); // register listener
remove(); // remove listener

// Reactive querying
let double = myStore.count * 2;
myStore.subscribe((state, old) => (double = state.count * 2)); // double = 2
```

## React hooks example

A generic React Hook implementation that automatically rerenders if the store value changes.

```jsx
import { useLayoutEffect, useReducer } from 'react';

// For pubble stores
export function useStore(store, key) {
  const [, rerender] = useReducer((c) => c + 1, 0);

  useLayoutEffect(() => {
    function listener(state, old) {
      if (state[key] !== old[key]) rerender();
    }

    const remove = store.subscribe(listener);
    return () => remove();
  }, []); //eslint-disable-line

  return store[key];
}

// Apply in a component
function MyButton() {
  // here a view on the data is being used in the hook
  const count = useReadStore(myStore, 'count');
  return <button onClick={store.increment}>{`value ${count}`}</button>;
}
```
