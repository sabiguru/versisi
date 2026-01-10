import Link from "next/link";
import { SiteNav } from "@/components/ui/site-nav";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav bordered />
      <div className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-semibold text-text">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-text/70">
            Simple, transparent pricing for scope agreements
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-text/10 bg-white p-8">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Free
            </h2>
            <p className="mt-2 text-text/70">For individuals and small teams</p>
            <div className="mt-6">
              <span className="font-heading text-4xl font-bold text-text">
                $0
              </span>
              <span className="text-text/70">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Unlimited projects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Version control</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Client portal</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-accent bg-white p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold text-text">
                Pro
              </h2>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium !text-white">
                Coming Soon
              </span>
            </div>
            <p className="mt-2 text-text/70">For agencies and enterprises</p>
            <div className="mt-6">
              <span className="font-heading text-4xl font-bold text-text">
                TBD
              </span>
              <span className="text-text/70">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Advanced exports</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">✓</span>
                <span className="text-text">Priority support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-md bg-accent px-6 py-3 font-medium !text-white transition-colors hover:bg-accent/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
