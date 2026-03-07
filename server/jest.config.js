module.exports = {
  verbose: true,
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js"],
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/coverage/"],
};
