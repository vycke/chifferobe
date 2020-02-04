import pubbel from '../src/pubbel';
import broker from '../src/broker';

const testFn = jest.fn((x) => x);

describe('pubbel broker', () => {
  const br = broker();
  const pubsub1 = pubbel();
  const pubsub2 = pubbel();
  beforeEach(() => {
    pubsub1.subscribe('test-event-1', testFn);
    pubsub2.subscribe('test-event-1', testFn);
    pubsub1.subscribe('test-event-2', testFn);
    br.register(pubsub1, pubsub2);
  });

  afterEach(() => {
    pubsub1.delete('test-event-1');
    pubsub1.delete('test-event-1');
    pubsub2.delete('test-event-1');
    br.delete(pubsub1);
    br.delete(pubsub2);
  });

  it('publishing broker messages', () => {
    br.publish('test-event-1');
    expect(testFn.mock.calls.length).toBe(2);
    br.publish('test-event-2');
    expect(testFn.mock.calls.length).toBe(3);
  });

  it('removing', () => {
    br.delete(pubsub2);
    br.publish('test-event-1');
    expect(testFn.mock.calls.length).toBe(4);
  });
});
