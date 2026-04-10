import { html, signal } from '#/index.js'

const alerts = [
	{
		cls: '',
		icon: 'ℹ',
		title: 'Heads up!',
		desc: 'You can add components to your app using the CLI.',
	},
	{
		cls: 'border-green-700/40 bg-green-700/5 text-green-800 dark:text-green-400',
		icon: '✓',
		title: 'Success',
		desc: 'Your changes have been saved successfully.',
	},
	{
		cls: 'border-yellow-500/40 bg-yellow-500/5 text-yellow-800 dark:text-yellow-400',
		icon: '⚠',
		title: 'Warning',
		desc: 'Your free plan usage is at 90%. Upgrade to continue.',
	},
	{
		cls: 'border-destructive/40 bg-destructive/5 text-destructive',
		icon: '✕',
		title: 'Error',
		desc: 'Failed to save changes. Please try again.',
	},
]

export default html`<div class="flex max-w-lg flex-col gap-3">
	${alerts.map(({ cls, icon, title, desc }) => {
		const dismissed = signal(false)
		return html`<div
			role="alert"
			?hidden=${dismissed}
			class=${'relative flex gap-3 rounded-lg border p-4 ' + cls}
		>
			<span class="mt-0.5 shrink-0 text-base leading-none">${icon}</span>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">${title}</p>
				<p class="mt-1 text-sm opacity-80">${desc}</p>
			</div>
			<button
				aria-label="Dismiss"
				class="absolute top-3 right-3 border-none bg-transparent leading-none text-current opacity-50 hover:opacity-100"
				@click=${() => (dismissed.value = true)}
			>
				&times;
			</button>
		</div>`
	})}
</div>`
