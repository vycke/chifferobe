/* eslint-disable @typescript-eslint/ban-types */
type P = boolean | number | string | Record<string, unknown> | symbol;
type Listener = (...args: P[]) => void;
type Subscription = () => void;
type Emitter = {
	subscribe(topic: string, callback: Listener): Subscription;
	emit(topic: string, ...args: P[]): void;
};
type Proxy<T> = T & {
	subscribe(key: string, listener: Listener): Subscription;
};

type Command = (payload?: P) => void;
type ICommand<T> = (store: Proxy<T>) => Command;
export type Store<T> = Proxy<T> & { [key: string]: Command };

// event emitter used internally in the proxy
function emitter(): Emitter {
	const _list = new Map<string, Listener[]>();

	return {
		subscribe(topic, fn): Subscription {
			const list = (_list.get(topic) || []).concat([fn]);
			_list.set(topic, list);
			return () => {
				const cbs = _list.get(topic);
				cbs && cbs.splice(cbs.indexOf(fn) >>> 0, 1);
			};
		},
		emit(topic, ...args): void {
			_list.get(topic)?.forEach((cb): void => cb(...args));
			// trigger all wildcard listeners
			_list.get('*')?.forEach((cb): void => cb(topic, ...args));
		},
	};
}

// Function to create proxy around the state, to allow changes to be
// emitted on changes for each key. Ensures a commond can change more
// than 1 key.
function proxy<T extends object>(init: T): Proxy<T> {
	const _emitter = emitter();
	const _state = { ...init, subscribe: _emitter.subscribe };

	return new Proxy<Proxy<T>>(_state, {
		set(_t: object, prop: string, value): boolean {
			// ensure listeners are not triggered if the values don't change
			if (_state[prop] === value) return true;
			_state[prop] = value;
			_emitter.emit(prop, value);
			return true;
		},
	});
}

// Function to create store with a data access layer
export function store<T extends object>(init: T): Store<T> {
	const _state = proxy<T>(init);
	const _commands: { [key: string]: ICommand<T> } = {};

	function execute(key: string) {
		return (payload?: P) => _commands[key](_state)(payload);
	}

	return new Proxy<Store<T>>({} as Store<T>, {
		set(_t: object, prop: string, command: ICommand<T>): boolean {
			if (_commands[prop] || _state[prop]) return true;
			_commands[prop] = command;
			return true;
		},
		get(_t: object, prop: string) {
			if (_commands[prop]) return execute(prop);
			return _state[prop];
		},
	});
}
