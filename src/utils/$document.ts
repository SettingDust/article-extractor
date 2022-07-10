import { map } from 'rxjs/operators'
import { parseHTML } from 'linkedom'
import { pipe, pluck } from 'rxjs'
import memoized from 'nano-memoize'

const parse = memoized(
  pipe(map<string, Window & typeof globalThis>(parseHTML), pluck('document'))
)

export default parse
