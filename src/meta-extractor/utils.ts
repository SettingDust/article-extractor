import { filter, map, switchMap } from 'rxjs/operators'
import {
  from,
  merge,
  ObservableInput,
  of,
  OperatorFunction,
  pipe,
  pluck
} from 'rxjs'
import condenseWhitespace from 'condense-whitespace'
import memoized from 'nano-memoize'
import { Graph, Thing } from 'schema-dts'

export const $condenseWhitespace = map<string, string>(condenseWhitespace)
export const $text = map<Element, string>(
  (it) => it.textContent ?? (<HTMLElement>it).innerText
)
export const $element = (
  fn: (document: Document) => ObservableInput<Element>
) => memoized(switchMap<Document, ObservableInput<Element>>(fn))
export const $query = (selector: string) =>
  $element((it) => it.querySelectorAll(selector))
export const $queryByClass = (className: string) =>
  $element((it) => it.getElementsByClassName(className))
export const $queryByTag = (tag: string) =>
  $element((it) => it.getElementsByTagName(tag))
export const $queryById = (id: string) =>
  $element((it) => [it.getElementById(id)])
export const $attr = (name: string) =>
  pipe(
    map<Element, string>((it) => it.getAttribute(name)),
    filter((it) => it !== null)
  )
export const $jsonld = pipe(
  $query('script[type="application/ld+json"]'),
  map((it) => it as globalThis.HTMLScriptElement),
  pluck('innerText'),
  map((it) => JSON.parse(it) as Graph)
)
export const $searchJsonld = <T>(
  name: string,
  predicate: (obj: Thing) => boolean = () => true
): OperatorFunction<Graph, T> =>
  switchMap((graph: Graph) =>
    of(graph).pipe(
      switchMap(({ '@graph': graph, ...props }) =>
        merge(
          from(Object.entries(props)).pipe(
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
