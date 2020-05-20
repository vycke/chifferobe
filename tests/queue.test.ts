import jobbel from '../src/queue';

const mock = jest.fn().mockResolvedValue('default');
const error = jest.fn().mockRejectedValue('default');
const callback = jest.fn((x) => x);

function wait(delay = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

describe('Jobbel tests', () => {
  it('simple execution of a queue of jobs', async () => {
    const manager = jobbel({
      concurrent: 2,
      onEvent: callback
    });

    for (let i = 0; i < 10; i++) {
      if (i === 7) manager.push(error);
      else if (i === 4)
        manager.push(async () => {
          await wait(100);
          await mock();
        });
      else
        manager.push(async () => {
          await wait(10);
          await mock();
        });
    }

    expect(callback.mock.calls.length).toBe(0);
    expect(manager.status).toEqual({
      pending: 8,
      resolved: 0,
      rejected: 0,
      running: 2
    });
    await wait(10);
    expect(callback.mock.calls.length).toBe(2);
    expect(manager.status).toEqual({
      pending: 6,
      resolved: 2,
      rejected: 0,
      running: 2
    });
    await wait(10);
    expect(callback.mock.calls.length).toBe(4);
    expect(manager.status).toEqual({
      pending: 4,
      resolved: 4,
      rejected: 0,
      running: 2
    });
    await wait(10);
    expect(callback.mock.calls.length).toBe(5);
    expect(manager.status).toEqual({
      pending: 3,
      resolved: 5,
      rejected: 0,
      running: 2
    });
    await wait(10);
    expect(callback.mock.calls.length).toBe(7);
    expect(manager.status).toEqual({
      pending: 1,
      resolved: 6,
      rejected: 1,
      running: 2
    });
    await wait(30);
    expect(callback.mock.calls.length).toBe(9);
    expect(manager.status).toEqual({
      pending: 0,
      resolved: 8,
      rejected: 1,
      running: 1
    });
    await wait(50);
    expect(callback.mock.calls.length).toBe(10);
    expect(manager.status).toEqual({
      pending: 0,
      resolved: 9,
      rejected: 1,
      running: 0
    });

    manager.reset();
    expect(manager.status).toEqual({
      pending: 0,
      resolved: 0,
      rejected: 0,
      running: 0
    });
  });

  it('simple execution with callbacks', async () => {
    const manager = jobbel({ concurrent: 2 });
    for (let i = 0; i < 10; i++) {
      if (i === 7) manager.push(error);
      else manager.push(mock);
    }

    expect(manager.status).toEqual({
      pending: 8,
      resolved: 0,
      rejected: 0,
      running: 2
    });
    await wait();
    expect(manager.status).toEqual({
      pending: 0,
      resolved: 9,
      rejected: 1,
      running: 0
    });
  });
});
