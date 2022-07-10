import {
  from,
  map,
  Observable,
  ObservableInput,
  of,
  pipe,
  switchMap
} from 'rxjs'
import { MetaExtractor } from './index.js'

export const $operators = <T>(extractors: {
  [key: string]: MetaExtractor<T>
}) =>
  pipe(
    map<Document, Observable<Document>>(of),
    switchMap<Observable<Document>, ObservableInput<T>>((document) =>
      from(Object.values(extractors)).pipe(switchMap((it) => it(document)))
    )
  )
