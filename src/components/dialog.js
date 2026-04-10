import { html } from '#/index.js'
import { btn } from '../helpers.js'

export default html`<div>
	<button class=${btn('primary')} popovertarget="dialog-demo">Open Dialog</button>
	<div
		id="dialog-demo"
		popover="auto"
		class="bg-card m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border p-6 backdrop:bg-black/60"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold">Dialog Title</h3>
			<button
				class=${btn('ghost', 'sm')}
				popovertarget="dialog-demo"
				popovertargetaction="hide"
			>
				&times;
			</button>
		</div>
		<p class="text-muted-foreground mb-6 text-sm">
			Uses <code class="font-mono text-xs">popover="auto"</code> — light-dismiss, focus
			management, and Escape key support built in.
		</p>
		<div class="flex justify-end gap-3">
			<button
				class=${btn('outline')}
				popovertarget="dialog-demo"
				popovertargetaction="hide"
			>
				Cancel
			</button>
			<button
				class=${btn('primary')}
				popovertarget="dialog-demo"
				popovertargetaction="hide"
			>
				Confirm
			</button>
		</div>
	</div>
</div>`
