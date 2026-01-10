import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthTestPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <p className="text-gray-700">You are not logged in.</p>
          <a href="/login" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Authenticated!</h1>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Session Data:</h2>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href="/app"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            <a
              href="/api/auth/signout"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
