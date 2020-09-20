/*
 * dimer-edge-shiki
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { EdgeContract } from 'edge.js'
import rangeParser from 'parse-numeric-range'
import { Theme, IShikiTheme } from 'shiki-themes'
import { Renderer, utils, component } from 'dimer-edge'
import { ILanguageRegistration } from 'shiki-languages'
import { getHighlighter, loadTheme, getTheme, BUNDLED_LANGUAGES } from 'shiki'

type UnWrapPromise<T> = T extends PromiseLike<infer R> ? R : T

/**
 * Html escape sequences. Copy/pasted from
 * https://github.com/shikijs/shiki/blob/c655ea579930a92a29025b4fb1fce425b17cd947/packages/shiki/src/renderer.ts#L38
 */
const HTML_ESCAPES = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

/**
 * Shiki renderer to render codeblocks using vscode themes and languages.
 */
export class ShikiRenderer {
	private themeToUse: IShikiTheme
	private shikiLanguages: ILanguageRegistration[] = []
	private highlighter?: UnWrapPromise<ReturnType<typeof getHighlighter>>

	/**
	 * An object of registered languages. We create the object since the array can be
	 * quite big and looping over all the items will take time.
	 */
	private registeredLanguagesIds = {}

	constructor(private basePath: string) {
		BUNDLED_LANGUAGES.forEach((lang) => this.registerLanguage(lang))
	}

	/**
	 * Register the language id and aliases
	 */
	private registerLanguage(language: ILanguageRegistration) {
		this.registeredLanguagesIds[language.id] = true
		if (language.aliases) {
			language.aliases.forEach((alias) => {
				this.registeredLanguagesIds[alias] = true
			})
		}
	}

	/**
	 * Wraps code inside pre tag
	 */
	private wrapToPre(code: string, lang: string) {
		return `<pre class="dimer-edge-shiki language-${lang}" style="background-color: ${this.themeToUse.bg}"><code>${code}</code></pre>`
	}

	/**
	 * Returns the classes to the used by the code line
	 */
	private getLineClasses(line: number, highlights?: number[]) {
		if (!highlights) {
			return 'line'
		}

		return highlights.includes(line) ? 'line highlight' : 'line dim'
	}

	/**
	 * Returns true when language id is one of the plain text
	 * languages.
	 */
	private isPlaintext(language: string) {
		return ['plaintext', 'txt', 'text'].includes(language)
	}

	/**
	 * Escapes html
	 */
	private escapeHtml(html: string) {
		return html.replace(/[&<>"']/g, (chr) => HTML_ESCAPES[chr])
	}

	/**
	 * Use an existing theme
	 */
	public useTheme(name: Theme): this {
		this.themeToUse = getTheme(name)
		return this
	}

	/**
	 * Load a custom theme
	 */
	public loadTheme(pathToTheme: string): this {
		this.themeToUse = loadTheme(join(this.basePath, pathToTheme))
		return this
	}

	/**
	 * Load a custom language
	 */
	public loadLanguage(language: ILanguageRegistration): this {
		language.path = join(this.basePath, language.path)
		this.shikiLanguages.push(language)
		this.registerLanguage(language)
		return this
	}

	/**
	 * Boot to instantiate the highlighter. Must be done only once
	 */
	public async boot() {
		if (this.highlighter) {
			return
		}

		if (!this.themeToUse) {
			this.useTheme('material-theme-default')
		}

		this.highlighter = await getHighlighter({
			langs: this.shikiLanguages,
			theme: this.themeToUse,
		})
	}

	/**
	 * Render code string and get HTML back
	 */
	public render(code: string, language?: string, highlights?: number[]): string {
		language = language || 'text'

		/**
		 * Render as text when language is not registered
		 */
		if (!this.registeredLanguagesIds[language]) {
			language = 'text'
		}

		/**
		 * Plain text languages cannot be tokenized and hence we have
		 * to render them as it is
		 */
		if (this.isPlaintext(language)) {
			return this.wrapToPre(
				`<div class="line"><span style="color: ${this.themeToUse.fg}">${this.escapeHtml(
					code
				)}</span></div>`,
				'text'
			)
		}

		/**
		 * Tokenize code
		 */
		const tokens = this.highlighter!.codeToThemedTokens(code, language, {
			includeExplanation: false,
		})!

		/**
		 * Build HTML with support for line highlighting
		 */
		let html = ''
		tokens.forEach((group, index) => {
			html += `<div class="${this.getLineClasses(index + 1, highlights)}">`
			group.forEach((token) => {
				html += `<span style="color: ${token.color || this.themeToUse.fg}">${this.escapeHtml(
					token.content
				)}</span>`
			})
			html += `</div>`
		})

		return this.wrapToPre(html, language)
	}

	/**
	 * Dimer edge renderer init hook
	 */
	public handleCodeBlocks = (renderer: Renderer, edge: EdgeContract) => {
		edge.registerTemplate('dimer::shiki::pre', { template: '{{{code}}}' })
		renderer.hook((node) => {
			if (node.tag !== 'pre') {
				return
			}

			const code = node.children.find((child) => child.type === 'element' && child.tag === 'code')
			if (!code) {
				return
			}

			const codeText = utils.getText(code)
			const classes = utils.getClasses(node)
			const language = classes[0] ? classes[0].replace('language-', '') : undefined
			const dataLine = node.props && node.props.dataLine

			const lineHighlights = dataLine ? rangeParser(dataLine) : undefined
			return component('dimer::shiki::pre', {
				code: this.render(codeText, language, lineHighlights),
			})
		})
	}
}
