import queue from '../src/queue';

const mock = jest.fn().mockResolvedValue('default');
const error = jest.fn().mockRejectedValue('default');
const callback = jest.fn((x) => x);

function wait(delay = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const success = (delay = 0) => async () => {
  await wait(delay);
  await mock();
};

describe('Async Queue', () => {
  it('standard instant async queue', async () => {
    const manager = queue({
      concurrent: 2,
      instant: true,
      onEvent: callback
    });

    for (let i = 0; i < 10; i++) {
      if (i === 7) manager.push(error);
      else if (i === 4) manager.push(success(100));
      else manager.push(success(10));
    }

    expect(callback.mock.calls.length).toBe(0);
    expect(manager.status.pending).toBe(8);
    expect(manager.status.running).toBe(2);

    await wait(10);
    expect(callback.mock.calls.length).toBe(2);
    expect(manager.status.pending).toBe(6);
    expect(manager.status.resolved).toBe(2);

    await wait(10);
    expect(callback.mock.calls.length).toBe(4);
    expect(manager.status.resolved).toBe(4);

    await wait(10);
    expect(callback.mock.calls.length).toBe(5);
    expect(manager.status.resolved).toBe(5);

    await wait(10);
    expect(callback.mock.calls.length).toBe(7);
    expect(manager.status.resolved).toBe(6);
    expect(manager.status.rejected).toBe(1);

    await wait(30);
    expect(callback.mock.calls.length).toBe(9);
    expect(manager.status.running).toBe(1);

    await wait(50);
    expect(callback.mock.calls.length).toBe(10);
    expect(manager.status.pending).toBe(0);
    expect(manager.status.running).toBe(0);
  });

  it('Simple execution with onEvent', async () => {
    const manager = queue({ concurrent: 2, instant: true });
    manager.push(mock);
    manager.push(error);
    await wait();
    expect(manager.status.resolved).toBe(1);
  });

  it('Start & stop', async () => {
    const manager = queue({ concurrent: 2, instant: false });
    for (let i = 0; i < 10; i++) manager.push(success(10));

    await wait(30);
    expect(manager.status.pending).toBe(10);
    manager.start();
    await wait(30);
    manager.stop();
    await wait(30);
    expect(manager.status.pending).toBe(7);
    manager.start();
    await wait(300);
    expect(manager.status.resolved).toBe(10);
  });
});
