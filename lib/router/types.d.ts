type Rec<T = unknown> = Record<string, T>

type Awaitable<T> = T | Promise<T>

type MaybeRedirect = string | URL | null | undefined

export type Renderable = DocumentFragment | string

export type Page = (
	match: MatchedRoute<RouteInfo>,
	signal?: AbortSignal
) => Awaitable<Renderable>

export type RouteInfo = {
	name?: string

	meta?: Rec
}

export type RouteDefinition = RouteInfo & {
	/**
	 * pathname definition
	 *
	 * paths with parameters (e.g. `/:id`) will be matched with `URLPattern`
	 */
	path: string

	page: Page | (() => Promise<{ default: Page }>)
}

export type MatchedRoute<T extends Rec> = Omit<T, 'path'> & {
	/**
	 * matched pathname
	 */
	path: string

	/**
	 * matched path parameters
	 */
	params?: Rec<string | undefined>
}

export type RouteMatch = MatchedRoute<RouteDefinition>

export type RouterOpts = {
	routes: RouteDefinition[]

	render(r?: Renderable | Error | null): void

	onBeforeNav?: (evt: NavigateEvent, match: RouteMatch | null) => MaybeRedirect

	onBeforeLoad?: (match: RouteMatch, signal?: AbortSignal) => Awaitable<MaybeRedirect>

	onAfterLoad?: (evt: NavigateEvent, match: RouteMatch) => Awaitable<void>
}
