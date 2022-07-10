import type { Config } from '@jest/types'

export default <Config.InitialOptions>{
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  coverageReporters: ['text', 'html']
}
