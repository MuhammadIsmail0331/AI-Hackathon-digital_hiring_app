import { NextResponse } from "next/server";
import { generateOTP, checkOTPSendAllowed } from "@/lib/otp";
import { db } from "@/lib/db";

/**
 * POST /api/auth/otp/send
 * Sends a 6-digit OTP to the given phone number.
 * Body: { phone: string, purpose?: string }
 *
 * Rate limiting: 60-second cooldown between sends per phone.
 * DEV MODE: Returns the OTP code in the response for testing.
 * PRODUCTION: Code is sent via SMS only, never returned.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, purpose = "REGISTRATION" } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Rate limiting: cooldown + lockout check
    const rateLimitError = await checkOTPSendAllowed(phone, purpose);
    if (rateLimitError) {
      return NextResponse.json(
        { error: rateLimitError },
        { status: 429 }
      );
    }

    // For registration: check if phone already has an account
    if (purpose === "REGISTRATION") {
      const existing = await db.user.findUnique({
        where: { phone },
        select: { id: true, name: true },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "An account with this phone number already exists. Please login instead.",
            existingAccount: true,
          },
          { status: 409 }
        );
      }
    }

    // For password reset: check if phone has an account
    if (purpose === "PASSWORD_RESET") {
      const existing = await db.user.findUnique({
        where: { phone },
        select: { id: true, name: true },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "No account found with this phone number." },
          { status: 404 }
        );
      }
    }

    const { otpId, code } = await generateOTP(phone, purpose);

    return NextResponse.json(
      {
        message: "OTP sent successfully",
        otpId,
        // Only include code in development mode
        ...(code !== null && { code }),
        expiresIn: 300,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
