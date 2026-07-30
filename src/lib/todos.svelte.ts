export type Todo = {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
};

const STORAGE_KEY = 'todo-blitz:v1';

function load(): Todo[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

class TodoStore {
	items = $state<Todo[]>(load());
	filter = $state<'all' | 'active' | 'completed'>('all');

	constructor() {
		$effect.root(() => {
			$effect(() => {
				const snapshot = this.items;
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
				}
			});
		});
	}

	add(text: string) {
		const trimmed = text.trim();
		if (!trimmed) return;
		this.items = [
			{ id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
			...this.items
		];
	}

	toggle(id: string) {
		const t = this.items.find((i) => i.id === id);
		if (t) t.done = !t.done;
	}

	remove(id: string) {
		this.items = this.items.filter((i) => i.id !== id);
	}

	edit(id: string, text: string) {
		const trimmed = text.trim();
		const t = this.items.find((i) => i.id === id);
		if (!t) return;
		if (!trimmed) {
			this.remove(id);
			return;
		}
		t.text = trimmed;
	}

	clearCompleted() {
		this.items = this.items.filter((i) => !i.done);
	}

	toggleAll(done: boolean) {
		for (const i of this.items) i.done = done;
	}

	get filtered() {
		if (this.filter === 'active') return this.items.filter((i) => !i.done);
		if (this.filter === 'completed') return this.items.filter((i) => i.done);
		return this.items;
	}

	get remaining() {
		return this.items.filter((i) => !i.done).length;
	}

	get hasCompleted() {
		return this.items.some((i) => i.done);
	}
}

export const todos = new TodoStore();
