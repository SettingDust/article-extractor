import { filter, map, switchMap } from 'rxjs/operators'
import { ObservableInput, pipe } from 'rxjs'

export const $text = map<Element, string>(
  (it) => it.textContent ?? (<HTMLElement>it).innerText
)
export const $element = (
  fn: (document: Document) => ObservableInput<Element>
) => switchMap<Document, ObservableInput<Element>>(fn)
export const $query = (selector: string) =>
  $element((it) => it.querySelectorAll(selector))
export const $queryByClass = (className: string) =>
  $element((it) => it.getElementsByClassName(className))
export const $queryById = (id: string) =>
  $element((it) => [it.getElementById(id)])
export const $attr = (name: string) =>
  pipe(
    map<Element, string>((it) => it.getAttribute(name)),
    filter((it) => it !== null)
  )
