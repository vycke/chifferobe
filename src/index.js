export default function pubsub() {
  const _list = new Map();

  // Subscribe a callback to a message, that also can be removed
  function subscribe(message, callback) {
    if (!callback) return;
    _list.has(message) || _list.set(message, []);
    const index = _list.get(message).push(callback) - 1;

    return () => delete _list.get(message)[index];
  }

  // publish a message onto the queue with optional additional parameters
  function publish(message, ...args) {
    if (!_list.has(message)) return false;
    _list.get(message).forEach(async (cb) => await cb(...args));
  }

  // remove an entire message from the list
  function remove(message) {
    _list.has(message) && _list.delete(message);
  }

  return { subscribe, publish, remove };
}
