import { LoginForm } from "@/components/auth/login-form";
import { SiteNav } from "@/components/ui/site-nav";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav bordered />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Versisi account
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
