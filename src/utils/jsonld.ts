import { Graph, Thing } from 'schema-dts'
import memoized from 'nano-memoize'
import { AllKeys } from './types'

const parse = memoized((document: Document) => {
  const json = document.querySelector(
    'script[type="application/ld+json"]'
  )?.textContent
  if (json) return <Graph>JSON.parse(json)
})

const getObject = memoized(
  <T extends Thing, U extends AllKeys<T>>(
    graph?: Graph,
    name?: U,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    predicate = (thing: Thing): boolean => true
  ): T[U][] => {
    if (!graph || !name) return []
    const { '@graph': innerGraph, ...properties } = graph
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = properties[name] ? [<T[U]>properties[name]] : []
    if (innerGraph)
      for (const element of innerGraph) {
        if (
          predicate(element) &&
          typeof element === 'object' &&
          name in element
        )
          result.push((<T>element)[name])
      }
    return result
  }
)

export default Object.assign(parse, { getObject })
