import { Graph } from 'schema-dts'
import memoized from 'nano-memoize'

const parse = memoized((document: Document) => {
  const json = document.querySelector(
    'script[type="application/ld+json"]'
  )?.textContent
  if (json)
    return <Graph>(
      JSON.parse(
        document.querySelector('script[type="application/ld+json"]')
          ?.textContent
      )
    )
})

const get = memoized(
  <T>(
    graph?: Graph,
    name?: string,
    predicate: (Thing) => boolean = () => true
  ) => {
    if (!graph) return []
    const { '@graph': innerGraph, ...properties } = graph
    const result = Object.entries(properties)
      .filter(([key, value]) => key.endsWith(name) && value)
      .map((it) => <T>it[1])
    if (innerGraph)
      result.push(
        ...innerGraph
          .filter((it) => predicate(it) && <T>it[name])
          .map((it) => <T>it[name])
      )
    return result
  }
)

export default Object.assign(parse, { get })
