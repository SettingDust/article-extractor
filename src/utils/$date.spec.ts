import { combineLatest, from, lastValueFrom, of, tap } from 'rxjs'
import $date from './$date'
import { expect } from 'chai'
import dayjs from 'dayjs'

// 2000-12-15 12:34:56
const date = new Date(976_854_896_000)
const expectDate = (input: string | number) =>
  lastValueFrom(
    of(input).pipe(
      $date,
      tap((it) => expect(date.getTime()).equals(it.getTime()))
    )
  )
describe('$date', () => {
  describe('parse', () => {
    context('when input is string', () => {
      it('should parse iso', () => expectDate(date.toISOString()))
      it('should parse utc', () => expectDate(date.toUTCString()))
      it('should parse locale string', () => expectDate(date.toLocaleString()))
      it('should parse chinese time', () =>
        expectDate('2000年12月15日 12点34分56秒'))
      it('should parse relative time', () =>
        lastValueFrom(
          combineLatest([
            from(['3分钟前', '3 mins ago', '3 minutes ago']).pipe((it) => {
              let timestamp
              return it.pipe(
                tap(() => {
                  timestamp = dayjs()
                    .subtract(3, 'minutes')
                    .set('millisecond', 0)
                    .valueOf()
                }),
                $date,
                tap((it) => {
                  expect(it.getTime()).equals(timestamp)
                })
              )
            }),
            from(['昨天下午三点', '3pm yesterday']).pipe((it) => {
              let timestamp
              return it.pipe(
                tap(() => {
                  timestamp = dayjs()
                    .subtract(1, 'day')
                    .set('hour', 15)
                    .set('minute', 0)
                    .set('second', 0)
                    .unix()
                }),
                $date,
                tap((it) => {
                  expect(Math.floor(it.getTime() / 1000)).equals(timestamp)
                })
              )
            }),
            from(['刚刚', 'Now']).pipe((it) => {
              let timestamp
              return it.pipe(
                tap(() => {
                  timestamp = dayjs().unix()
                }),
                $date,
                tap((it) => {
                  expect(Math.floor(it.getTime() / 1000)).equals(timestamp)
                })
              )
            })
          ])
        ))
    })
    context('when input is number', () => {
      it('should handle as milliseconds', () => expectDate(date.getTime()))
    })
  })
})
