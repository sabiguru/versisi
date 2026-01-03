import Link from "next/link";
import { SiteNav } from "@/components/ui/site-nav";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav bordered />
      <main className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-4 text-gray-600 text-lg">
          We couldn&apos;t find the page you were looking for. Choose a section below to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md">
            Go home
          </Link>
          <Link
            href="/features"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
          >
            Pricing
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
          >
            Get started
          </Link>
        </div>
      </main>
    </div>
  );
}
