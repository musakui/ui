import { isStr } from '#/util/type.js'
import { handleNavigate, createMatcher } from './core.js'

/**
 * @param {import('./types').RouterOpts} opts
 */
export function createRouter(opts) {
	const matcher = createMatcher(opts.routes)

	let curLoadId = 0

	/**
	 * @param {import('./types').RouteMatch | null} match
	 * @param {AbortSignal} [sig]
	 */
	async function loadPage(match, sig) {
		if (!match) {
			opts.render(null)
			return
		}

		const loadId = ++curLoadId

		try {
			const redirect = await opts.onBeforeLoad?.(match, sig)
			if (redirect) {
				navigation.navigate(redirect)
				return
			}

			const { page, ...ctx } = match
			const maybePage = page(ctx, sig)

			raceTimeout(maybePage, 99).then((r) => {
				if (!r || loadId !== curLoadId || sig?.aborted) return
				opts.render()
			})

			const res = await maybePage
			const content = res
				? isStr(res) || !('default' in res)
					? res
					: await res.default(ctx, sig)
				: ''
			if (loadId !== curLoadId || sig?.aborted) return
			opts.render(content)
			return match
		} catch (err) {
			if (loadId !== curLoadId || sig?.aborted) return
			opts.render(/** @type {Error} */ (err))
		}
	}

	const dispose = handleNavigate((evt, pathname) => {
		const m = matcher(pathname)
		const redirect = opts.onBeforeNav?.(evt, m)
		if (redirect) {
			evt.preventDefault()
			navigation.navigate(redirect)
			return
		}

		evt.intercept({
			async handler() {
				const dst = await loadPage(m, evt.signal)
				if (dst) await opts.onAfterLoad?.(evt, dst)
			},
		})
	})

	opts.render()
	loadPage(matcher(location.pathname)).catch(() => {})

	return dispose
}

const TIMEOUT = {}

/**
 * @param {unknown} prom
 * @param {number} timeout
 * @returns timed out?
 */
async function raceTimeout(prom, timeout) {
	let timer
	const rc = new Promise((r) => {
		timer = setTimeout(() => r(TIMEOUT), timeout)
	})
	try {
		return (await Promise.race([prom, rc])) === TIMEOUT
	} catch {
		return false
	} finally {
		clearTimeout(timer)
	}
}
