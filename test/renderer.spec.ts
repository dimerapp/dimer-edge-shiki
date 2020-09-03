/*
 * dimer-edge-shiki
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Edge } from 'edge.js'
import { Renderer } from 'dimer-edge'
import Markdown from '@dimerapp/markdown'
import { ShikiRenderer } from '../src/Renderer'

test.group('ShikiRenderer', () => {
	test('render codeblocks using shiki', async (assert) => {
		/**
		 * Setup edge
		 */
		const edge = new Edge()
		edge.registerTemplate('guides', { template: '@dimerTree(doc.contents.children)~' })

		/**
		 * Setup renderer and shiki plugin
		 */
		const renderer = new Renderer(edge)
		const shiki = new ShikiRenderer(__dirname)
		renderer.use(shiki.handleCodeBlocks)

		/**
		 * Boot by loading themes and languages
		 */
		await shiki.boot()

		const markdown = [
			'```js',
			`const Markdown = require('@dimerapp/markdown')`,
			`const markdown = new Markdown(contents)`,
			`const tokens = await markdown.toJSON()`,
			`console.log(tokens)`,
			`/**`,
			`* { type: 'text', value: 'something' }`,
			`*/`,
			'```',
		].join('\n')

		/**
		 * Render
		 */
		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { doc: ast })

		assert.isTrue(html.includes('<pre class="dimer-edge-shiki"'))
	})

	test('highlight mentioned line ranges', async (assert) => {
		/**
		 * Setup edge
		 */
		const edge = new Edge()
		edge.registerTemplate('guides', { template: '@dimerTree(doc.contents.children)~' })

		/**
		 * Setup renderer and shiki plugin
		 */
		const renderer = new Renderer(edge)
		const shiki = new ShikiRenderer(__dirname)
		renderer.use(shiki.handleCodeBlocks)

		/**
		 * Boot by loading themes and languages
		 */
		await shiki.boot()

		const markdown = [
			'```js{1-3,5}',
			`const Markdown = require('@dimerapp/markdown')`,
			`const markdown = new Markdown(contents)`,
			`const tokens = await markdown.toJSON()`,
			`console.log(tokens)`,
			`/**`,
			`* { type: 'text', value: 'something' }`,
			`*/`,
			'```',
		].join('\n')

		/**
		 * Render
		 */
		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { doc: ast })

		const lines = html.split('class="line')
		assert.isTrue(lines[1].startsWith(' highlight'))
		assert.isTrue(lines[2].startsWith(' highlight'))
		assert.isTrue(lines[3].startsWith(' highlight'))
		assert.isFalse(lines[4].startsWith(' highlight'))
		assert.isTrue(lines[5].startsWith(' highlight'))
	})
})
