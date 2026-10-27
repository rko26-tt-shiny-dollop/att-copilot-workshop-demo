/**
 * Identifier validation for wireless activation.
 *
 * IMEI  - 15 digits, Luhn check digit (device identity).
 * ICCID - 19 or 20 digits, Luhn check digit (SIM identity).
 *
 * These validators back the activation workflow and are exercised directly
 * in the workshop (see the identifier-validator agent skill).
 */

/** Luhn checksum validation for a numeric string. */
export function passesLuhn(value: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = Number(value[i]);
    if (Number.isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** True when the value is exactly `length` ASCII digits. */
function isDigits(value: string, length?: number): boolean {
  if (!/^\d+$/.test(value)) return false;
  return length === undefined ? true : value.length === length;
}

/** Validate a 15-digit IMEI (device identifier). */
export function isValidImei(imei: string): boolean {
  return isDigits(imei, 15) && passesLuhn(imei);
}

/** Validate a 19-20 digit ICCID (SIM identifier). */
export function isValidIccid(iccid: string): boolean {
  if (!isDigits(iccid)) return false;
  if (iccid.length < 19 || iccid.length > 20) return false;
  return passesLuhn(iccid);
}
