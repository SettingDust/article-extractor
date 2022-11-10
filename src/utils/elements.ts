const textContent = (elements: Iterable<Element>) =>
  [...elements].map((it) => it.textContent ?? it['innerText'])

function attribute<T extends Element>(name: string, elements: Iterable<T>) {
  return [...elements].map((it) => it.getAttribute(name))
}

export default {
  textContent,
  attribute
}
