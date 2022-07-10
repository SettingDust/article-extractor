import { filter, map } from 'rxjs/operators'
import condenseWhitespace from 'condense-whitespace'
import isString from '@stdlib/assert-is-string'
import isStringBlank from 'is-string-blank'

export const condense = map<string, string>(condenseWhitespace)
export const validate = filter<string>(isString)
export const notBlank = filter<string>((it) => !isStringBlank(it))
export const trim = map<string, string>((it) => it.trim())
