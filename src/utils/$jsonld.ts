import { from, merge, OperatorFunction, pipe } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { Graph } from 'schema-dts'
import $element from './$element'

const parse = pipe(
  $element.select.query('script[type="application/ld+json"]'),
  map((it) => (it as HTMLElement).textContent),
  map((it) => <Graph>JSON.parse(it))
)

const get =
  <T>(
    name: string,
    predicate: (Thing) => boolean = () => true
  ): OperatorFunction<Graph, T> =>
  ($graph) =>
    $graph.pipe(
      switchMap(({ '@graph': graph, ...properties }) =>
        merge(
          from(Object.entries(properties)).pipe(
            filter(([key]) => key.endsWith(name)),
            map((it) => <T>it[1])
          ),
          from(graph ?? []).pipe(
            filter((it) => predicate(it)),
            map((it) => <T>it[name])
          )
        )
      )
    )

export default Object.assign(parse, { get })
