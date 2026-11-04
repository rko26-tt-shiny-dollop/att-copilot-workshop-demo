---
name: identifier-validator
description: Validate and explain wireless device/SIM identifiers (IMEI and ICCID), including Luhn checks. Use when a task involves checking, generating, or debugging IMEI or ICCID values in the Wireless Activation Console.
---

# Identifier Validator

Wireless activation depends on two identifiers. Use this skill whenever a task
touches them.

## IMEI (device identity)

- Exactly **15 digits**.
- The 15th digit is a **Luhn** check digit over the first 14.
- Validate with `isValidImei` from `api/src/utils/identifiers.ts`. Do not
  reimplement the check.

## ICCID (SIM identity)

- **19 or 20 digits**.
- The final digit is a **Luhn** check digit.
- Validate with `isValidIccid` from `api/src/utils/identifiers.ts`.

## How to apply

1. When adding a field or endpoint that accepts an IMEI/ICCID, call the existing
   validator and return `badRequest(...)` from `api/src/utils/errors.ts` on failure.
2. When generating test/seed values, compute a correct Luhn check digit so the
   value is valid. Never paste arbitrary digits.
3. When debugging a rejected activation, confirm length first, then the Luhn digit.

## Reference data

The first **8 digits** of an IMEI are the **TAC** (Type Allocation Code), which
identifies the device make/model. When explaining or debugging an IMEI, look up its
TAC in [`data/tac-reference.csv`](./data/tac-reference.csv) (relative to this skill)
to name the device. Do not guess the model from the digits — if the TAC is not in the
table, say so.

> The TAC values in that file are **illustrative sample data** for this workshop, not
> real GSMA allocations.

## Generating a valid check digit (reference)

Double every second digit from the right; if a doubled value exceeds 9, subtract 9;
sum all digits; the check digit is the amount needed to reach the next multiple of 10.
