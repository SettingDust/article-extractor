import { DOMParser } from 'linkedom'
import memoized from 'nano-memoize'

export default memoized(
  (it: string) =>
    (<unknown>new DOMParser().parseFromString(it, 'text/html')) as Document
)
