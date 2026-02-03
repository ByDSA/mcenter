import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^#tests($|/.*)$": "<rootDir>/tests/$1",
    "^#modules($|/.*)$": "<rootDir>/src/modules/$1",
    "^#musics($|/.*)$": "<rootDir>/src/modules/musics/$1",
    "^#episodes($|/.*)$": "<rootDir>/src/modules/episodes/$1",
    "^#series($|/.*)$": "<rootDir>/src/modules/series/$1",
    "^#core($|/.*)$": "<rootDir>/src/core/$1",
    "^#utils($|/.*)$": "<rootDir>/src/utils/$1",
    "^\\$shared($|/.*)$": "<rootDir>/../shared/src/$1",
  },
  setupFiles: ["./jest.setup.ts"],
  globalSetup: "./jest.global.setup.ts",
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testTimeout: 100 * 1000,
  forceExit: true,
};

export default config;
