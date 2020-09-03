import { join } from 'path'
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { ShikiRenderer } from '../src/Renderer'

async function boot() {
	const renderer = new ShikiRenderer(__dirname)
	await renderer
		.useTheme('github-light')
		.loadLanguage({
			id: 'edge',
			scopeName: 'text.html.edge',
			path: './edge.tmLanguage.json',
		})
		.boot()
	return renderer
}

function getSamples() {
	return [
		readFileSync(join(__dirname, 'content', 'sample1.txt'), 'utf8'),
		readFileSync(join(__dirname, 'content', 'sample2.txt'), 'utf8'),
		readFileSync(join(__dirname, 'content', 'sample3.txt'), 'utf8'),
		readFileSync(join(__dirname, 'content', 'sample4.txt'), 'utf8'),
	]
}

function wrapOutput(samples: [string, string, string, string]) {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title></title>
	<style type="text/css">
		pre {
			padding: 40px 0;
			font-size: 15px;
			line-height: 1.9;
			font-family: 'Jetbrains Mono';
			overflow-x: auto;
			border: 1px solid #14243e1a;
			border-radius: 4px;
		}

		pre code {
			display: inline-block;
    	min-width: 100%;
		}

		pre:hover .dim {
			opacity: 1;
		}

		pre .line {
			padding: 0 20px;
		}

		.highlight {
			position: relative;
		  background-color: rgb(136 141 160 / 13%);
    	border-left: 3px solid rgb(168 184 253);
		}

		.highlight span {
			z-index: 1;
			position: relative;
		}
	</style>
</head>
<body>
	<div>
		<h1> Sample 1 </h1>
		<div>
			${samples[0]}
		</div>

		<hr>

		<h1> Sample 2 </h1>
		<div>
			${samples[1]}
		</div>

		<hr>

		<h1> Sample 3 </h1>
		<div>
			${samples[2]}
		</div>

		<hr>

		<h1> Sample 4 </h1>
		<div>
			${samples[3]}
		</div>
	</div>
</body>
</html>`
}

boot().then((renderer) => {
	createServer((req, res) => {
		try {
			const samples = getSamples()
			if (req.url === '/line-highlights') {
				const output = wrapOutput([
					renderer.render(samples[0], 'js', [2, 3]),
					renderer.render(samples[1], 'ts', [1, 4]),
					renderer.render(samples[2], undefined, [1, 4]),
					renderer.render(samples[3], 'edge', [1, 4]),
				])
				res.writeHead(200, { 'content-type': 'text/html' })
				res.end(output)
				return
			}

			const output = wrapOutput([
				renderer.render(samples[0], 'js'),
				renderer.render(samples[1], 'ts'),
				renderer.render(samples[2]),
				renderer.render(samples[3], 'edge'),
			])
			res.writeHead(200, { 'content-type': 'text/html' })
			res.end(output)
		} catch (error) {
			res.writeHead(500, { 'content-type': 'text/plain' })
			res.end(error.stack)
		}
	}).listen(3000, () => {
		console.log(`Listening on http://localhost:3000`)
	})
})
