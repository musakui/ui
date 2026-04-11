/**
 * open a database with the given name
 *
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open)
 *
 * @param {string} name name of database
 * @param {import('./types').DbOptions} [opts]
 */
export async function openDB(name, opts) {
	const req = indexedDB.open(name, opts?.version)

	const { upgrade, blocked } = opts ?? {}
	if (blocked) req.addEventListener('blocked', blocked)
	if (upgrade) {
		req.addEventListener('upgradeneeded', (evt) => {
			upgrade.bind(req)(/** @type {IDBTransaction} */ (req.transaction), evt)
		})
	}

	return await promisify(req)
}

/**
 * get a `Promise` for the given request
 *
 * @template Result
 * @param {IDBRequest<Result>} req request
 * @returns {Promise<Result>}
 */
export function promisify(req) {
	return new Promise((resolve, reject) => {
		listen(req, {
			error: () => reject(req.error),
			success: () => resolve(req.result),
		})
	})
}

/**
 * get a `Promise` for when the given transaction completes
 *
 * @param {IDBTransaction} tx transaction
 * @returns {Promise<void>}
 */
export function txDone(tx) {
	return new Promise((complete, reject) => {
		const error = () => reject(tx.error)
		listen(tx, { complete, error, abort: error })
	})
}

/**
 * @template {EventTarget} Target
 * @param {Target} tg
 * @param {Record<string, () => void>} handlers
 */
function listen(tg, handlers) {
	const cont = new AbortController()
	const opts = { once: true, signal: cont.signal }
	for (const [name, fn] of Object.entries(handlers)) {
		tg.addEventListener(name, () => (fn(), cont.abort()), opts)
	}
}