const config = {
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^#tests($|/.*)$": "<rootDir>/tests/$1",
    "^#modules($|/.*)$": "<rootDir>/src/modules/$1",
    "^#main($|/.*)$": "<rootDir>/src/main/$1",
    "^#utils($|/.*)$": "<rootDir>/src/utils/$1",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageDirectory: "./coverage",
};

export default config;
