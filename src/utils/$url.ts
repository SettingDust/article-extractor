import isURI from '@stdlib/assert-is-uri'
import { filter } from 'rxjs/operators'

export const validate = filter<string>(isURI)
