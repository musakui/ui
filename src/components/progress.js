import { html, signal, computed } from '#/index.js'
import { update } from '#/signal/utils.js'
import { btn } from '../helpers.js'

const value = signal(40)

/** @param {number} n */
const clamp = (n) => Math.min(100, Math.max(0, n))

export default html`<div class="flex max-w-sm flex-col gap-6">
	<div class="flex flex-col gap-2">
		<div class="flex justify-between text-sm">
			<span>Upload progress</span>
			<span class="text-muted-foreground">${value}%</span>
		</div>
		<div
			role="progressbar"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow=${value}
			class="bg-muted h-2 w-full overflow-hidden rounded-full"
		>
			<div
				class="bg-accent h-full w-(--progress-pct) rounded-full transition-all duration-300"
				style=${computed(() => `--progress-pct: ${value.value}%`)}
			></div>
		</div>
	</div>
	<div class="flex flex-wrap gap-2">
		<button
			class=${btn('outline', 'sm')}
			@click=${() => update(value, (v) => clamp(v - 10))}
		>
			−10
		</button>
		<button
			class=${btn('outline', 'sm')}
			@click=${() => update(value, (v) => clamp(v + 10))}
		>
			+10
		</button>
		<button class=${btn('outline', 'sm')} @click=${() => (value.value = 0)}>
			Reset
		</button>
		<button class=${btn('primary', 'sm')} @click=${() => (value.value = 100)}>
			Complete
		</button>
	</div>
</div>`
