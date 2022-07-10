import isURI from '@stdlib/assert-is-uri'
import { filter } from 'rxjs/operators'

const validate = filter(isURI)

export default { validate }
