import Link from "next/link";
import { SiteNav } from "@/components/ui/site-nav";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Lock, GitBranch, Users, Shield, CheckCircle, Hash, Download, Clock, Eye, Zap } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav bordered />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Everything you need for{" "}
            <span className="text-accent">ironclad</span> scope agreements
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Versisi combines cryptographic signatures, immutable versioning, and complete audit trails to create the ultimate system of record for scope management.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Cryptographic Signatures */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  <Lock className="w-4 h-4" />
                  Security
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Cryptographic Signatures
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Every approval is cryptographically signed using SHA-256 hashing. We capture IP addresses, user agents, and timestamps to create a verifiable signature that cannot be forged or disputed.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">SHA-256 cryptographic hashing for every signature</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">IP address and user agent capture for verification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Typed name attestation with explicit agreement statement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Tamper-proof signature records stored permanently</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-8 border border-accent/20">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Signature Hash</div>
                      <div className="text-xs text-gray-500">SHA-256</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-gray-600 break-all bg-gray-50 p-3 rounded border border-gray-200">
                    a7f3b9c2e8d4f1a0b6e5c9d7f2a8b1c4e6d9f3a7b2c8e4f0d6a9c7b3e1f8d5a2
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signer</span>
                      <span className="text-gray-900 font-medium">jane@company.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IP Address</span>
                      <span className="text-gray-900 font-mono">192.168.1.42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timestamp</span>
                      <span className="text-gray-900">2025-12-29 14:32:18 UTC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Immutable Versions */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">Version 2.0</div>
                          <div className="text-xs text-gray-500">Approved</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">LOCKED</div>
                    </div>
                    <div className="text-xs text-gray-600 mb-3">
                      Signed by all 3 project leaders • Cannot be modified
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white text-xs font-medium">
                          ✓
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                  <GitBranch className="w-4 h-4" />
                  Immutability
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Immutable Versions
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Once a scope version is approved, it becomes permanently locked. No edits, no deletions, no backtracking. Every change requires a new proposal and unanimous approval.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Versions locked forever after full approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">All changes go through explicit proposal workflow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Complete version history preserved indefinitely</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Zero risk of retroactive modifications or disputes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Canonical Diffs */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
                  <Hash className="w-4 h-4" />
                  Determinism
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Canonical Diffs
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Every proposal automatically generates a deterministic diff showing exactly what changed from the previous version. Diffs are computed once and never recomputed, ensuring consistency.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automatic diff generation on proposal submission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Zero-variance canonical snapshots with SHA-256 hashing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Deterministic change IDs for every modification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Diffs computed once, never recomputed or altered</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-sm font-mono">
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="text-gray-500 text-xs mb-2">Changes: 3 added, 1 modified</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0">+</span>
                      <span className="text-gray-700">Section: API Integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0">+</span>
                      <span className="text-gray-700">Item: OAuth 2.0 implementation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0">+</span>
                      <span className="text-gray-700">Item: Rate limiting (100 req/min)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 flex-shrink-0">~</span>
                      <span className="text-gray-700">Timeline: 6 weeks → 8 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* More Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Unanimous Approval */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Unanimous Approval
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                All designated project leaders must explicitly sign. No shortcuts, no auto-approvals. Complete transparency for both parties.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Explicit sign-off required from all parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Real-time approval status tracking</span>
                </li>
              </ul>
            </div>

            {/* Append-Only Audit Log */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Append-Only Audit Log
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Complete audit trail of every action. Events are never deleted or modified. Full traceability for compliance and dispute resolution.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Immutable event log with timestamps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Complete history of all project activity</span>
                </li>
              </ul>
            </div>

            {/* Export Everything */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Export Everything
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Generate PDF, DOCX, or XLSX exports with complete version history, signatures, and audit trails. Always have proof.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Multiple export formats available</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Includes all signatures and timestamps</span>
                </li>
              </ul>
            </div>

            {/* Real-Time Collaboration */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Comments & Discussions
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Built-in commenting system for sections and items. Have contextual discussions right where they matter most.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Thread-based discussions on any scope item</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Real-time notifications and updates</span>
                </li>
              </ul>
            </div>

            {/* Version History */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Complete Version History
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Every version is preserved with full context. See exactly what was agreed to at any point in time.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Browse any historical version</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Compare versions side-by-side</span>
                </li>
              </ul>
            </div>

            {/* Snapshot Viewer */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">
                Proposal Snapshots
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Before signing, reviewers see the exact canonical snapshot they're approving. No surprises.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Crystal-clear view of what's being signed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Canonical representation of all terms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to eliminate scope creep?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Start creating clear, cryptographically signed scope agreements today.
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
            <Logo className="w-20 sm:w-24 md:w-28" />
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/features" className="hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">
                Pricing
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
