/**
 * @see https://stackoverflow.com/a/59847622
 */
export type PartialK<T, Ignored extends PropertyKey = never> = Partial<
  Omit<T, Extract<keyof T, Ignored>>
> &
  Pick<T, Extract<keyof T, Ignored>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never

export type NestedPartialK<
  T,
  IgnoredKey extends PropertyKey = never,
  IgnoredType = never
> = T extends (...arguments_: unknown[]) => unknown
  ? T
  : T extends unknown[]
  ? T[number] extends IgnoredType
    ? T[number]
    : Array<NestedPartialK<T[number], IgnoredKey, IgnoredType>>
  : T extends object
  ? PartialK<
      {
        [P in keyof T]: T[P] extends IgnoredType
          ? T[P]
          : NestedPartialK<T[P], IgnoredKey, IgnoredType>
      },
      IgnoredKey
    >
  : T

export type Generated<T> = T extends Generator<infer R> ? R : T
