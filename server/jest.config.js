module.exports = {
  moduleDirectories: [
    "node_modules",
    "src"
  ],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': require.resolve('babel-jest')
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['<rootDir>/node_modules/?!(@datune)'],
  setupFilesAfterEnv: ["jest-expect-message"],
  globals: {
    'ts-jest': {
      isolatedModules: false,
    },
  }
}