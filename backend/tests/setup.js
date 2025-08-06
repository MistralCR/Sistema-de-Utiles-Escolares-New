// Setup file for Jest tests
require("dotenv").config({ path: ".env.test" });

// Set test environment variables
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_secret_key_for_jwt_tokens";
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn((message) => {
    // Only show important errors, filter out MongoDB deprecation warnings
    if (
      typeof message === "string" &&
      !message.includes("deprecated") &&
      !message.includes("warning")
    ) {
      originalConsoleError(message);
    }
  });

  // Reduce console.log noise in tests
  console.log = jest.fn((message) => {
    if (
      typeof message === "string" &&
      (message.includes("Test") || message.includes("ERROR"))
    ) {
      originalConsoleLog(message);
    }
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});
