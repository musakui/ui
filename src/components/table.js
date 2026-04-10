import { html, signal, computed } from '#/index.js'
import { update } from '#/signal/utils.js'
import { cached } from '../helpers.js'

const cols = ['name', 'role', 'status', 'joined']

const sortCol = signal('name')
const sortDir = signal(1)
const tableData = signal([
	{ name: 'Alice', role: 'Engineer', status: 'Active', joined: '2022' },
	{ name: 'Bob', role: 'Designer', status: 'Active', joined: '2023' },
	{ name: 'Carol', role: 'Manager', status: 'On leave', joined: '2021' },
	{ name: 'Dave', role: 'Engineer', status: 'Active', joined: '2020' },
	{ name: 'Eve', role: 'QA', status: 'Inactive', joined: '2024' },
])

const sortedData = computed(() => {
	return tableData.value.toSorted((a, b) => {
		const col = sortCol.value
		const dir = sortDir.value
		return a[col] < b[col] ? -dir : a[col] > b[col] ? dir : 0
	})
})

const sortBy = (col) => {
	if (sortCol.value === col) {
		update(sortDir, (d) => d * -1)
		return
	}
	sortCol.value = col
	sortDir.value = 1
}

const tableRow = cached(TableRow)

export default html`<div class="overflow-hidden overflow-x-auto rounded-lg border">
	<table class="w-full border-collapse">
		<thead>
			<tr class="border-b">
				${cols.map((col) => {
					const ariaSort = computed(() => {
						return sortCol.value === col
							? sortDir.value === 1
								? 'ascending'
								: 'descending'
							: null
					})
					return html`
						<th
							class="sort-arrow text-muted-foreground aria-[sort]:text-foreground cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap uppercase select-none"
							aria-sort=${ariaSort}
							@click=${() => sortBy(col)}
						>
							${col}
						</th>
					`
				})}
			</tr>
		</thead>
		<tbody>
			${computed(() => sortedData.value.map(tableRow))}
		</tbody>
	</table>
</div>`

/** @param {Record<string, string>} row */
function TableRow(row) {
	return html`<tr class="border-b last:border-b-0">
		${cols.map((col) => html`<td class="px-4 py-3 text-sm">${row[col]}</td>`)}
	</tr>`
}
