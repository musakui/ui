import { html, signal, computed } from '#/index.js'
import { toggle } from '#/signal/utils.js'

const toggleOn = signal(false)

export default html`<div class="flex items-center gap-4">
	<button
		role="switch"
		class="group bg-muted aria-checked:bg-accent aria-checked:border-accent relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200"
		aria-checked=${toggleOn}
		@click=${toggle(toggleOn)}
	>
		<span
			class="bg-background absolute top-1 left-1 size-4 rounded-full transition-transform duration-200 group-aria-checked:translate-x-5"
		></span>
	</button>
	<span class="text-sm">${computed(() => (toggleOn.value ? 'On' : 'Off'))}</span>
</div>`
