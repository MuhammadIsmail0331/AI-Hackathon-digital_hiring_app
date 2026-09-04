import { z } from "zod";
import { ROLES } from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+92|0)?3\d{9}$/, "Please enter a valid Pakistani phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Must include at least one special character"),
  role: z.enum(ROLES, {
    message: "Please select Worker or Employer",
  }),
  otpCode: z.string().length(6, "Please enter the 6-digit OTP code"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+92|0)?3\d{9}$/, "Please enter a valid Pakistani phone number"),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  otpCode: z.string().length(6, "Please enter the 6-digit OTP code"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Must include at least one special character"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
