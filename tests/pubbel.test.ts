import pubbel from '../src/pubsub';

const testFn = jest.fn((x) => x);
const asyncTestFn = jest.fn().mockResolvedValue('default');

describe('default pubbel', () => {
  let pubsub;
  beforeEach(() => {
    pubsub = pubbel();
    pubsub.subscribe('test-event', testFn);
    pubsub.subscribe('test-event', testFn);
  });

  afterEach(() => {
    pubsub.delete('test-event');
  });

  it('not called', () => {
    pubsub.publish('not-event');
    expect(testFn.mock.calls.length).toBe(0);
  });

  it('called', () => {
    pubsub.publish('test-event');
    expect(testFn.mock.calls.length).toBe(2);
  });

  it('faulty subscribe', () => {
    pubsub.subscribe('test-event');
    pubsub.publish('test-event');
    expect(testFn.mock.calls.length).toBe(4);
  });

  it('Another subscribe & unsubscribe', () => {
    const remove = pubsub.subscribe('test-event', testFn);
    pubsub.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(7);
    remove();
    pubsub.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('remove topic', () => {
    const remove = pubsub.subscribe('test-event2', testFn);
    remove();
    pubsub.publish('test-event2', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('remove topic while not existing', () => {
    const remove = pubsub.subscribe('test-event2', testFn);
    pubsub.delete('test-event2');
    remove();
    pubsub.publish('test-event2', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('async cb', () => {
    pubsub.subscribe('test-event', asyncTestFn);
    pubsub.publish('test-event', 'test');
    expect(asyncTestFn.mock.calls.length).toBe(1);
  });
});

it('pubbel with onPublish', () => {
  const onpublishFn = jest.fn((x) => x);
  const pubsub = pubbel({ onPublish: onpublishFn });
  pubsub.publish('test');
  expect(onpublishFn.mock.calls.length).toBe(1);
});
