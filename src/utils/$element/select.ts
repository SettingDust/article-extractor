/* eslint-disable unicorn/prefer-query-selector */

import { select } from '../$element.js'

export const query = (selector: string) =>
  select((it) => it.querySelectorAll(selector))

export const className = (className: string) =>
  select((it) => it.getElementsByClassName(className))
export const tag = (tag: string) => select((it) => it.getElementsByTagName(tag))
export const id = (id: string) => select((it) => [it.getElementById(id)])
