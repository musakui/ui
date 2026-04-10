import { html, signal, computed } from '#/index.js'
import { toggle } from '#/signal/utils.js'
import { btn, popoverAnchor } from '../helpers.js'

const radioVal = signal('comfortable')

export default html`<div class="flex flex-wrap gap-4">
	<div>
		<button id="dd-basic" class=${btn()} popovertarget="dd-basic-menu">
			Open Menu ▾
		</button>
		<div
			id="dd-basic-menu"
			popover="auto"
			class="bg-card inset-[unset] min-w-44 rounded-md border p-1 text-sm shadow-md"
			${popoverAnchor('dd-basic')}
		>
			<div class="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
				My Account
			</div>
			${['Profile', 'Billing', 'Settings'].map((label) => {
				return html`
					<button
						class="hover:bg-muted w-full cursor-pointer rounded border-none bg-transparent px-2 py-1.5 text-left"
						@click=${(e) => e.currentTarget.closest('[popover]')?.hidePopover()}
					>
						${label}
					</button>
				`
			})}
			<hr class="my-1" />
			<button
				class="hover:bg-muted text-destructive w-full cursor-pointer rounded border-none bg-transparent px-2 py-1.5 text-left"
				@click=${(e) => e.currentTarget.closest('[popover]')?.hidePopover()}
			>
				Log out
			</button>
		</div>
	</div>

	<div>
		<button id="dd-check" class=${btn()} popovertarget="dd-check-menu">
			Appearance ▾
		</button>
		<div
			id="dd-check-menu"
			popover="auto"
			class="bg-card inset-[unset] min-w-44 rounded-md border p-1 text-sm shadow-md"
			${popoverAnchor('dd-check')}
		>
			<div class="text-muted-foreground px-2 py-1.5 text-xs font-semibold">View</div>
			${['Toolbar', 'Status Bar', 'Panel'].map((label) => {
				const checked = signal(false)
				return html`<button
					class="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left"
					@click=${toggle(checked)}
				>
					<span class="w-4 text-center text-xs">
						${computed(() => (checked.value ? '✓' : ''))}
					</span>
					${label}
				</button>`
			})}
			<hr class="my-1" />
			<div class="text-muted-foreground px-2 py-1.5 text-xs font-semibold">Density</div>
			${['default', 'comfortable', 'compact'].map((val) => {
				return html`<button
					class="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left"
					@click=${() => (radioVal.value = val)}
				>
					<span class="w-4 text-center text-xs">
						${computed(() => (radioVal.value !== val ? '●' : '○'))}
					</span>
					${val[0].toUpperCase() + val.slice(1)}
				</button>`
			})}
		</div>
	</div>
</div>`
