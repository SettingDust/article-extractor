/**
 * @see https://stackoverflow.com/a/59847622
 */
type PartialK<T, K extends PropertyKey = PropertyKey> = Partial<
  Pick<T, Extract<keyof T, K>>
> &
  Omit<T, K> extends infer O
  ? { [P in keyof O]: O[P] }
  : never

type TFunction = (...a: unknown[]) => unknown

export type DefaultIgnored =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | Date
  | TFunction

export type NestedPartialK<T, IgnoredType = DefaultIgnored> = T extends (
    ...arguments_: unknown[]
  ) => unknown
  ? T
  : T extends unknown[]
    ? T[number] extends IgnoredType
      ? T[number]
      : Array<NestedPartialK<T[number], IgnoredType>>
    : T extends object
      ? PartialK<{
        [P in keyof T]: T[P] extends IgnoredType
          ? T[P]
          : NestedPartialK<T[P], IgnoredType>
      }>
      : T

export type Generated<T> = T extends Generator<infer R> ? R : T
