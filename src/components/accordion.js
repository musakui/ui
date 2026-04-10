import { html } from '#/index.js'

const items = [
	{
		question: 'Is it accessible?',
		answer:
			'Yes. Built with semantic ARIA attributes — aria-expanded, aria-selected, aria-checked, and aria-sort.',
	},
	{
		question: 'Is it styled?',
		answer:
			'Yes. Tailwind utilities handle layout and color. ARIA variants like group-aria-expanded:rotate-45 drive state changes without conditional classes.',
	},
	{
		question: 'Is it reactive?',
		answer:
			'Yes. Signals and computed values power all state. Effects are node-scoped and auto-cleaned via FinalizationRegistry.',
	},
]

export default html`<div class="divide-border divide-y overflow-hidden rounded-lg border">
	${items.map(({ question, answer }) => {
		return html`<details class="group">
			<summary
				class="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-medium"
			>
				${question}
				<span
					class="ml-4 shrink-0 text-lg leading-none transition-transform duration-200 group-open:rotate-45"
				>+</span>
			</summary>
			<p class="text-muted-foreground px-4 pb-4 text-sm">${answer}</p>
		</details>`
	})}
</div>`
