module.exports = {
  moduleDirectories: [
    "node_modules",
    "src",
  ],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": require.resolve("babel-jest"),
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      isolatedModules: false,
    },
  },
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@models/(.*)$": "<rootDir>/src/db/models/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },
};
