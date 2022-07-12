// https://github.com/microlinkhq/metascraper/blob/v5.29.15/packages/metascraper-helpers/index.js#L253-L288=

import { filter, map, switchMap } from 'rxjs/operators'
import { of, OperatorFunction, race } from 'rxjs'
import { parseDate } from 'chrono-node'
import $string from './$string'

const parse: OperatorFunction<string | number, Date> = (input) =>
  race(
    input.pipe(
      $string.validate,
      $string.notBlank,
      $string.condense,
      map((it) => parseDate(it))
    ),
    input.pipe(
      filter((it): it is number => typeof it === 'number'),
      map((it) => of(it)),
      switchMap((it) =>
        race(
          it.pipe(
            filter((it) => it >= 1e16 || it <= -1e16),
            map((it) => Math.floor(it / 1e6))
          ),
          it.pipe(
            filter((it) => it >= 1e14 || it <= -1e14),
            map((it) => Math.floor(it / 1e3))
          ),
          it.pipe(
            filter((it) => it <= 1e11 && it >= -3e10),
            map((it) => it * 1000)
          )
        ).pipe(map((it) => new Date(it)))
      )
    )
  )

export default parse
