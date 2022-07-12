import { filter, map } from 'rxjs/operators'
import condenseWhitespace from 'condense-whitespace'
import isString from '@stdlib/assert-is-string'
import isStringBlank from 'is-string-blank'
import { pipe } from 'rxjs'
import memoized from 'nano-memoize'

const condense = memoized(map<string, string>(condenseWhitespace))
const validate = memoized(
  pipe(
    map((it) => it?.valueOf() ?? it),
    filter((it): it is string => isString.isPrimitive(it))
  )
)
const notBlank = filter<string>((it) => !isStringBlank(it))
const trim = map<string, string>((it) => it.trim())

export default { condense, validate, notBlank, trim }
