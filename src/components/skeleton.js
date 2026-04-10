import { html, signal, computed } from '#/index.js'
import { toggle, not } from '#/signal/utils.js'
import { btn } from '../helpers.js'

const loading = signal(true)
const loaded = not(loading)

export default html`<div class="flex max-w-sm flex-col gap-6">
	<div class="flex justify-end">
		<button class=${btn('outline', 'sm')} @click=${toggle(loading)}>
			${computed(() => (loading.value ? 'Resolve' : 'Reset'))}
		</button>
	</div>
	<div class="flex items-center gap-4">
		<div
			?hidden=${loaded}
			class="bg-muted size-12 shrink-0 animate-pulse rounded-full"
		></div>
		<div
			?hidden=${loading}
			class="bg-accent text-accent-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
		>
			CN
		</div>
		<div class="flex-1 space-y-2">
			<div ?hidden=${loaded} class="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
			<p ?hidden=${loading} class="text-sm font-medium">Claude Nova</p>
			<div ?hidden=${loaded} class="bg-muted h-3 w-1/2 animate-pulse rounded"></div>
			<p ?hidden=${loading} class="text-muted-foreground text-xs">
				claude@anthropic.com
			</p>
		</div>
	</div>
	<div class="space-y-2">
		<div ?hidden=${loaded} class="bg-muted h-4 w-full animate-pulse rounded"></div>
		<div ?hidden=${loaded} class="bg-muted h-4 w-5/6 animate-pulse rounded"></div>
		<div ?hidden=${loaded} class="bg-muted h-4 w-4/6 animate-pulse rounded"></div>
		<p ?hidden=${loading} class="text-muted-foreground text-sm leading-relaxed">
			The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor
			jugs.
		</p>
	</div>
</div>`
