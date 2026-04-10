import { html, signal, computed } from '#/index.js'
import { model, popoverAnchor } from '../helpers.js'

const frameworks = [
	'React',
	'Vue',
	'Svelte',
	'Angular',
	'Solid',
	'Astro',
	'Qwik',
	'Ember',
	'Alpine',
	'Lit',
]

const query = signal('')
const selected = signal(/** @type {string | null} */ (null))

const filtered = computed(() => {
	const q = query.value.toLowerCase()
	return q ? frameworks.filter((f) => f.toLowerCase().includes(q)) : frameworks
})

const pop = popoverAnchor('combo-trigger', { matchWidth: true })

/** Clear query and focus search input when popover opens */
/** @param {HTMLElement} el */
function setupCombo(el) {
	pop(el)
	el.addEventListener('toggle', (evt) => {
		if (evt.newState !== 'open') return
		query.value = ''
		el.querySelector('input')?.focus()
	})
}

export default html`<button
	id="combo-trigger"
	popovertarget="combo-pop"
	class="border-input hover:bg-muted flex w-56 cursor-pointer items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-colors"
>
	<span>${computed(() => selected.value ?? 'Select a framework…')}</span>
	<span class="text-muted-foreground text-xs">▾</span>
</button>
<div
	id="combo-pop"
	popover="auto"
	class="bg-card inset-[unset] overflow-hidden rounded-md border p-0 shadow-md"
	${setupCombo}
>
	<div class="border-b p-1">
		<input
			type="text"
			placeholder="Search…"
			class="placeholder:text-muted-foreground w-full bg-transparent px-2 py-1.5 text-sm outline-none"
			${model(query)}
		/>
	</div>
	<div class="max-h-52 overflow-y-auto p-1">
		${computed(() =>
			filtered.value.length
				? filtered.value.map((item) => {
						return html`<button
							class="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-sm"
							@click=${(e) => {
								selected.value = item
								e.currentTarget.closest('[popover]')?.hidePopover()
							}}
						>
							<span class="text-accent w-4 text-xs">
								${computed(() => (selected.value === item ? '✓' : ''))}
							</span>
							${item}
						</button>`
					})
				: html`<p class="text-muted-foreground px-2 py-4 text-center text-sm">
						No results
					</p>`
		)}
	</div>
</div>`
