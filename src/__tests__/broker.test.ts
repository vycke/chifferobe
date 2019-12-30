import pubbel from '../pubbel';
import broker from '../broker';

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
    pubsub1.remove('test-event-1');
    pubsub1.remove('test-event-1');
    pubsub2.remove('test-event-1');
    br.remove(pubsub1);
    br.remove(pubsub2);
  });

  it('publishing broker messages', () => {
    br.publish('test-event-1');
    expect(testFn.mock.calls.length).toBe(2);
    br.publish('test-event-2');
    expect(testFn.mock.calls.length).toBe(3);
  });

  it('removing', () => {
    br.remove(pubsub2);
    br.publish('test-event-1');
    expect(testFn.mock.calls.length).toBe(4);
  });
});
