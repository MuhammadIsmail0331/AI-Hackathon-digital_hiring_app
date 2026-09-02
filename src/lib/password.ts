/**
 * Validates password strength.
 * Requirements: min 8 chars, uppercase, lowercase, digit, special char.
 * Returns an array of unmet requirements (empty = valid).
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    errors.push("At least one special character");
  return errors;
}

/**
 * Returns true if the password meets all strength requirements.
 */
export function isPasswordStrong(password: string): boolean {
  return validatePasswordStrength(password).length === 0;
}
