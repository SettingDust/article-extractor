/* eslint-disable unicorn/prefer-spread */
const textContent = (elements: ArrayLike<Element>) =>
  Array.from(elements).map(
    (it) => it.textContent ?? (<HTMLElement>it)['innerText']
  )

function attribute<T extends Element>(name: string, elements: ArrayLike<T>) {
  return Array.from(elements)
    .map((it) => it.getAttribute(name))
    .filter((it): it is string => it !== null)
}

export default {
  textContent,
  attribute
}
