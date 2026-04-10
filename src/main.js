import './styles.css'
import { html, signal, computed } from '#/index.js'

import buttons from './components/buttons.js'
import badge from './components/badge.js'
import inputs from './components/inputs.js'
import toggle from './components/toggle.js'
import tabs from './components/tabs.js'
import accordion from './components/accordion.js'
import dialog from './components/dialog.js'
import toast from './components/toast.js'
import card from './components/card.js'
import table from './components/table.js'
import alert from './components/alert.js'
import avatar from './components/avatar.js'
import skeleton from './components/skeleton.js'
import progress from './components/progress.js'
import dropdown from './components/dropdown.js'
import combobox from './components/combobox.js'
import sheet from './components/sheet.js'
import pagination from './components/pagination.js'

const sections = [
	{ id: 'buttons', label: 'Buttons', desc: 'Variants, sizes, and disabled state.', component: buttons },
	{ id: 'badge', label: 'Badge', desc: 'Inline labels for status and metadata.', component: badge },
	{ id: 'inputs', label: 'Inputs', desc: 'Text, checkbox, radio, select, and range.', component: inputs },
	{
		id: 'toggle',
		label: 'Toggle',
		desc: html`<code class="font-mono text-xs">role="switch"</code> +
			<code class="font-mono text-xs">aria-checked</code> bound directly to signal — no
			computed needed.`,
		component: toggle,
	},
	{
		id: 'tabs',
		label: 'Tabs',
		desc: html`<code class="font-mono text-xs">aria-selected</code> on tabs,
			<code class="font-mono text-xs">aria-hidden:hidden</code> on panels.`,
		component: tabs,
	},
	{ id: 'accordion', label: 'Accordion', desc: 'Multi-open panels', component: accordion },
	{
		id: 'dialog',
		label: 'Dialog',
		desc: html`Powered by the Popover API — light-dismiss, Escape key, and
			<code class="font-mono text-xs">::backdrop</code> handled natively. No JS state
			needed.`,
		component: dialog,
	},
	{
		id: 'toast',
		label: 'Toast',
		desc: html`Uses <code class="font-mono text-xs">popover="manual"</code> — rendered in the
			top layer, no z-index management needed.`,
		component: toast,
	},
	{ id: 'card', label: 'Card', desc: 'Static content layout — clean baseline, no signals.', component: card },
	{
		id: 'table',
		label: 'Data Table',
		desc: html`Sortable with <code class="font-mono text-xs">computed</code> derived state and
			<code class="font-mono text-xs">aria-sort</code> for direction.`,
		component: table,
	},
	{ id: 'alert', label: 'Alert', desc: 'Contextual feedback — dismisses on close.', component: alert },
	{ id: 'avatar', label: 'Avatar', desc: 'User representation with initials fallback.', component: avatar },
	{ id: 'skeleton', label: 'Skeleton', desc: 'Placeholder while content loads.', component: skeleton },
	{
		id: 'progress',
		label: 'Progress',
		desc: html`Displays completion of a task with
			<code class="font-mono text-xs">aria-valuenow</code> for accessibility.`,
		component: progress,
	},
	{
		id: 'dropdown',
		label: 'Dropdown Menu',
		desc: html`Uses <code class="font-mono text-xs">popover="auto"</code> — light-dismiss and
			Escape key built in.`,
		component: dropdown,
	},
	{
		id: 'combobox',
		label: 'Combobox',
		desc: 'Searchable select — popover opens on trigger, filters as you type.',
		component: combobox,
	},
	{
		id: 'sheet',
		label: 'Sheet',
		desc: html`Extends the Dialog — slides in from any edge using
			<code class="font-mono text-xs">popover="manual"</code> and
			<code class="font-mono text-xs">@starting-style</code>.`,
		component: sheet,
	},
	{
		id: 'pagination',
		label: 'Pagination',
		desc: 'Navigate across pages — current page tracked via signal, ellipsis auto-computed.',
		component: pagination,
	},
]

const activeSection = signal('buttons')

const app = html`
<div class="min-h-screen bg-background text-foreground">
	<nav class="sticky top-0 z-50 flex overflow-x-auto border-b bg-background backdrop-blur-sm">
		${sections.map(({ id, label }) => html`<a
			href=${`#${id}`}
			class="shrink-0 px-3.5 py-2 text-xs font-medium border-b-2 border-b-transparent text-muted-foreground no-underline aria-[current=page]:border-b-foreground aria-[current=page]:text-foreground"
			aria-current=${computed(() => (activeSection.value === id ? 'page' : null))}
		>${label}</a>`)}
	</nav>
	<main class="max-w-3xl mx-auto">
		${sections.map(({ id, label, desc, component }) => html`<section id=${id} class="border-b px-6 py-12">
			<h2 class="text-2xl font-semibold tracking-tight">${label}</h2>
			<p class="text-muted-foreground mt-1 mb-8 text-sm">${desc}</p>
			${component}
		</section>`)}
	</main>
</div>`

document.getElementById('app')?.replaceChildren(app.init())

const io = new IntersectionObserver(
	(entries) => {
		for (const e of entries) {
			if (e.isIntersecting) activeSection.value = e.target.id
		}
	},
	{ rootMargin: '-40% 0px -55% 0px' },
)
document.querySelectorAll('section[id]').forEach((el) => io.observe(el))
