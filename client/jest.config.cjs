/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transform: { "\\.[jt]sx?$": "babel-jest" },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,jsx}"],
  coverageDirectory: "coverage",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[j]s?(x)"],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/__mocks__/uuid.js",
    "^.+/lib/socket(\\.js)?$": "<rootDir>/__mocks__/socket.js",
    "^.+/lib/env(\\.js)?$": "<rootDir>/__mocks__/env.js",
    "^.+/lib/tours(\\.js)?$": "<rootDir>/__mocks__/tours.js",
    "driver\\.js/dist/driver\\.css$": "<rootDir>/__mocks__/fileMock.js",
    "^driver\\.js$": "<rootDir>/__mocks__/driverjs.js",
  },
};

module.exports = config;
