export interface ContentSelector {
  selector: string[]
  ignored?: string[]
}

export const selectors = new Map<string, ContentSelector>()
