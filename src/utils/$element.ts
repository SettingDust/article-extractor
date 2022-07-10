import { ObservableInput, pipe } from 'rxjs'
import memoized from 'nano-memoize'
import { filter, map, switchMap } from 'rxjs/operators'

export const select = Object.assign(
  (function_: (document: Document) => ObservableInput<Element>) =>
    memoized(switchMap<Document, ObservableInput<Element>>(function_)),
  await import('./$element/select.js')
)

export const attr = (name: string) =>
  pipe(
    map<Element, string>((it) => it.getAttribute(name)),
    filter((it) => it !== null)
  )

export const text = map<Element, string>(
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  (it) => it.textContent ?? (<HTMLElement>it).innerText
)
