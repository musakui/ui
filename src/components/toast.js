import { html, signal, computed, registerEffect } from '#/index.js'
import { update } from '#/signal/utils.js'
import { btn, cached } from '../helpers.js'

/** @typedef {'success' | 'warning' | 'error'} ToastType */
/** @typedef {ReturnType<typeof createToast>} Toast */

const toastList = signal(/** @type {Toast[]} */ ([]))

const toastItem = cached(ToastItem)
const toasts = computed(() => toastList.value.map(toastItem))

const showToasts = computed(() => !!toastList.value.length)

/**
 * @param {string} msg
 * @param {ToastType} [type]
 */
const createToast = (msg, type) => ({ msg, type, exit: signal(false) })

/** @param {Toast} t */
const dismiss = (t) => {
	t.exit.value = true
	setTimeout(() => update(toastList, (ts) => ts.filter((tt) => tt !== t)), 300)
}

/**
 * @param {string} msg
 * @param {object} [opts]
 * @param {ToastType} [opts.type]
 * @param {number} [opts.duration]
 */
export const addToast = (msg, opts) => {
	const toast = createToast(msg, opts?.type ?? 'default')
	update(toastList, (v) => [...v, toast])

	const dur = opts?.duration ?? 3000
	if (dur > 0) setTimeout(() => dismiss(toast), dur)

	return toast
}

export default html`<div class="flex flex-wrap gap-2">
	<button class=${btn()} @click=${() => addToast('Default notification.')}>
		Default
	</button>
	<button
		class=${btn('primary')}
		@click=${() => addToast('Changes saved successfully.', { type: 'success' })}
	>
		Success
	</button>
	<button
		class=${btn('destructive')}
		@click=${() => addToast('Something went wrong.', { type: 'error' })}
	>
		Error
	</button>
</div>
<div
	popover="manual"
	class="inset-[unset] right-6 bottom-6 flex w-80 flex-col gap-2 bg-transparent"
	${togglePopover}
>
	${toasts}
</div>`

/** @param {Toast} t */
function ToastItem(t) {
	return html`<div
		data-type=${t.type}
		?data-exit=${t.exit}
		class="bg-card border-l-border data-[type=error]:border-l-destructive flex items-center justify-between gap-3 rounded-md border border-l-4 px-4 py-3 text-sm shadow-lg transition-all duration-300 data-exit:translate-x-8 data-exit:opacity-0 data-[type=success]:border-l-green-900"
	>
		<span>${t.msg}</span>
		<button
			class="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer border-none bg-transparent"
			@click=${() => dismiss(t)}
		>
			&times;
		</button>
	</div>`
}

/** @param {HTMLElement} el */
function togglePopover(el) {
	registerEffect(el, () => {
		if (showToasts.value) {
			el.showPopover()
		} else {
			el.hidePopover()
		}
	})
}
