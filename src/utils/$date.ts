// https://github.com/microlinkhq/metascraper/blob/v5.29.15/packages/metascraper-helpers/index.js#L253-L288=

import { map } from 'rxjs/operators'
import { from, OperatorFunction, switchMap } from 'rxjs'
import {
  Culture,
  recognizeDateTime
} from '@microsoft/recognizers-text-date-time'
import { guessLocale, resultToDate } from './recognize-date'

/**
 * @param $input number should be Millisecond
 */
const parse: OperatorFunction<string | number, Date> = ($input) =>
  $input.pipe(
    switchMap((input) =>
      $input.pipe(
        map((it) => new Date(it)),
        ($date) =>
          $date.pipe(
            switchMap((date) => {
              if (Number.isNaN(date.getTime())) {
                const result = recognizeDateTime(
                  <string>input,
                  Culture.mapToNearestLanguage(guessLocale(<string>input))
                )
                return from(result).pipe(resultToDate)
              } else return $date
            })
          )
      )
    )
  )

export default parse
