import { html } from '#/index.js'

const badge = (variant = 'default') =>
	`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
		{
			default: 'bg-muted text-foreground border-transparent',
			primary: 'bg-accent text-accent-foreground border-transparent',
			secondary: 'text-muted-foreground',
			destructive: 'bg-destructive text-destructive-foreground border-transparent',
			outline: 'text-foreground',
		}[variant] ?? ''
	}`

export default html`<div class="flex flex-wrap gap-2">
	<span class=${badge()}>Default</span>
	<span class=${badge('primary')}>Primary</span>
	<span class=${badge('secondary')}>Secondary</span>
	<span class=${badge('destructive')}>Destructive</span>
	<span class=${badge('outline')}>Outline</span>
</div>`
