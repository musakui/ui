export type DbOptions = {
	/** schema version (defaults to current version) */
	version?: number

	/**
	 * called if the requested version is new (based on the `upgradeneeded` event)
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)
	 */
	upgrade?(this: IDBOpenDBRequest, txn: IDBTransaction, evt: IDBVersionChangeEvent): void

	/**
	 * called if there are older versions of the database open on the origin
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/blocked_event)
	 */
	blocked?(this: IDBOpenDBRequest, evt: IDBVersionChangeEvent): void
}

interface IndexParams extends IDBIndexParameters {
	/** name of the index */
	name: string

	/** `keyPath` for the index */
	path: string | Iterable<string>
}

export interface StoreParams extends IDBObjectStoreParameters {
	/** indexes to create on the store */
	indexes?: IndexParams[]
}
