<script lang="ts">
	import { todos } from '$lib/todos.svelte';

	let draft = $state('');
	let editingId = $state<string | null>(null);
	let editingText = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		todos.add(draft);
		draft = '';
	}

	function startEdit(id: string, text: string) {
		editingId = id;
		editingText = text;
	}

	function commitEdit() {
		if (editingId) todos.edit(editingId, editingText);
		editingId = null;
	}

	function cancelEdit() {
		editingId = null;
	}

	function onEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitEdit();
		if (e.key === 'Escape') cancelEdit();
	}
</script>

<svelte:head>
	<title>Todo Blitz</title>
	<meta name="description" content="A tiny, blazing fast todo list." />
</svelte:head>

<main>
	<h1>Todo Blitz</h1>

	<form onsubmit={handleSubmit}>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			type="text"
			bind:value={draft}
			placeholder="What needs doing?"
			aria-label="New todo"
			autocomplete="off"
			autofocus
		/>
		<button type="submit" disabled={!draft.trim()}>Add</button>
	</form>

	{#if todos.items.length > 0}
		<div class="toolbar">
			<label class="toggle-all">
				<input
					type="checkbox"
					checked={todos.items.length > 0 && todos.remaining === 0}
					onchange={(e) => todos.toggleAll((e.currentTarget as HTMLInputElement).checked)}
				/>
				Mark all done
			</label>

			<div class="filters">
				<button class:active={todos.filter === 'all'} onclick={() => (todos.filter = 'all')}
					>All</button
				>
				<button class:active={todos.filter === 'active'} onclick={() => (todos.filter = 'active')}
					>Active</button
				>
				<button
					class:active={todos.filter === 'completed'}
					onclick={() => (todos.filter = 'completed')}>Done</button
				>
			</div>
		</div>

		<ul class="list">
			{#each todos.filtered as todo (todo.id)}
				<li class:done={todo.done}>
					<label class="row">
						<input type="checkbox" checked={todo.done} onchange={() => todos.toggle(todo.id)} />
						{#if editingId === todo.id}
							<!-- svelte-ignore a11y_autofocus -->
							<input
								class="edit"
								type="text"
								bind:value={editingText}
								onblur={commitEdit}
								onkeydown={onEditKeydown}
								autofocus
							/>
						{:else}
							<span
								class="text"
								role="button"
								tabindex="0"
								ondblclick={() => startEdit(todo.id, todo.text)}
								onkeydown={(e) => {
									if (e.key === 'Enter') startEdit(todo.id, todo.text);
								}}
							>
								{todo.text}
							</span>
						{/if}
					</label>
					<button class="remove" aria-label="Delete todo" onclick={() => todos.remove(todo.id)}
						>&times;</button
					>
				</li>
			{/each}
		</ul>

		<footer>
			<span>{todos.remaining} {todos.remaining === 1 ? 'item' : 'items'} left</span>
			{#if todos.hasCompleted}
				<button class="clear" onclick={() => todos.clearCompleted()}>Clear completed</button>
			{/if}
		</footer>
	{:else}
		<p class="empty">Nothing on your list yet. Add something above.</p>
	{/if}
</main>

<style>
	:global(:root) {
		color-scheme: light dark;
	}

	:global(body) {
		margin: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Helvetica,
			Arial,
			sans-serif;
		background: light-dark(#f6f6f7, #111113);
		color: light-dark(#1a1a1a, #eee);
	}

	main {
		max-width: 560px;
		margin: 0 auto;
		padding: 3rem 1.25rem 4rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1.5rem;
		text-align: center;
		letter-spacing: -0.02em;
	}

	form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	input[type='text'] {
		flex: 1;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 1px solid light-dark(#ddd, #333);
		border-radius: 8px;
		background: light-dark(#fff, #1a1a1c);
		color: inherit;
	}

	input[type='text']:focus {
		outline: 2px solid #6366f1;
		outline-offset: 1px;
	}

	button {
		font: inherit;
		cursor: pointer;
		border: none;
		background: none;
		color: inherit;
	}

	form button {
		padding: 0.75rem 1.25rem;
		background: #6366f1;
		color: white;
		border-radius: 8px;
		font-weight: 600;
	}

	form button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		color: light-dark(#666, #999);
	}

	.toggle-all {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
	}

	.filters {
		display: flex;
		gap: 0.25rem;
	}

	.filters button {
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
	}

	.filters button.active {
		background: light-dark(#e5e5ff, #2a2a40);
		color: #6366f1;
		font-weight: 600;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-radius: 10px;
		overflow: hidden;
		background: light-dark(#fff, #1a1a1c);
		border: 1px solid light-dark(#eee, #292929);
	}

	.list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid light-dark(#f0f0f0, #262626);
	}

	.list li:last-child {
		border-bottom: none;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		cursor: pointer;
	}

	.text {
		flex: 1;
		word-break: break-word;
	}

	li.done .text {
		text-decoration: line-through;
		opacity: 0.5;
	}

	.edit {
		flex: 1;
		padding: 0.25rem 0.5rem;
		border: 1px solid #6366f1;
		border-radius: 6px;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.remove {
		font-size: 1.25rem;
		line-height: 1;
		color: light-dark(#bbb, #555);
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
	}

	.remove:hover {
		color: #ef4444;
		background: light-dark(#fee, #331);
	}

	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: light-dark(#666, #999);
	}

	.clear:hover {
		text-decoration: underline;
		color: #ef4444;
	}

	.empty {
		text-align: center;
		color: light-dark(#999, #666);
		margin-top: 2rem;
	}

	input[type='checkbox'] {
		width: 1.15rem;
		height: 1.15rem;
		accent-color: #6366f1;
		cursor: pointer;
		flex-shrink: 0;
	}
</style>
