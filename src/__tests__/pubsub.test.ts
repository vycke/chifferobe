import pubsub from '../pubsub';

const testFn = jest.fn((x) => x);
const asyncTestFn = jest.fn().mockResolvedValue('default');

describe('default pubbel', () => {
  let manager;
  beforeEach(() => {
    manager = pubsub();
    manager.subscribe('test-event', testFn);
    manager.subscribe('test-event', testFn);
  });

  afterEach(() => {
    manager.remove('test-event');
  });

  it('not Called', () => {
    manager.publish('not-event');
    expect(testFn.mock.calls.length).toBe(0);
  });

  it('called', () => {
    manager.publish('test-event');
    expect(testFn.mock.calls.length).toBe(2);
  });

  it('faulty subscribe', () => {
    manager.subscribe('test-event');
    manager.publish('test-event');
    expect(testFn.mock.calls.length).toBe(4);
  });

  it('Another subscribe & unsubscribe', () => {
    const subscription = manager.subscribe('test-event', testFn);
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(7);
    manager.unsubscribe('test-event', subscription);
    manager.unsubscribe('test-event', { index: 4 });
    manager.unsubscribe('tesevent', { index: 4 });
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('remove topic', () => {
    manager.remove('test-event');
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('async cb', () => {
    manager.subscribe('test-event', asyncTestFn);
    manager.publish('test-event', 'test');
    expect(asyncTestFn.mock.calls.length).toBe(1);
  });

  it('localstorage', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel_test-event',
        newValue: '{ "test": "test" }'
      })
    );
    expect(testFn.mock.calls.length).toBe(13);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel_test-event'
      })
    );
    expect(testFn.mock.calls.length).toBe(15);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel_test-event-2'
      })
    );
    expect(testFn.mock.calls.length).toBe(15);
  });
});
