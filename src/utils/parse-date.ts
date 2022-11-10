import {
  Constants,
  Culture,
  DateTimeModelResult,
  recognizeDateTime
} from '@microsoft/recognizers-text-date-time'
import isDigitString from '@stdlib/assert-is-digit-string'
import dedupe from 'dedupe'
import containsChinese from 'contains-chinese'

/**
 * @param input milliseconds timestamp in string or number. Or readable date describing
 */
function parse(input: string | number) {
  if (isDigitString(input)) input = Number.parseInt(<string>input)
  const date = new Date(input)
  if (Number.isNaN(date.getTime()) && typeof input === 'string') {
    const results = recognizeDateTime(
      input,
      Culture.mapToNearestLanguage(guessLocale(input))
    )
    return resultToDate(<DateTimeModelResult[]>results)
  }
  return date
}

const toDate = ({ typeName, resolution }: DateTimeModelResult) =>
  new Date(
    typeName.endsWith(`range`)
      ? resolution.values[0].end
      : resolution.values[0].value
  )

const resultToDate = (results: DateTimeModelResult[]) => {
  results = dedupe(results, (it) => it.typeName)
  let accumulator = new Date()
  for (const result of results) {
    const date = toDate(result)
    if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATETIME}`)) {
      accumulator = date
    } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATE}`)) {
      accumulator.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_TIME}`)) {
      accumulator.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
    }
  }
  return accumulator
}

export const guessLocale = (input: string) =>
  containsChinese(input) ? Culture.Chinese : Culture.English

export default parse
