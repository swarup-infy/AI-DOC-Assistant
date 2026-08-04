import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../../layouts/AuthLayout";
import { loginSchema } from "../../types/auth";
import type { LoginFormData } from "../../types/auth";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError("");

    try {
      const response = await loginUser(data);

      await login(response.access_token);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold text-center mb-6">
        AI Document Assistant
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">
            Email
          </label>

          <input
            type="email"
            {...register("email")}
            className="w-full border rounded-lg p-3"
            placeholder="Enter your email"
          />

          <p className="text-red-500 text-sm">
            {errors.email?.message}
          </p>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Password
          </label>

          <input
            type="password"
            {...register("password")}
            className="w-full border rounded-lg p-3"
            placeholder="Enter your password"
          />

          <p className="text-red-500 text-sm">
            {errors.password?.message}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
        >
          {isSubmitting ? "Signing In..." : "Login"}
        </button>

        <p className="text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
