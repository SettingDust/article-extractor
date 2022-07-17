export const extractors = await Promise.all([
  import('./title'),
  import('./link'),
  import('./author'),
  import('./author-url'),
  import('./published-date'),
  import('./modified-date')
])
