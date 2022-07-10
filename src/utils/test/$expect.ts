import { tap } from 'rxjs'

const truthy = tap((it) => expect(it).toBeTruthy())
const falsy = tap((it) => expect(it).toBeFalsy())
const length = <E>(n: number) => tap<E>((it) => expect(it).toHaveLength(n))
const be = <E>(n: E) => tap<E>((it) => expect(it).toBe(n))
const equals = <E>(n: E) => tap<E>((it) => expect(it).toEqual(n))
const not = {
  be: <E>(n: E) => tap<E>((it) => expect(it).not.toBe(n))
}

export default { length, be, not, equals, truthy, falsy }
