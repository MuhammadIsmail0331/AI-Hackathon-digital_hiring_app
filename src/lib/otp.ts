import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const OTP_MAX_ATTEMPTS = 5; // max wrong attempts before lockout
const OTP_LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout after max attempts
const OTP_VERIFIED_WINDOW_MS = 10 * 60 * 1000; // verified OTP valid for 10 min

function smsDeliveryConfigured(): boolean {
  return Boolean(process.env.SMS_PROVIDER);
}

/**
 * Generates a cryptographically secure 6-digit OTP, hashes it, and stores in DB.
 *
 * DEVELOPMENT MODE: The OTP code is returned for UI display.
 * PRODUCTION: Code is never returned; it would be sent via SMS only.
 */
export async function generateOTP(
  phone: string,
  purpose: string = "REGISTRATION"
): Promise<{ otpId: string; code: string | null }> {
  // Cryptographically secure 6-digit code
  const code = String(100000 + crypto.randomInt(900000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Hash code before storage (protects against DB leaks)
  const codeHash = await bcrypt.hash(code, 6); // lower rounds for speed; OTP is short-lived

  // Invalidate any previous OTPs for this phone+purpose
  await db.oTPVerification.updateMany({
    where: { phone, purpose, verified: false },
    data: { verified: true },
  });

  const otp = await db.oTPVerification.create({
    data: { phone, code: codeHash, purpose, expiresAt },
  });

  // Only return plaintext code in development
  return { otpId: otp.id, code: smsDeliveryConfigured() ? null : code };
}

/**
 * Checks if a new OTP can be sent to this phone (cooldown + lockout).
 * Returns null if OK, or an error message if blocked.
 */
export async function checkOTPSendAllowed(
  phone: string,
  purpose: string = "REGISTRATION"
): Promise<string | null> {
  // Cooldown: no new OTP within 60 seconds
  const latest = await db.oTPVerification.findFirst({
    where: { phone, purpose },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const secs = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      return `Please wait ${secs} seconds before requesting a new code.`;
    }
  }

  // Lockout: too many failed attempts on recent OTPs
  const recentCutoff = new Date(Date.now() - OTP_LOCKOUT_MS);
  const recentOtps = await db.oTPVerification.findMany({
    where: {
      phone,
      purpose,
      verified: false,
      createdAt: { gte: recentCutoff },
    },
    select: { attempts: true },
  });

  const totalAttempts = recentOtps.reduce((sum, o) => sum + o.attempts, 0);
  if (totalAttempts >= OTP_MAX_ATTEMPTS * 3) {
    return "Too many failed attempts. Please try again later.";
  }

  return null;
}

/**
 * Verifies an OTP code against the stored hash.
 * Tracks failed attempts and locks after max attempts.
 */
export async function verifyOTP(
  phone: string,
  code: string,
  purpose: string = "REGISTRATION"
): Promise<{ valid: boolean; error?: string }> {
  const otp = await db.oTPVerification.findFirst({
    where: { phone, purpose, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { valid: false, error: "Invalid OTP code" };
  }

  // Lockout check
  if (otp.lockedUntil && new Date() < otp.lockedUntil) {
    const mins = Math.ceil(
      (otp.lockedUntil.getTime() - Date.now()) / 60000
    );
    return {
      valid: false,
      error: `Too many failed attempts. Try again in ${mins} minutes.`,
    };
  }

  // Expiry check
  if (new Date() > otp.expiresAt) {
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  // Compare against hashed code
  const codeMatch = await bcrypt.compare(code, otp.code);
  if (!codeMatch) {
    const newAttempts = otp.attempts + 1;
    if (newAttempts >= OTP_MAX_ATTEMPTS) {
      await db.oTPVerification.update({
        where: { id: otp.id },
        data: {
          attempts: newAttempts,
          lockedUntil: new Date(Date.now() + OTP_LOCKOUT_MS),
        },
      });
      return {
        valid: false,
        error: "Too many failed attempts. OTP has been locked for 15 minutes.",
      };
    }
    await db.oTPVerification.update({
      where: { id: otp.id },
      data: { attempts: newAttempts },
    });
    const remaining = OTP_MAX_ATTEMPTS - newAttempts;
    return {
      valid: false,
      error: `Invalid OTP code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Mark as verified
  await db.oTPVerification.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return { valid: true };
}

/**
 * Checks if a phone has a recently verified OTP (used by registration).
 * Prevents registration without completing OTP verification.
 */
export async function isPhoneOTPVerified(
  phone: string,
  purpose: string = "REGISTRATION"
): Promise<boolean> {
  const cutoff = new Date(Date.now() - OTP_VERIFIED_WINDOW_MS);
  const verified = await db.oTPVerification.findFirst({
    where: {
      phone,
      purpose,
      verified: true,
      updatedAt: { gte: cutoff },
    },
  });
  return !!verified;
}
