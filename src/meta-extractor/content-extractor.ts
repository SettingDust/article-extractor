import { ExtractOperators, Extractor } from './utils'
import isStringBlank from 'is-string-blank'

export default <Extractor<{ content: string }>>{
  operators: new ExtractOperators(),
  processor: (value) => value.filter((it) => !isStringBlank(it)),
  selector: (source) => ({ content: source[0] })
}
