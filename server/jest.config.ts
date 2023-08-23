const config = {
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^#tests($|/.*)$": "<rootDir>/tests/$1",
    "^#(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["./jest.setup.ts"],
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",
};

export default config;
