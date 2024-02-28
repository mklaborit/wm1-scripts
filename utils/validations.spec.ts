import { describe, expect, it } from "bun:test";
import { checkEnvironmentVariable } from ".";

describe("validations", () => {
  describe("checkEnvironmentVariable", () => {
    it("should throw an error if environment variable is not found", () => {
      expect(() =>
        checkEnvironmentVariable("NON_EXISTING_ENV_VARIABLE")
      ).toThrow("Environment variable not found");
    });

    it("should return the value of the environment variable if found", () => {
      process.env.MOCK_ENV_VARIABLE = "HELLO_WORLD";
      expect(checkEnvironmentVariable("MOCK_ENV_VARIABLE")).toBe("HELLO_WORLD");

      delete process.env.MOCK_ENV_VARIABLE;
    });
  });
});
