import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation/auth.schemas";
import { verifyOTP, isPhoneOTPVerified } from "@/lib/otp";
import { isPasswordStrong } from "@/lib/password";

/**
 * POST /api/auth/reset-password
 * Resets a user's password after OTP verification.
 * Body: { phone: string, otpCode: string, newPassword: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, otpCode, newPassword } = parsed.data;

    // Password strength check
    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json(
        { error: "Password does not meet strength requirements" },
        { status: 400 }
      );
    }

    // Verify OTP — MANDATORY (demo mode shows the code in the UI).
    const alreadyVerified = await isPhoneOTPVerified(phone, "PASSWORD_RESET");
    if (!alreadyVerified) {
      const otpResult = await verifyOTP(phone, otpCode, "PASSWORD_RESET");
      if (!otpResult.valid) {
        return NextResponse.json(
          { error: otpResult.error || "Invalid OTP code" },
          { status: 400 }
        );
      }
    }

    // Find user by phone
    const user = await db.user.findUnique({
      where: { phone },
      select: { id: true, isBlocked: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number." },
        { status: 404 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json(
      { message: "Password reset successfully. You can now login with your new password." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
