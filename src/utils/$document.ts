import { map } from 'rxjs/operators'
import { parseHTML } from 'linkedom'
import { pipe, pluck } from 'rxjs'

export const parse = pipe(
  map<string, Window & typeof globalThis>(parseHTML),
  pluck('document')
)

export default parse
