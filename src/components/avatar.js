import { html } from '#/index.js'

const people = [
	{ initials: 'CN', bg: 'bg-accent text-accent-foreground', name: 'Claude' },
	{ initials: 'AB', bg: 'bg-blue-600 text-white', name: 'Alice Brown' },
	{ initials: 'MK', bg: 'bg-violet-600 text-white', name: 'Mike Kim' },
	{ initials: 'SL', bg: 'bg-rose-600 text-white', name: 'Sara Lee' },
]

const sizes = [
	{ label: 'sm', cls: 'size-7 text-xs' },
	{ label: 'md', cls: 'size-10 text-sm' },
	{ label: 'lg', cls: 'size-14 text-base' },
]

export default html`<div class="flex flex-col gap-8">
	<div>
		<p class="mb-4 text-sm font-medium">Sizes</p>
		<div class="flex flex-wrap items-end gap-6">
			${sizes.map(({ label, cls }) => {
				const avatarCls = `rounded-full ${cls} ${people[0].bg} flex items-center justify-center font-semibold`
				return html`<div class="flex flex-col items-center gap-2">
					<div class=${avatarCls}>${people[0].initials}</div>
					<span class="text-muted-foreground text-xs">${label}</span>
				</div>`
			})}
		</div>
	</div>
	<div>
		<p class="mb-4 text-sm font-medium">Avatar group</p>
		<div class="flex -space-x-3">
			${people.map(({ initials, bg, name }) => {
				const cls = `rounded-full size-10 text-sm ${bg} flex items-center justify-center font-semibold ring-2 ring-background`
				return html`<div class=${cls} title=${name}>${initials}</div>`
			})}
		</div>
	</div>
</div>`
