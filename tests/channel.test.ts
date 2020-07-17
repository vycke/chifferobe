import channel from '../src/channel';

const fn = jest.fn((x) => x);
const channelName = 'mychannel';
const success = 'success';
const failed = 'failed';

describe('Browser channel', () => {
  const ch = channel(channelName);
  ch.subscribe(success, fn);

  it('Failed sync events', () => {
    expect(fn.mock.calls.length).toBe(0);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: failed })
      })
    );
    expect(fn.mock.calls.length).toBe(0);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName
      })
    );
    expect(fn.mock.calls.length).toBe(0);

    window.dispatchEvent(new StorageEvent('storage', {}));
    expect(fn.mock.calls.length).toBe(0);
  });

  it('Successful sync events', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: success })
      })
    );

    expect(fn.mock.calls.length).toBe(1);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: success, args: ['value'] })
      })
    );
    expect(fn.mock.calls.length).toBe(2);
  });

  it('Publish event', () => {
    ch.publish(success);
  });
});