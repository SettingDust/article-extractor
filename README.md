Article Extractor Logo

# Article Extractor

article-extractor is a tool that extract content from a webpage.

## Installation & Usage

### Node.js

`yarn add article-extractor`  
`npm i article-extractor`

```js
import { extract } from 'article-extractor'
```

## API

See more detail in [index.ts](src/index.ts)

### [`extract`](src/index.ts)

Extract data from html string or [`Document`](https://developer.mozilla.org/docs/Web/API/Document) object

```ts
export declare function extract(html: string | Document): Promise<DefaultExtracted>;
export declare function extract<T>(html: string | Document, options: Omit<ExtractOptions<T>, 'extractors'>): Promise<DefaultExtracted>;
export declare function extract<T>(html: string | Document, options?: ExtractOptions<T>): Promise<NestedPartialK<T & TitleExtracted & UrlExtracted>>;
```

`DefaultExtracted` is inferred from the default extractors. And is the default extracted result type.

```ts
interface DefaultExtracted {
  title: string
  url: string
  content?: string
  author?: { url?: string; name?: string }
  date?: { published?: Date; modified?: Date }
} 
```

#### [`ExtractOptions`](src/index.ts#L19)

Type parameter `T` should be inferred from `extractors`.

```ts
interface ExtractOptions<T> {
  /**
   * Url for the page. **may not be the final result**
   * @see urlExtractor
   */
  url?: string
  /**
   * Extractors for extract.
   * @see defaultExtractors
   */
  extractors?: Extractor<T>[]
  /**
   * Options of sanitize-html
   * @see https://www.npmjs.com/package/sanitize-html
   */
  sanitizeHtml?: sanitize.IOptions
  /**
   * For parse date
   * @see mapToNearestLanguage
   */
  lang?: string
}
```

#### [Default Extractors](src/default-extractors.ts)

```ts
import('./author-extractor')
import('./author-url-extractor')
import('./published-date-extractor')
import('./modified-date-extractor')
import('./content-extractor')
```

### [Extractor](src/utils/extractors.ts)

Custom extractors are supported

```ts
type ExtractOperator = (document: Document, url?: string) => string[]

interface Extractor<T> {
  /**
   * Operators that fetch string from document
   */
  operators: ExtractOperators
  /**
   * Process raw strings from {@link operators}. Such as validate and filter.
   */
  processor: (value: string[], context?: ExtractorContext) => string[]
  /**
   * Pick one string as final result and transform to target type (eg. {@link Date}).
   */
  selector: (value: string[], title?: string, context?: ExtractorContext) => T
}

interface ExtractorContext {
  url?: string
  sanitizeHtml?: sanitize.IOptions
  lang?: string
}

/**
 * Class for manage operators can operate with index
 * Note: digit string won't keep the insertion order in object. Have to set index manually
 */
declare class ExtractOperators extends Array<[string, ExtractOperator]> {
  constructor(items?: {
    [key: string]: ExtractOperator;
  });

  push(...items: [key: string, extractor: ExtractOperator][]): number;

  set(key: string, extractor: ExtractOperator, index?: number): this;

  get: (key: string) => [string, ExtractOperator];
}
```

#### [Content](src/content-extractor/index.ts)

Page content is extracted by [readability](https://github.com/mozilla/readability).
There is an [api](src/content-extractor/selector-extractors.ts) for adding custom css selector extractor or other custom extractor

```ts
import { selectors } from './src/selector-extractors'

selectors.put(new URLPattern('*://exam.ple/*'), {
  selector: ['#id'],
  ignored: ['.bad', 'header']
})
```

## License

article-extractor Copyright (c) 2022 SettingDust, release under MIT License

- [article-parser (MIT)](https://github.com/ndaidong/article-parser/LICENSE)
- [metascraper (MIT)](https://github.com/microlinkhq/metascraper/LICENSE.md)
