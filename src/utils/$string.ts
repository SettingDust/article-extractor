import { filter, map, reduce } from 'rxjs/operators'
import condenseWhitespace from 'condense-whitespace'
import isString from '@stdlib/assert-is-string'
import isStringBlank from 'is-string-blank'
import { pipe } from 'rxjs'
import memoized from 'nano-memoize'
import { distance } from 'fastest-levenshtein'

const condense = map<string, string>(memoized(condenseWhitespace))
const validate = pipe(
  map((it) => it?.valueOf() ?? it),
  filter((it): it is string => isString.isPrimitive(it))
)
const notBlank = filter<string>((it) => !isStringBlank(it))
const trim = map<string, string>((it) => it.trim())

const closest = reduce<
  { source: string; target: string },
  { source: string; result: string; distance: number }
>(
  (accumulator, { source, target }) => {
    const distribution = distance(source, target)
    if (distribution < accumulator.distance)
      accumulator = { source, result: target, distance: distribution }
    return accumulator
  },
  { source: '', result: '', distance: Number.POSITIVE_INFINITY }
)

export default { condense, validate, notBlank, trim, closest }
