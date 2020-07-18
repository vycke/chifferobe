import pubbel from '../src/pubsub';

let fn;

describe('Pub/sub', () => {
  let pubsub;
  beforeEach(() => {
    pubsub = pubbel();
    fn = jest.fn((x) => x);
    pubsub.subscribe('success', fn);
    pubsub.subscribe('success', fn);
  });

  afterEach(() => {
    pubsub.delete('success');
  });

  it('Standard events', () => {
    pubsub.publish('failed');
    pubsub.publish('success');
    expect(fn.mock.calls.length).toBe(2);
  });

  it('subscribe & remove before publish', () => {
    const remove = pubsub.subscribe('success-2', fn);
    remove();
    pubsub.publish('success-2', 'test');
    pubsub.subscribe('success-2', fn);
    pubsub.delete('success-2');
    remove();
    pubsub.publish('success-2', 'test');
    expect(fn.mock.calls.length).toBe(0);
  });

  it('async cb', () => {
    const asyncFn = jest.fn().mockResolvedValue('default');
    pubsub.subscribe('success', asyncFn);
    pubsub.publish('success', 'test');
    expect(asyncFn.mock.calls.length).toBe(1);
  });
});

it('pubbel with onPublish', () => {
  const onpublishFn = jest.fn((x) => x);
  const pubsub = pubbel({ onPublish: onpublishFn });
  pubsub.publish('test');
  expect(onpublishFn.mock.calls.length).toBe(1);
});
