import { upgradeHandlers } from './upgrade.js'
upgradeHandlers()

export * from './signal/index.js'
export { html } from './tag/html.js'

/** @typedef {import('./tag/templateFragment').TemplateFragment<'html'>} HtmlFragment */
