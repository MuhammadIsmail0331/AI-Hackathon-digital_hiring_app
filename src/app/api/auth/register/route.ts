import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth.schemas";
import { verifyOTP, isPhoneOTPVerified } from "@/lib/otp";
import { isPasswordStrong } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role, otpCode } = parsed.data;

    // Password strength check (redundant with Zod but gives friendlier messages)
    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        { error: "Password does not meet strength requirements" },
        { status: 400 }
      );
    }

    // OTP verification — skip if not provided (temporary bypass)
    let phoneVerified = false;
    if (otpCode) {
      // Check if OTP was already verified by the verify endpoint
      const alreadyVerified = await isPhoneOTPVerified(phone, "REGISTRATION");
      if (!alreadyVerified) {
        // Try to verify now (handles case where user submitted code directly)
        const otpResult = await verifyOTP(phone, otpCode, "REGISTRATION");
        if (!otpResult.valid) {
          return NextResponse.json(
            { error: otpResult.error || "Invalid OTP code" },
            { status: 400 }
          );
        }
      }
      phoneVerified = true;
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, isBlocked: true },
    });

    if (existingEmail) {
      if (existingEmail.isBlocked) {
        return NextResponse.json(
          { error: "This account has been suspended. Please contact support." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists. Please login instead.", existingAccount: true },
        { status: 409 }
      );
    }

    // Duplicate prevention: check phone as primary identifier
    const existingPhone = await db.user.findUnique({
      where: { phone },
      select: { id: true, name: true, isBlocked: true, role: true },
    });

    if (existingPhone) {
      if (existingPhone.isBlocked) {
        return NextResponse.json(
          { error: "This account has been suspended. Please contact support." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          error: `An account with this phone number already exists (${existingPhone.name}). Please login instead.`,
          existingAccount: true,
        },
        { status: 409 }
      );
    }

    // Check if the user is in the blocked list (by phone)
    const blockedCheck = await db.blockedUser.findFirst({
      where: {
        user: { phone },
      },
    });
    if (blockedCheck) {
      return NextResponse.json(
        { error: "Registration is not allowed for this phone number. Please contact support." },
        { status: 403 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role,
        phoneVerified,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
