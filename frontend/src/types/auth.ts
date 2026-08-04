// src/types/auth.ts

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                Common Rules                                */
/* -------------------------------------------------------------------------- */

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

const password = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character."
  );

const name = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters.")
  .max(100, "Name is too long.");

/* -------------------------------------------------------------------------- */
/*                               Login Schema                                 */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/*                             Register Schema                                */
/* -------------------------------------------------------------------------- */

export const registerSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/* -------------------------------------------------------------------------- */
/*                           Forgot Password                                  */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  email,
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/*                            Reset Password                                  */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/*                             Profile Update                                 */
/* -------------------------------------------------------------------------- */

export const updateProfileSchema = z.object({
  name,
  email,
});

export type UpdateProfileFormData = z.infer<
  typeof updateProfileSchema
>;

/* -------------------------------------------------------------------------- */
/*                              Password Change                               */
/* -------------------------------------------------------------------------- */

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ChangePasswordFormData = z.infer<
  typeof changePasswordSchema
>;
