/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 
 */
export default {
  preset: "ts-jest/presets/default-esm",
  // [...]
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./src/tsconfig.json",
        useESM: true,
      },
    ],
  },

  testEnvironment: "node",

  testMatch: ["<rootDir>/src/test/**/*.spec.ts"],

  collectCoverage: true,

  collectCoverageFrom: ["./src/lib/**/*.ts"],

  coverageDirectory: "./.reports/coverage",

  moduleNameMapper: {
    "(.*).js$": "$1",
  },

  moduleFileExtensions: ["ts", "js"],

  resetMocks: true,
};
