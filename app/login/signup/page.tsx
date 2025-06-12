"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import Head from "next/head";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      setError("Password must be at least 8 characters, include upper/lowercase, number, and a special character.");
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        phoneNumber: trimmedPhone,
      });

      if (result.success) {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.error || "Failed to create account.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`An unexpected error occurred: ${errorMessage}`);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign up for PROPAL AI</title>
        <meta name="description" content="Create a new PROPAL AI account to start your journey." />
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 bg-black">
        <div className="w-full max-w-md bg-[var(--ui-bg-primary)] rounded-2xl shadow-xl p-8 space-y-6 text-[var(--ui-text-primary)]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-700">Create your account</h2>
            <p className="mt-2 text-sm text-blue-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[var(--ui-indigo-accent)] hover:text-[var(--ui-blue-hover)]">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full propel-input px-4 py-2.5"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full propel-input px-4 py-2.5"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full propel-input pr-10 px-4 py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 hover:text-[var(--ui-green-accent)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <input
              type="tel"
              name="phone-number"
              placeholder="Phone Number (optional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full propel-input px-4 py-2.5"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full propel-btn py-2 bd-indigo-700 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
