/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.test.json', useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/src/tests/**/*.test.ts'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: ['node_modules/(?!.*(exceljs|uuid))']
}
export default config
