const config = {
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageDirectory: "./coverage",
};

export default config;
