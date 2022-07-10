import { filter, map } from 'rxjs/operators'
import condenseWhitespace from 'condense-whitespace'
import isString from '@stdlib/assert-is-string'
import isStringBlank from 'is-string-blank'

const condense = map<string, string>(condenseWhitespace)
const validate = filter<string>(isString)
const notBlank = filter<string>((it) => !isStringBlank(it))
const trim = map<string, string>((it) => it.trim())

export default { condense, validate, notBlank, trim }
