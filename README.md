# Dimer edge shiki
> A dimer renderer hook to use shiki for processing code blocks.

[![circleci-image]][circleci-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

Wouldn't it be awesome, if we can make the markdown codeblocks render the same way VScode renders the code? Well, we can. There is no need to use PrismJS or Highlight.js to format the codeblocks in the browser. Now, you have several tools at our disposal to process codeblocks on server side using the same libraries used by VSCode.

This package uses [shiki](https://shiki.matsu.io), which in-turn leverages VsCode color schemes and languages to format a piece of code and outputs it in the HTML format. You don't have to write any frontend Javascript or even CSS.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Installation](#installation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation
Install the package from npm registry as follows:

```sh
npm i dimer-edge-shiki
```

Then register it is a plugin with [dimer-edge](https://npm.im/dimer-edge)

```ts
import { Renderer } from 'dimer-edge'
import { ShikiRenderer } from 'dimer-edge-shiki'

const renderer = new Renderer(edge)
const shiki = new ShikiRenderer()

/**
 * You must boot only once
 */
await shiki.useTheme('github-light').boot()

/**
 * Tell dimer-edge to use shiki for rendering codeblocks.
 * All done :)
 */
renderer.use(shiki.handleCodeBlocks)
```

[circleci-image]: https://img.shields.io/circleci/project/github/dimerapp/dimer-edge-shiki/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/dimerapp/dimer-edge-shiki "circleci"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/dimer-edge-shiki.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/dimer-edge-shiki "npm"

[license-image]: https://img.shields.io/npm/l/dimer-edge-shiki?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
