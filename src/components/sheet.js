import { html, signal, computed } from '#/index.js'
import { btn } from '../helpers.js'

const sides = /** @type {const} */ (['right', 'left', 'top', 'bottom'])
const activeSide = signal(/** @type {typeof sides[number]} */ ('right'))

export default html`<div class="flex flex-wrap gap-2">
	${sides.map((side) => html`
		<button
			class=${btn()}
			popovertarget="sheet-panel"
			popovertargetaction="show"
			@click=${() => (activeSide.value = side)}
		>${side[0].toUpperCase() + side.slice(1)}</button>
	`)}
</div>
<div
	id="sheet-panel"
	popover="manual"
	class=${computed(() => 'sheet-popover sheet-' + activeSide.value)}
>
	<div class="flex flex-col h-full p-6">
		<div class="flex items-start justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold">Sheet Title</h3>
				<p class="text-sm text-muted-foreground mt-1">
					Make changes to your profile here.
				</p>
			</div>
			<button
				class="opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer text-lg leading-none"
				popovertarget="sheet-panel"
				popovertargetaction="hide"
			>✕</button>
		</div>
		<div class="flex-1 space-y-4 text-sm text-muted-foreground">
			<p>Sheet content goes here. This panel slides in from the ${activeSide} edge.</p>
		</div>
		<div class="flex gap-2 justify-end pt-4 border-t border-border">
			<button
				class=${btn('outline')}
				popovertarget="sheet-panel"
				popovertargetaction="hide"
			>Cancel</button>
			<button
				class=${btn('primary')}
				popovertarget="sheet-panel"
				popovertargetaction="hide"
			>Save changes</button>
		</div>
	</div>
</div>`
