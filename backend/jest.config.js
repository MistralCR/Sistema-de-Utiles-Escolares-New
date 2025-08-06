// Jest configuration for MongoDB testing
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

module.exports = {
  // Setup function executed before all tests
  globalSetup: async () => {
    if (process.env.NODE_ENV === "test") {
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGODB_URI_TEST = mongoServer.getUri();
    }
  },

  // Teardown function executed after all tests
  globalTeardown: async () => {
    if (mongoServer) {
      await mongoServer.stop();
    }
  },

  // Test environment
  testEnvironment: "node",

  // Setup files to run before each test file
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Test patterns
  testMatch: ["<rootDir>/tests/**/*.test.js", "<rootDir>/tests/**/*.spec.js"],

  // Coverage settings
  collectCoverageFrom: [
    "routes/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "controllers/**/*.js",
    "!tests/**",
    "!node_modules/**",
  ],

  // Timeout for tests
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};
