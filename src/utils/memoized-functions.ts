import memoized from 'nano-memoize'
import { default as _condenseWhitespace } from 'condense-whitespace'
import { distance } from 'fastest-levenshtein'

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
