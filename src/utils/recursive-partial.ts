// https://dev.to/svehla/typescript-generics-stop-writing-tests-avoid-runtime-errors-pt2-2k62
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] // if yes, apply RecursivePartial to each item of it // check that nested value is an array
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}
