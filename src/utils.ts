import { Primitive } from './types';

export function uuid(): string {
  return 'xxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
}

export function listen(message: string, cb: Function): void {
  window.addEventListener('storage', function({ key, newValue }) {
    if (key !== `pubbel_${message}`) return;
    let parsed: Primitive;

    try {
      parsed = JSON.parse(newValue || '');
    } catch (e) {
      parsed = newValue || '';
    }

    cb(message, parsed);
  });
}

export function sync(message: string, data: Primitive): void {
  localStorage.setItem(`pubbel_${message}`, JSON.stringify(data));
  localStorage.removeItem(`pubbel_${message}`);
}
