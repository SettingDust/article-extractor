import { Extractor } from './utils'

export const extractors: Extractor<unknown, unknown>[] = await Promise.all([
  import('./title'),
  import('./link'),
  import('./author'),
  import('./author-url'),
  import('./published-date'),
  import('./modified-date')
]).then((it) => it.map((it) => it.default))
