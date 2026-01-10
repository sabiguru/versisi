import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/ui/site-nav";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, CheckCircle, Lock, FileText, GitBranch, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav priorityLogo />

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 items-center gap-3 lg:gap-4">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-bold text-gray-900 leading-[1.05] tracking-tight max-w-3xl mx-auto lg:mx-0">
                Lock scope. Align fast. Deliver confidently.
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed font-light">
                Versisi locks evolving scope into signed versions so teams stay aligned from proposal to delivery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
              >
                Create a scope agreement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
              >
                See how it works
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span>Cryptographic signatures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span>Immutable versions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span>Complete audit trail</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <Image
              src="/hero_sec.webp"
              alt="Illustration of a signed scope agreement workflow"
              width={1080}
              height={720}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-auto max-w-[1100px] rounded-2xl lg:-ml-20"
            />
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </div>
              <div className="text-xs text-gray-500 font-mono">app.sygnoff.com/projects</div>
            </div>
            <div className="p-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">Website Redesign v2.0</div>
                    <div className="text-sm text-gray-500">Last updated 2 hours ago</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-xs font-semibold text-emerald-700 mb-2">APPROVED</div>
                    <div className="text-3xl font-bold text-emerald-900">5</div>
                    <div className="text-xs text-emerald-600 mt-1">Versions</div>
                  </div>
                  <div className="p-5 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-700 mb-2">PENDING</div>
                    <div className="text-3xl font-bold text-blue-900">2</div>
                    <div className="text-xs text-blue-600 mt-1">Approvals</div>
                  </div>
                  <div className="p-5 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="text-xs font-semibold text-purple-700 mb-2">TRACKED</div>
                    <div className="text-3xl font-bold text-purple-900">47</div>
                    <div className="text-xs text-purple-600 mt-1">Events</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for clarity and compliance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every feature designed to eliminate scope creep and provide legal certainty
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Feature 1 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Cryptographic Signatures
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Every approval is cryptographically signed with SHA-256 hashing. IP addresses and
                timestamps captured for verification.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <GitBranch className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Immutable Versions
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Once approved, scope versions cannot be changed. All modifications go through
                explicit proposal and approval workflows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Unanimous Approval
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                All project leaders must explicitly sign. No soft approvals, no auto-approvals.
                Complete transparency for both parties.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Canonical Diffs
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Every change is tracked with deterministic diffs. Know exactly what changed,
                when, and who approved it.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Append-Only Audit Log
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Complete audit trail of every action. Events are never deleted or modified.
                Full traceability for compliance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Export Everything
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Generate PDF, DOCX, or XLSX exports with complete version history, signatures,
                and audit trails. Always have proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple workflow, powerful guarantees
            </h2>
          </div>

          <div className="space-y-10">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent !text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Create a project
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Invite your client and define project members. Both parties get access to a shared workspace.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent !text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Submit a proposal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Create structured scope proposals with sections, items, and acceptance criteria. System generates canonical diffs automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent !text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Everyone signs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All project leaders receive approval requests. They review the snapshot, attest to the agreement, and sign with their typed name.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent !text-white flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Version is created
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Once all signatures are in, the scope version is finalized and locked. It becomes the immutable record for that agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to eliminate scope creep?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join teams using Versisi to create clear, cryptographically signed scope agreements.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo className="w-16 sm:w-20 md:w-24" />
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/ai" className="hover:text-gray-900 transition-colors">
                AI
              </Link>
              <Link href="/explore" className="hover:text-gray-900 transition-colors">
                Explore
              </Link>
              <Link href="/features" className="hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 Versisi. Built for clarity and compliance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
