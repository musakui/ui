import { html, signal, computed } from '#/index.js'

const activeTab = signal(0)

const items = [
	{ label: 'Account', body: 'Manage your account settings and preferences.' },
	{ label: 'Security', body: 'Update your password and security preferences.' },
	{ label: 'Notifications', body: 'Configure how you receive notifications.' },
]

export default html`<div role="tablist" class="flex border-b">
	${items.map(({ label }, i) => {
		return html`<button
			role="tab"
			class="text-muted-foreground aria-selected:border-b-foreground aria-selected:text-foreground cursor-pointer border-b-2 border-b-transparent bg-transparent px-4 py-2.5 text-sm font-medium"
			aria-selected=${computed(() => activeTab.value === i)}
			@click=${() => (activeTab.value = i)}
		>
			${label}
		</button>`
	})}
</div>
${items.map(({ body }, i) => {
	return html`<div
		role="tabpanel"
		class="text-muted-foreground py-5 text-sm aria-hidden:hidden"
		aria-hidden=${computed(() => activeTab.value !== i)}
	>
		${body}
	</div>`
})}`
