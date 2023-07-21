# Chifferobe

![](https://github.com/kevtiq/chifferobe/workflows/test/badge.svg)
[![Node version](https://img.shields.io/npm/v/chifferobe.svg?style=flat)](https://www.npmjs.com/package/chifferobe)
[![NPM Downloads](https://img.shields.io/npm/dm/chifferobe.svg?style=flat)](https://www.npmjs.com/package/chifferobe)
[![Minified size](https://img.shields.io/bundlephobia/min/chifferobe@latest?label=minified)](https://www.npmjs.com/package/chifferobe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Chifferobe is a light-weight JavaScript library around an command-driven proxy state management library.

## Store

The proxy store is tiny reactive atomic state management library that can be used in any modern front-end frameworks (e.g. React, Vue, etc.). It is build on several core principles.

- **Command-driven**: commands can be registered to te store, allowing for changes.
- **Immutable**: data can be made immutable and cannot be mutated directly. Changes can be made via commands.
- **Modular**: can be used as a single global store, or as many decoupled and distributed small stores.

```js
import { store } from 'chifferobe';
// declare a store and set the initial values
const increment = (state, amount) => (state.count += amount);
const myStore = store({ count: 0 }, { increment });
myStore.increment(2); // { count: 2 }

const l = (state, old, command) =>
  console.log(`${command} executed, new state: ${state[key]}`);
const remove = myStore.listen(l); // register listener
remove(); // remove listener

// Reactive querying
let double = myStore.count * 2;
myStore.listen((state) => (double = state.count * 2)); // double = 2
```

## React hooks example

A generic React Hook implementation that automatically rerenders if the store value changes.

```jsx
import { useLayoutEffect, useReducer } from 'react';

export function useStore(store, key) {
  const [, rerender] = useReducer((c) => c + 1, 0);

  useLayoutEffect(() => {
    function listener(_cmd, state, old) {
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
