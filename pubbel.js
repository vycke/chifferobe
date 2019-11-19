export function createPubSub(logger) {
  const _list = new Map();

  // Subscribe a callback to a message, that also can be removed
  function subscribe(message, callback) {
    if (!callback) return;
    _list.has(message) || _list.set(message, []);
    const index = _list.get(message).push(callback) - 1;
    return { index, message };
  }

  // publish a message onto the pubsub with optional additional parameters
  function publish(message, ...args) {
    if (logger) logger(message);
    if (!_list.has(message)) return false;
    _list.get(message).forEach(async (cb) => await cb(...args));
  }

  // remove an entire message from the list
  function remove(message) {
    _list.has(message) && _list.delete(message);
  }

  // removes a subscription retrieved from the subscribe()
  function unsubscribe({ message, index }) {
    if (_list.has(message) && _list.get(message).length >= index - 1)
      delete _list.get(message)[index];
  }

  return { subscribe, publish, unsubscribe, remove };
}
