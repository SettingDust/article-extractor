import { OperatorFunction } from 'rxjs'

export type MetaExtractor<T> = OperatorFunction<Document, T>

export const extractors = []
