import { describe, it, expect } from "vitest";
import { isValidImei, isValidIccid, passesLuhn } from "./identifiers.js";

describe("passesLuhn", () => {
  it("accepts a valid Luhn number", () => {
    expect(passesLuhn("353280110876548")).toBe(true);
  });

  it("rejects an invalid Luhn number", () => {
    expect(passesLuhn("353280110876547")).toBe(false);
  });
});

describe("isValidImei", () => {
  it("accepts a valid 15-digit IMEI", () => {
    expect(isValidImei("353280110876548")).toBe(true);
  });

  it("rejects an IMEI of the wrong length", () => {
    expect(isValidImei("35328011087654")).toBe(false);
  });

  it("rejects a non-numeric IMEI", () => {
    expect(isValidImei("35328011087654X")).toBe(false);
  });

  it("rejects an IMEI that fails the Luhn check", () => {
    expect(isValidImei("353280110876540")).toBe(false);
  });
});

describe("isValidIccid", () => {
  it("accepts a valid 20-digit ICCID", () => {
    expect(isValidIccid("89014103211111111112")).toBe(true);
  });

  it("rejects an ICCID that is too short", () => {
    expect(isValidIccid("890141032111111")).toBe(false);
  });

  it("rejects a non-numeric ICCID", () => {
    expect(isValidIccid("8901410321111111111X")).toBe(false);
  });
});
