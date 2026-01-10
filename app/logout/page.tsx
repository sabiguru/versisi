"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";

export default function LogoutPage() {
  useEffect(() => {
    // Sign out and redirect to home page
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Logo className="w-32 mx-auto mb-6" />
        <div className="animate-pulse">
          <p className="text-lg text-text/70">Signing you out...</p>
        </div>
      </div>
    </div>
  );
}
