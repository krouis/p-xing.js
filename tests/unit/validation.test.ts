import { describe, it, expect } from "vitest";
import { validateInitials, normalizeInitials } from "../../src/core/validation";

describe("validateInitials", () => {
  it("accepts 3 uppercase letters", () => {
    expect(validateInitials("ABC")).toBe(true);
  });

  it("accepts 3 digits", () => {
    expect(validateInitials("123")).toBe(true);
  });

  it("accepts mixed alphanumeric", () => {
    expect(validateInitials("A1B")).toBe(true);
  });

  it("accepts lowercase input by normalizing", () => {
    expect(validateInitials("abc")).toBe(true);
  });

  it("rejects fewer than 3 characters", () => {
    expect(validateInitials("AB")).toBe(false);
  });

  it("rejects more than 3 characters", () => {
    expect(validateInitials("ABCD")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(validateInitials("A!C")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(validateInitials("A C")).toBe(false);
  });
});

describe("normalizeInitials", () => {
  it("converts lowercase to uppercase", () => {
    expect(normalizeInitials("abc")).toBe("ABC");
  });

  it("leaves uppercase unchanged", () => {
    expect(normalizeInitials("XYZ")).toBe("XYZ");
  });
});
