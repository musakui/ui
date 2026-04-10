import { html, signal, computed } from '#/index.js'

const TOTAL = 10
const page = signal(1)

const prev = () => {
	if (page.value > 1) page.value--
}
const next = () => {
	if (page.value < TOTAL) page.value++
}

// Produce page numbers with ellipsis: always show 1, last, and window around current
const pages = computed(() => {
	const p = page.value
	/** @type {(number | null)[]} */
	const out = []
	for (let i = 1; i <= TOTAL; i++) {
		if (i === 1 || i === TOTAL || (i >= p - 1 && i <= p + 1)) {
			out.push(i)
		} else if (out[out.length - 1] !== null) {
			out.push(null) // ellipsis
		}
	}
	return out
})

export default html`<nav aria-label="Pagination" class="flex flex-wrap items-center gap-1">
	<button
		class="hover:bg-muted flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border bg-transparent text-sm transition-colors disabled:pointer-events-none disabled:opacity-40"
		?disabled=${computed(() => page.value === 1)}
		aria-label="Previous page"
		@click=${prev}
	>
		‹
	</button>
	${computed(() =>
		pages.value.map((p) => {
			return p === null
				? html`<span
						class="text-muted-foreground flex h-9 min-w-9 items-center justify-center text-sm"
						>…</span
					>`
				: html`<button
						class="hover:bg-muted text-foreground aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border bg-transparent text-sm transition-colors"
						aria-label=${`Page ${p}`}
						aria-current=${computed(() => (page.value === p ? 'page' : null))}
						@click=${() => (page.value = p)}
					>
						${p}
					</button>`
		})
	)}
	<button
		class="hover:bg-muted flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border bg-transparent text-sm transition-colors disabled:pointer-events-none disabled:opacity-40"
		?disabled=${computed(() => page.value === TOTAL)}
		aria-label="Next page"
		@click=${next}
	>
		›
	</button>
</nav>
<p class="text-muted-foreground mt-4 text-sm">Page ${page} of ${TOTAL}</p>`
