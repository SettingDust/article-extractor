import {
  from,
  map,
  Observable,
  ObservableInput,
  of,
  pipe,
  switchMap
} from 'rxjs'
import { MetaExtractor } from '.'
import memoized from 'nano-memoize'

export const $operators = memoized(
  <T>(extractors: { [key: string]: MetaExtractor<T> }) =>
    pipe(
      map<Document, Observable<Document>>((it) => of(it)),
      switchMap<Observable<Document>, ObservableInput<T>>((document) =>
        from(Object.values(extractors)).pipe(switchMap((it) => it(document)))
      )
    )
)
