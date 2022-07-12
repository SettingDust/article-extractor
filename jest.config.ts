import type { Config } from '@jest/types'

// noinspection JSUnusedGlobalSymbols
export default <Config.InitialOptions>{
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['src/**/*.{ts,js}']
}
