import { html, signal } from '#/index.js'
import { btn, checkModel } from '../helpers.js'

const clickCount = signal(0)
const btnDisabled = signal(false)

export default html`<div class="flex flex-col gap-6">
	<div>
		<p class="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
			Variants
		</p>
		<div class="flex flex-wrap gap-2">
			<button class=${btn()}>Default</button>
			<button class=${btn('primary')}>Primary</button>
			<button class=${btn('destructive')}>Destructive</button>
			<button class=${btn('ghost')}>Ghost</button>
			<button class=${btn('outline')}>Outline</button>
			<button class=${btn('link')}>Link</button>
		</div>
	</div>
	<div>
		<p class="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
			Sizes
		</p>
		<div class="flex flex-wrap items-center gap-2">
			<button class=${btn('default', 'sm')}>Small</button>
			<button class=${btn('default')}>Medium</button>
			<button class=${btn('default', 'lg')}>Large</button>
		</div>
	</div>
	<div class="flex flex-wrap items-center gap-4">
		<button
			class=${btn('primary')}
			?disabled=${btnDisabled}
			@click=${() => ++clickCount.value}
		>
			Clicked ${clickCount} times
		</button>
		<label class="flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" ${checkModel(btnDisabled)} />
			Disable button
		</label>
	</div>
</div>`
