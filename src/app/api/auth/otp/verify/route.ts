import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";

/**
 * POST /api/auth/otp/verify
 * Verifies an OTP code with brute-force protection.
 * Body: { phone: string, code: string, purpose?: string }
 *
 * Returns generic error messages to prevent information leakage.
 * Locks OTP after 5 failed attempts for 15 minutes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, purpose = "REGISTRATION" } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const result = await verifyOTP(phone, code, purpose);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Invalid OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { verified: true, message: "Phone number verified successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
