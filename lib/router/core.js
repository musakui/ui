const MAYBE_DYNAMIC = /[:*{(]/

/**
 * @param {(evt: NavigateEvent, path: string) => void} fn
 */
export function handleNavigate(fn) {
	/** @param {NavigateEvent} evt */
	const handler = (evt) => {
		const url = new URL(evt.destination.url)
		if (url.origin !== location.origin) return
		fn(evt, url.pathname)
	}

	navigation.addEventListener('navigate', handler)
	return () => {
		navigation.removeEventListener('navigate', handler)
	}
}

/**
 * @template {{ path: string }} T
 * @param {T[]} routes
 */
export function createMatcher(routes) {
	/** @type {Map<string, T>} */
	const staticRoutes = new Map()

	/** @type {[URLPattern, T][]} */
	const dynamicRoutes = []

	/** @type {Set<string>} */
	const seen = new Set()

	for (const route of routes) {
		const pathname = route.path
		if (MAYBE_DYNAMIC.test(pathname)) {
			if (seen.has(pathname)) continue
			dynamicRoutes.push([new URLPattern({ pathname }), route])
			seen.add(pathname)
		} else {
			staticRoutes.set(pathname, route)
		}
	}

	/**
	 * @param {string} pathname
	 * @returns {import('./types').MatchedRoute<T> | null}
	 */
	return (pathname) => {
		const sm = staticRoutes.get(pathname)
		if (sm) return sm

		for (const [pattern, match] of dynamicRoutes) {
			const m = pattern.exec({ pathname })
			if (!m) continue
			return {
				...match,
				path: pathname,
				params: m.pathname.groups,
			}
		}

		return null
	}
}
