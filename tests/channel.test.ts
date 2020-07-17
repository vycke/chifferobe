import channel from '../src/channel';

const testFn = jest.fn((x) => x);

const channelName = 'mychannel';

describe('channel', () => {
  const ch = channel(channelName);
  ch.subscribe('sync-event', testFn);

  it('faulty sync', () => {
    expect(testFn.mock.calls.length).toBe(0);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: 'sync-event-2' })
      })
    );
    expect(testFn.mock.calls.length).toBe(0);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName
      })
    );
    expect(testFn.mock.calls.length).toBe(0);

    window.dispatchEvent(new StorageEvent('storage', {}));
    expect(testFn.mock.calls.length).toBe(0);
  });
  it('correct sync', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: 'sync-event' })
      })
    );

    expect(testFn.mock.calls.length).toBe(1);
  });

  it('sync with data', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: channelName,
        newValue: JSON.stringify({ message: 'sync-event', args: ['value'] })
      })
    );
    expect(testFn.mock.calls.length).toBe(2);
  });

  it('send over to other browsers', () => {
    ch.publish('sync-event');
  });
});
