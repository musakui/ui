import { html, computed } from '#/index.js'
import { text } from './state.js'
import { $str } from './utils/signal.js'
import Counter from './components/counter.js'
import * as Tasks from './components/tasks.js'

export default function () {
	return html`<main class="max-w-xl">
		<h1 class="p-4 text-2xl">Vite Starter Template</h1>
		<div class="grid items-center gap-2 p-4">
			${Counter()}
			<div class="grid gap-2">
				<label for="task" class="flex items-center text-sm font-medium">Task</label>
				<div class="flex">
					<input
						id="task"
						type="text"
						placeholder="What do you need to do next?"
						class="bg-background h-9 w-full rounded-md border px-3 py-2 text-sm"
						${$str(text)}
					/>
					<button
						class="btn"
						?disabled=${computed(() => !text.value.trim())}
						@click=${addTask}
					>
						➕
					</button>
				</div>
			</div>
			<div class="grid min-h-10 gap-2 divide-y rounded-md border p-2">
				${computed(() => {
					return Tasks.list.value.length
						? Tasks.list.value.map(Tasks.TaskItem)
						: html`<div class="text-muted-foreground place-self-center select-none">
								no tasks
							</div>`
				})}
			</div>
		</div>
	</main>`
}

function addTask() {
	const t = text.value.trim()
	if (!t) return
	Tasks.add(t)
	text.value = ''
}
