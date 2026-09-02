import { NextResponse } from "next/server";
import { generateOTP, checkOTPSendAllowed } from "@/lib/otp";
import { db } from "@/lib/db";

/**
 * POST /api/auth/forgot-password
 * Sends a password-reset OTP to the phone number on file.
 * Body: { phone: string }
 *
 * Rate limited: 60-second cooldown between sends.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitError = await checkOTPSendAllowed(phone, "PASSWORD_RESET");
    if (rateLimitError) {
      return NextResponse.json(
        { error: rateLimitError },
        { status: 429 }
      );
    }

    // Verify account exists
    const user = await db.user.findUnique({
      where: { phone },
      select: { id: true, name: true, isBlocked: true },
    });

    if (!user) {
      // Generic response to prevent phone enumeration
      return NextResponse.json(
        { message: "If an account exists with this phone number, an OTP has been sent." },
        { status: 200 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const { otpId, code } = await generateOTP(phone, "PASSWORD_RESET");

    return NextResponse.json(
      {
        message: "If an account exists with this phone number, an OTP has been sent.",
        // Only expose otpId and code in development for testing
        ...(code !== null && { otpId, code }),
        expiresIn: 300,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
