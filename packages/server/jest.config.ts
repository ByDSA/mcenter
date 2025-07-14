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
    "^#modules($|/.*)$": "<rootDir>/src/modules/$1",
    "^#musics($|/.*)$": "<rootDir>/src/modules/musics/$1",
    "^#episodes($|/.*)$": "<rootDir>/src/modules/episodes/$1",
    "^#series($|/.*)$": "<rootDir>/src/modules/series/$1",
    "^#main($|/.*)$": "<rootDir>/src/main/$1",
    "^#utils($|/.*)$": "<rootDir>/src/utils/$1",
  },
  setupFiles: ["./jest.setup.ts"],
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testTimeout: 100 * 1000,
};

export default config;
