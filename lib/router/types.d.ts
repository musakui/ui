type Rec<T = unknown> = Record<string, T>

export type RouteDefinition<Info extends Rec> = Info & {
	/**
	 * pathname definition
	 *
	 * paths with parameters (e.g. `/:id`) will be matched with `URLPattern`
	 */
	path: string
}

export type RouteMatch<Info extends Rec> = RouteDefinition<Info> & {
	/**
	 * matched path parameters
	 */
	params?: Rec<string | undefined>
}

export type RouteInfo = {
	name?: string

	meta?: Rec
}

export type Renderable = DocumentFragment | string

export type Page = (match: RouteMatch<RouteInfo>) => Renderable

type RouteConfig = RouteInfo & {
	page: Page | (() => Promise<{ default: Page }>)
}

export type RouterOpts = {
	routes: RouteDefinition<RouteConfig>[]

	loadingPage?: () => Renderable

	notFoundPage?: () => Renderable

	errorPage?: (err: unknown) => Renderable
}
