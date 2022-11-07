type AllKeys<T> = T extends unknown ? keyof T : never

type OptionalKeys<T> = T extends unknown
  ? {
      [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never
    }[keyof T]
  : never

type Index<T, K extends PropertyKey, D = never> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : D
  : never

type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never

export type DeepMerged<T, Ignored = never> = [T] extends [Array<unknown>]
  ? { [K in keyof T]: DeepMerged<T[K], Ignored> }
  : [T] extends [object]
  ? PartialKeys<
      {
        [K in AllKeys<T>]: Index<T, K> extends Ignored
          ? Index<T, K>
          : DeepMerged<Index<T, K>, Ignored>
      },
      Exclude<AllKeys<T>, keyof T> | OptionalKeys<T>
    >
  : T
