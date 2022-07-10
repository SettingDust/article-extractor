/* eslint-disable unicorn/prefer-query-selector */
import { ObservableInput, pipe } from 'rxjs'
import memoized from 'nano-memoize'
import { filter, map, switchMap } from 'rxjs/operators'

const select = Object.assign(
  (function_: (document: Document) => ObservableInput<Element>) =>
    memoized(switchMap<Document, ObservableInput<Element>>(function_)),
  {
    query: (selector: string) => select((it) => it.querySelectorAll(selector)),
    className: (name: string) =>
      select((it) => it.getElementsByClassName(name)),
    tag: (tag: string) => select((it) => it.getElementsByTagName(tag)),
    id: (id: string) => select((it) => [it.getElementById(id)])
  }
)

const attribute = (name: string) =>
  pipe(
    map<Element, string>((it) => it.getAttribute(name)),
    filter((it) => it !== null)
  )

const text = map<Element, string>(
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  (it) => it.textContent ?? (<HTMLElement>it).innerText
)

export default {
  select,
  attribute,
  text
}
