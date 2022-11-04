import { map } from 'rxjs/operators'
import { DOMParser } from 'linkedom'
import { pipe } from 'rxjs'
import memoized from 'nano-memoize'

const parse = memoized(
  pipe(
    map(
      (it: string) =>
        (<unknown>new DOMParser().parseFromString(it, 'text/html')) as Document
    )
  )
)

export default parse
