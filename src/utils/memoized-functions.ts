import memoized from 'nano-memoize'
import { default as _condenseWhitespace } from 'condense-whitespace'
import { distance } from 'fastest-levenshtein'
import { interopImportCJSDefault } from 'node-cjs-interop'
import _deepMerge from 'ts-deepmerge'
import _dedupe from 'dedupe'
// eslint-disable-next-line import/no-unresolved
import { crush, Opts } from 'html-crush'

export const condenseWhitespace = memoized(_condenseWhitespace)

export const closest = memoized((source: string, ...targets: string[]) => {
  let distribution = Number.POSITIVE_INFINITY
  let result: string | undefined
  for (const target of targets) {
    const current = distance(source, target)
    if (distribution < current) {
      result = target
      distribution = current
    }
  }
  return { source, result, distance: distribution }
})

export const deepMerge: ReturnType<typeof memoized<typeof _deepMerge>> =
  memoized(interopImportCJSDefault(_deepMerge))

export const dedupe = memoized(_dedupe)

// const encoder = new TextEncoder()
// const decoder = new TextDecoder()

// export const minifyHtml = memoized(
//   (
//     html: string,
//     options: {
//       /** Do not minify DOCTYPEs. Minified DOCTYPEs may not be spec compliant. */
//       do_not_minify_doctype?: boolean
//       /** Ensure all unquoted attribute values in the output do not contain any characters prohibited by the WHATWG specification. */
//       ensure_spec_compliant_unquoted_attribute_values?: boolean
//       /** Do not omit closing tags when possible. */
//       keep_closing_tags?: boolean
//       /** Do not omit `<html>` and `<head>` opening tags when they don't have attributes. */
//       keep_html_and_head_opening_tags?: boolean
//       /** Keep spaces between attributes when possible to conform to HTML standards. */
//       keep_spaces_between_attributes?: boolean
//       /** Keep all comments. */
//       keep_comments?: boolean
//       /**
//        * If enabled, content in `<script>` tags with a JS or no [MIME type](https://mimesniff.spec.whatwg.org/#javascript-mime-type) will be minified using [minify-js](https://github.com/wilsonzlin/minify-js).
//        */
//       minify_js?: boolean
//       /**
//        * If enabled, CSS in `<style>` tags and `style` attributes will be minified.
//        */
//       minify_css?: boolean
//       /** Remove all bangs. */
//       remove_bangs?: boolean
//       /** Remove all processing_instructions. */
//       remove_processing_instructions?: boolean
//     }
//   ) => decoder.decode(_minifyHtml.minify(encoder.encode(html), options))
// )

export const minifyHtml = memoized(
  (html: string, options?: Partial<Opts>) =>
    crush(html, {
      removeLineBreaks: true,
      removeHTMLComments: true,
      removeCSSComments: true,
      ...options
    }).result
)
