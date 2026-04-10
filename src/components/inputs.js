import { html, signal } from '#/index.js'
import { model, checkModel, radioModel, numModel, input as inputCls } from '../helpers.js'

const textVal = signal('')
const checkA = signal(false)
const checkB = signal(false)
const radioVal = signal('opt1')
const selectVal = signal('b')
const rangeVal = signal(50)

const radioOptions = [
	{ id: 'opt1', label: 'Default' },
	{ id: 'opt2', label: 'Comfortable' },
	{ id: 'opt3', label: 'Compact' },
]

export default html`<div class="flex max-w-sm flex-col gap-6">
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium">Text (model helper)</label>
		<input
			type="text"
			class=${inputCls}
			placeholder="Type something…"
			${model(textVal)}
		/>
		<p class="text-muted-foreground text-xs">Value: ${textVal}</p>
	</div>
	<div class="flex flex-col gap-2">
		<label class="text-sm font-medium">Checkboxes</label>
		<label class="flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" ${checkModel(checkA)} />
			Option A — ${checkA}
		</label>
		<label class="flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" ${checkModel(checkB)} />
			Option B — ${checkB}
		</label>
	</div>
	<div class="flex flex-col gap-2">
		<label class="text-sm font-medium">Radio</label>
		${radioOptions.map(({ id, label }) => {
			return html`<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input type="radio" name="demo-radio" ${radioModel(radioVal, id)} />
				${label}
			</label>`
		})}
		<p class="text-muted-foreground text-xs">Selected: ${radioVal}</p>
	</div>
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium">Select</label>
		<select class=${`${inputCls} appearance-none cursor-pointer`} ${model(selectVal)}>
			<option value="a">Option A</option>
			<option value="b">Option B</option>
			<option value="c">Option C</option>
		</select>
		<p class="text-muted-foreground text-xs">Selected: ${selectVal}</p>
	</div>
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium">Range — ${rangeVal}</label>
		<input type="range" class="w-full" min="0" max="100" ${numModel(rangeVal)} />
	</div>
</div>`
