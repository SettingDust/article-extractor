import { from, merge, of, OperatorFunction, pipe, pluck } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { Graph, Thing } from 'schema-dts'
import { $element } from './index.js'

export const parse = pipe(
  $element.select.query('script[type="application/ld+json"]'),
  map((it) => it as globalThis.HTMLScriptElement),
  pluck('innerText'),
  map((it) => JSON.parse(it) as Graph)
)

export const get = <T>(
  name: string,
  predicate: (thing: Thing) => boolean = () => true
): OperatorFunction<Graph, T> =>
  switchMap((graph: Graph) =>
    of(graph).pipe(
      switchMap(({ '@graph': graph, ...properties }) =>
        merge(
          from(Object.entries(properties)).pipe(
            filter(([key]) => key.endsWith(name)),
            <OperatorFunction<[string, T], T>>pluck(1)
          ),
          from(graph ?? []).pipe(
            filter((it) => predicate(it)),
            <OperatorFunction<Thing, T>>pluck(name)
          )
        )
      )
    )
  )

export default Object.assign(parse, { get })
