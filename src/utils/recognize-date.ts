import {
  Constants,
  Culture,
  DateTimeModelResult
} from '@microsoft/recognizers-text-date-time'
import containsChinese from 'contains-chinese'
import { distinct, OperatorFunction, pipe } from 'rxjs'
import { reduce } from 'rxjs/operators'
import memoized from 'nano-memoize'

const getDate = (result: DateTimeModelResult) =>
  new Date(
    result.typeName.endsWith(`range`)
      ? result.resolution.values[0].end
      : result.resolution.values[0].value
  )

export const resultToDate: OperatorFunction<DateTimeModelResult, Date> = pipe(
  distinct((it) => it.typeName),
  reduce((accumulator, value) => {
    const date = getDate(value)
    if (value.typeName.includes(`.${Constants.SYS_DATETIME_DATETIME}`)) {
      return date
    } else if (value.typeName.includes(`.${Constants.SYS_DATETIME_DATE}`)) {
      accumulator.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDay()
      )
      return accumulator
    } else if (value.typeName.includes(`.${Constants.SYS_DATETIME_TIME}`)) {
      accumulator.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
      return accumulator
    }
  }, new Date())
)

export const guessLocale = memoized((input: string) =>
  containsChinese(input) ? Culture.Chinese : Culture.English
)
