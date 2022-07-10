import isURI from '@stdlib/assert-is-uri'
import { filter } from 'rxjs/operators'

const validate = filter<string>(isURI)

export default { validate }
