import { promisify, txDone } from './core.js'

/**
 * create stores and indexes for a database
 *
 * @param {IDBDatabase} db
 * @param {Record<string, import('./types').StoreParams>} stores
 */
export function createStores(db, stores) {
	for (const [name, { indexes, ...opts }] of Object.entries(stores)) {
		const store = db.createObjectStore(name, opts)
		for (const idxOpt of indexes ?? []) {
			const { name: idx, path, ...io } = idxOpt
			store.createIndex(idx, path, io)
		}
	}
}

/**
 * iterate over a cursor
 *
 * @template {IDBCursor} Cursor
 * @param {IDBRequest<Cursor | null>} req
 */
export async function* cursorIterator(req) {
	let cur = await promisify(req)
	while (cur) {
		const nextCur = promisify(req)
		yield cur
		cur = await nextCur
	}
}

/**
 * get a store in a transaction
 *
 * @param {IDBTransaction} tx db transaction
 * @param {string} [name] store name. defaults to the first store
 */
export function txStore(tx, name) {
	return tx.objectStore(name || tx.objectStoreNames[0])
}

/**
 * run a function in a transaction
 *
 * @template Result
 * @param {IDBTransaction} tx transaction
 * @param {(store: IDBObjectStore) => Promise<Result>} fn
 */
export async function runFn(tx, fn) {
	return (await Promise.all([fn(txStore(tx)), txDone(tx)]))[0]
}

/**
 * iterate over a cursor in a transaction
 *
 * @template {IDBCursor} Cursor
 * @param {IDBTransaction} tx transaction
 * @param {(st: IDBObjectStore) => IDBRequest<Cursor | null>} fn
 */
export async function* runCursor(tx, fn) {
	const done = txDone(tx)
	try {
		for await (const cur of cursorIterator(fn(txStore(tx)))) {
			yield cur
		}
	} finally {
		await done
	}
}
