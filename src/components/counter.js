import { html, computed } from '#/index.js'
import { count } from '#_/state.js'

export default function () {
	return html`<div class="flex items-center justify-center gap-2">
		<button class="btn t-primary" @click=${() => ++count.value}>${count} clicks</button>
		<button
			class="btn t-secondary"
			?disabled=${computed(() => count.value < 2)}
			@click=${() => (count.value = 0)}
		>
			Reset
		</button>
	</div>`
}
