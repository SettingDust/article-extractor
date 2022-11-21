import { build as _build, BuildOptions } from 'esbuild'
import _merge from 'ts-deepmerge'
import { interopImportCJSDefault } from 'node-cjs-interop'
import { dtsPlugin } from 'esbuild-plugin-d.ts'
import nodeExternals from 'esbuild-plugin-node-externals'
import * as fs from 'node:fs/promises'
import path from 'node:path'
// eslint-disable-next-line import/no-unresolved
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

const merge = interopImportCJSDefault(_merge)
const commonOptions = <BuildOptions>{
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  color: true,
  logLevel: 'info'
}
const build = (options: BuildOptions) => _build(merge(commonOptions, options))

await fs.rm('dist', { recursive: true, force: true })

await build({
  target: 'node16',
  platform: 'node',
  outfile: 'dist/article-extractor.node.js',
  plugins: [
    dtsPlugin(),
    nodeExternals({
      packagePaths: './package.json'
    })
  ]
})

await build({
  target: 'es2022',
  platform: 'neutral',
  outfile: 'dist/article-extractor.esm.js',
  mainFields: ['module', 'main'],
  conditions: ['import', 'default'],
  plugins: [polyfillNode()]
})

await build({
  target: 'es2022',
  platform: 'browser',
  outfile: 'dist/article-extractor.browser.js',
  plugins: [
    {
      name: 'browser-resolver',
      setup(build) {
        build.onResolve(
          { filter: /^@microsoft\/recognizers-text-date-time/ },
          () => ({
            path: path.join(
              process.cwd(),
              'node_modules/@microsoft/recognizers-text-date-time/dist/recognizers-text-date-time.es5.js'
            )
          })
        )
        build.onResolve({ filter: /^linkedom/ }, () => ({
          path: path.join(process.cwd(), 'src/browser/linkedom.ts')
        }))
      }
    }
  ]
})
