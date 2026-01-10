"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Github, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      const result = await signIn(provider, { callbackUrl });
      console.log("Sign in result:", result);
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Send OTP to email
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        token: otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialSignIn("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={() => handleSocialSignIn("github")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        <button
          onClick={() => handleSocialSignIn("gitlab")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FC6D26">
            <path d="M23.6 9.593l-.033-.086L20.3.98a.851.851 0 0 0-.336-.405.875.875 0 0 0-.526-.124.9.9 0 0 0-.476.185 1.036 1.036 0 0 0-.348.445l-2.233 6.853H7.618L5.385 1.08a1.035 1.035 0 0 0-.348-.444.9.9 0 0 0-.476-.186.875.875 0 0 0-.525.124.85.85 0 0 0-.337.405L.432 9.506l-.032.087a6.002 6.002 0 0 0 1.988 6.934l.01.008.03.022 4.97 3.721 2.458 1.862 1.497 1.135a1.008 1.008 0 0 0 1.223 0l1.497-1.135 2.458-1.862 5-3.75.008-.005a6.002 6.002 0 0 0 1.988-6.934"/>
          </svg>
          Continue with GitLab
        </button>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-xs text-gray-500">OR</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Email OTP */}
      {!otpSent ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@company.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Continue with Email"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-900">
              Enter verification code
            </label>
            <p className="mb-3 text-sm text-gray-600">
              We sent a code to <strong>{email}</strong>
            </p>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-center text-2xl font-mono tracking-widest text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="000000"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setError("");
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Use a different email
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
