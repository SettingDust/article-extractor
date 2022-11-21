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

export type NestedPartial<T, IgnoredType = DefaultIgnored> = T extends (
  ...arguments_: unknown[]
) => unknown
  ? T
  : T extends unknown[]
  ? T[number] extends IgnoredType
    ? T[number]
    : Array<NestedPartial<T[number], IgnoredType>>
  : T extends object
  ? PartialK<{
      [P in keyof T]: T[P] extends IgnoredType
        ? T[P]
        : NestedPartial<T[P], IgnoredType>
    }>
  : T

type IndexValue<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never

type AllKeys<T> = T extends unknown ? keyof T : never

type PartialKeys<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? {
      [P in keyof O]: O[P]
    }
  : never

export type DeepMerged<T> = [T] extends [Array<unknown>]
  ? {
      [K in keyof T]: DeepMerged<T[K]>
    }
  : [T] extends [DefaultIgnored]
  ? T
  : [T] extends [object]
  ? PartialKeys<{
      [K in AllKeys<T>]: DeepMerged<IndexValue<T, K>>
    }>
  : T
