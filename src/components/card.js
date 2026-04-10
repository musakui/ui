import { html } from '#/index.js'

const items = [
	{ title: 'Total Revenue', value: '$45,231', note: '+20.1% from last month' },
	{ title: 'Subscriptions', value: '+2,350', note: '+180.1% from last month' },
	{ title: 'Active Now', value: '+573', note: '+201 since last hour' },
	{ title: 'Open Issues', value: '12', note: '-3 from last week' },
]

export default html`<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
	${items.map(({ title, value, note }) => {
		return html`<div class="bg-card rounded-lg border p-5">
			<p class="text-muted-foreground mb-2 text-sm font-medium">${title}</p>
			<p class="text-2xl font-bold">${value}</p>
			<p class="text-muted-foreground mt-1 text-xs">${note}</p>
		</div>`
	})}
</div>`
