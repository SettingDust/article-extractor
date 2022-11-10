import parseDate, { guessLocale } from './parse-date'
import { expect } from 'chai'
import dayjs from 'dayjs'
import { Culture } from '@microsoft/recognizers-text-date-time'

// 2000-12-15 12:34:56
const date = new Date(976_854_896_000)
const expectDate = (input: string | number) => {
  const it = parseDate(input)
  expect(it.getTime()).equals(date.getTime())
}
describe('parse-date', () => {
  describe('guessLocale', () => {
    it('should working for chinese', () => {
      expect(guessLocale('2000.1.3 下午 3:02')).equals(Culture.Chinese)
      expect(guessLocale('2000年')).equals(Culture.Chinese)
      expect(guessLocale('23号')).equals(Culture.Chinese)
    })
    it('should working for english', () => {
      expect(guessLocale('Fri')).equals(Culture.English)
      expect(guessLocale('2000.1.3')).equals(Culture.English)
    })
  })
  describe('parse', () => {
    context('when input is string', () => {
      context('when input is digit string', () => {
        it('should parse', () => expectDate(date.getTime().toString()))
      })

      it('should parse iso', () => expectDate(date.toISOString()))
      it('should parse utc', () => expectDate(date.toUTCString()))
      it('should parse locale string', () => expectDate(date.toLocaleString()))
      it('should parse chinese time', () => {
        expectDate('2000年12月15日 12点34分56秒')
      })

      it('should parse relative minutes', () => {
        const timestamp = dayjs()
          .subtract(3, 'minutes')
          .set('millisecond', 0)
          .valueOf()
        expect(parseDate('3分钟前').getTime()).equals(timestamp)
        expect(parseDate('3 minutes ago').getTime()).equals(timestamp)
      })

      it('should parse relative time', () => {
        const timestamp = dayjs()
          .subtract(1, 'day')
          .set('hour', 15)
          .set('minute', 0)
          .set('second', 0)
          .unix()
        expect(Math.floor(parseDate('昨天下午三点').getTime() / 1000)).equals(
          timestamp
        )
        expect(Math.floor(parseDate('3pm yesterday').getTime() / 1000)).equals(
          timestamp
        )
      })

      it('should parse just now', () => {
        const timestamp = dayjs().unix()
        expect(Math.floor(parseDate('刚刚').getTime() / 1000)).equals(timestamp)
        expect(Math.floor(parseDate('Now').getTime() / 1000)).equals(timestamp)
      })
    })
    context('when input is number', () => {
      it('should handle as milliseconds', () => expectDate(date.getTime()))
    })
  })
})
