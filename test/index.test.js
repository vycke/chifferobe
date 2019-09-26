import pubsub from '../src';

const testFn = jest.fn((x) => x);
const asyncTestFn = jest.fn().mockResolvedValue('default');

describe('eventManager', () => {
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

  it('Another subscribe, called & remove', () => {
    const remove = manager.subscribe('test-event', testFn);
    expect(remove).toBeInstanceOf(Object);
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(7);
    remove();
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
    manager.remove('test-event');
    manager.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('async cb', () => {
    manager.subscribe('test-event', asyncTestFn);
    manager.publish('test-event', 'test');
    expect(asyncTestFn.mock.calls.length).toBe(1);
  });
});
