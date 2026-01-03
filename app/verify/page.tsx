export const dynamic = 'force-dynamic';

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg border border-text/10 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <svg
              className="h-6 w-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="mb-2 font-heading text-2xl font-semibold text-text">
            Check your email
          </h1>
          <p className="text-sm text-text/70">
            A verification link has been sent to your email address. Click the
            link to verify your account.
          </p>

          <div className="mt-6 rounded-md border border-accent/20 bg-accent/5 p-4">
            <p className="text-xs text-text/60">
              If you don&apos;t see the email, check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
