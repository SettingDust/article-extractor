import {
  Constants,
  Culture,
  DateTimeModelResult,
  recognizeDateTime
} from '@microsoft/recognizers-text-date-time'
import isDigitString from '@stdlib/assert-is-digit-string'
import dedupe from 'dedupe'
import containsChinese from 'contains-chinese'
import memoized from 'nano-memoize'

/**
 * @param input milliseconds timestamp in string or number. Or readable date describing
 */
const parse = memoized(
  (input: string | number, lang?: string): Date | undefined => {
    if (lang) lang = Culture.mapToNearestLanguage(lang)
    if (isDigitString(input)) input = Number.parseInt(<string>input)
    const date = new Date(input)
    if (Number.isNaN(date.getTime()) && typeof input === 'string') {
      const results = recognizeDateTime(
        input,
        lang ?? Culture.mapToNearestLanguage(guessLocale(input))
      )
      return resultToDate(<DateTimeModelResult[]>results)
    }
    return Number.isNaN(date.getTime()) ? undefined : date
  }
)

const toDate = ({ typeName, resolution }: DateTimeModelResult) =>
  new Date(
    typeName.endsWith(`range`)
      ? resolution.values[0].end
      : resolution.values[0].value
  )

const resultToDate = memoized(
  (results: DateTimeModelResult[]): Date | undefined => {
    results = dedupe(results, (it) => it.typeName)
    let accumulator = new Date()
    let success = false
    for (const result of results) {
      const date = toDate(result)
      if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATETIME}`)) {
        accumulator = date
        success = true
      } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATE}`)) {
        accumulator.setFullYear(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
        success = true
      } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_TIME}`)) {
        accumulator.setHours(
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        )
        success = true
      }
    }
    if (success)
      return Number.isNaN(accumulator.getTime()) ? undefined : accumulator
  }
)

export const guessLocale = (input: string) =>
  containsChinese(input) ? Culture.Chinese : Culture.English

export default parse
