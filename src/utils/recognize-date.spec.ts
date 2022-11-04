import { expect } from 'chai'
import { guessLocale } from './recognize-date'
import { Culture } from '@microsoft/recognizers-text-date-time'

describe('recognize-date', () => {
  describe('guessLocale', () => {
    it('should working for chinese', () => {
      expect(guessLocale('2000.1.3 下午 3:02')).equals(Culture.Chinese)
      expect(guessLocale('2000年')).equals(Culture.Chinese)
      expect(guessLocale('23号')).equals(Culture.Chinese)
    })
    it('should working for english', () => {
      expect(guessLocale('Fri')).equals(Culture.English)
      expect(guessLocale('2000.1.3')).equals(Culture.English)
    })
  })
})
