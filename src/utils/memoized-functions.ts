import memoized from 'nano-memoize'
import { default as _condenseWhitespace } from 'condense-whitespace'
import { distance } from 'fastest-levenshtein'
import { interopImportCJSDefault } from 'node-cjs-interop'
import _deepMerge from 'ts-deepmerge'
import _dedupe from 'dedupe'

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
