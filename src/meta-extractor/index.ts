import { OperatorFunction } from 'rxjs'

export interface MetaExtractor<T> extends OperatorFunction<Document, T> {}
