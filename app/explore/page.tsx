import Link from "next/link";
import { SiteNav } from "@/components/ui/site-nav";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Code, Palette, Smartphone, Zap, Building, Users2, Rocket } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav bordered />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Built for every kind of{" "}
            <span className="text-accent">software project</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            From freelance developers to enterprise agencies, Versisi adapts to your workflow and eliminates scope disputes.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Freelance Developers */}
          <div className="mb-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                  <Code className="w-4 h-4" />
                  Freelancers
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Freelance Developers
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Protect yourself from scope creep and payment disputes. Get clients to sign off on exactly what they're asking for before you write a single line of code.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">The Challenge</h4>
                    <p className="text-sm text-gray-600">
                      "Can you add just one more feature?" turns into weeks of unpaid work. Without signed agreements, clients dispute what was originally agreed upon.
                    </p>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <h4 className="font-semibold text-gray-900 mb-2">The Solution</h4>
                    <p className="text-sm text-gray-600">
                      Present a detailed scope proposal, get cryptographic signatures from all stakeholders, and have immutable proof of exactly what was agreed. New requests? New proposal required.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white text-lg font-bold">
                      JD
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">John Doe</div>
                      <div className="text-sm text-gray-500">Freelance Full-Stack Developer</div>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed mb-4">
                    "Since using Versisi, I've had zero scope disputes. Clients know exactly what they're getting, and I have cryptographic proof of every agreement. It's saved me countless hours of unpaid work."
                  </blockquote>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-accent">47</span>
                      <span>projects completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-accent">$284K</span>
                      <span>protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Agencies */}
          <div className="mb-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-gray-900">Brand Redesign Project v2.0</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">APPROVED</div>
                        <span className="text-xs text-gray-500">Signed by 5 stakeholders</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <div>
                          <div className="font-medium text-gray-900">Logo redesign (3 concepts)</div>
                          <div className="text-xs text-gray-500">2 revision rounds included</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <div>
                          <div className="font-medium text-gray-900">Brand guidelines document</div>
                          <div className="text-xs text-gray-500">Typography, colors, spacing</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <div>
                          <div className="font-medium text-gray-900">Social media templates</div>
                          <div className="text-xs text-gray-500">10 templates for Instagram & Twitter</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Timeline: 6 weeks</span>
                        <span>Budget: $12,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
                  <Palette className="w-4 h-4" />
                  Agencies
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Design & Development Agencies
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Manage complex projects with multiple stakeholders. Get unanimous approval on deliverables, timelines, and budgets before your team invests a single hour.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">The Challenge</h4>
                    <p className="text-sm text-gray-600">
                      Multiple stakeholders with conflicting opinions lead to endless revisions. "I thought we agreed on..." becomes a weekly conversation.
                    </p>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <h4 className="font-semibold text-gray-900 mb-2">The Solution</h4>
                    <p className="text-sm text-gray-600">
                      Get all decision-makers to sign the same scope document. Version control ensures everyone's on the same page, and audit trails show who approved what.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Development */}
          <div className="mb-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                  <Smartphone className="w-4 h-4" />
                  Mobile Apps
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Mobile App Projects
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Define features, user flows, and technical requirements with crystal clarity. Track scope changes through the entire development lifecycle.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">The Challenge</h4>
                    <p className="text-sm text-gray-600">
                      "Can we add push notifications? And maybe a chat feature?" Features multiply mid-project, budgets explode, and timelines slip by months.
                    </p>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <h4 className="font-semibold text-gray-900 mb-2">The Solution</h4>
                    <p className="text-sm text-gray-600">
                      Lock down the MVP scope, get signatures, and start building. New feature requests? Create a v2 proposal with updated timelines and costs. All changes tracked and approved.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Fitness App MVP - v1.0</h4>
                    <div className="flex gap-2 mb-4">
                      <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">iOS</div>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Android</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm mb-4">
                    <div className="pb-2 border-b border-gray-100">
                      <div className="font-medium text-gray-900 mb-1">Core Features (MVP)</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">User registration & profiles</span>
                      <span className="text-accent">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Workout tracking</span>
                      <span className="text-accent">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Progress charts</span>
                      <span className="text-accent">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Exercise library (50 exercises)</span>
                      <span className="text-accent">✓</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">12 weeks • $48K</span>
                      <span className="text-green-700 font-medium">Locked & Approved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Software */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="font-semibold text-gray-900">ERP Integration Project</div>
                        <div className="text-sm text-gray-500">Phase 1: User Management</div>
                      </div>
                      <Building className="w-8 h-8 text-accent" />
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stakeholders signed</span>
                        <span className="font-semibold text-gray-900">8 / 8</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Technical requirements</span>
                        <span className="font-semibold text-gray-900">142 items</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Acceptance criteria</span>
                        <span className="font-semibold text-gray-900">89 criteria</span>
                      </div>
                    </div>
                    <div className="bg-accent/10 rounded p-3 text-xs text-gray-700">
                      <div className="font-medium mb-1">Audit Trail: Complete</div>
                      <div className="text-gray-600">Every requirement approved by CTO, CFO, and project sponsors. Zero ambiguity on deliverables.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                  <Building className="w-4 h-4" />
                  Enterprise
                </div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
                  Enterprise Software Projects
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Manage complex integrations with extensive requirements and multiple approval layers. Ensure compliance, traceability, and accountability at every step.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">The Challenge</h4>
                    <p className="text-sm text-gray-600">
                      Hundred-page requirement docs that nobody reads. Changes get lost in email chains. Compliance teams can't verify what was actually agreed upon.
                    </p>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <h4 className="font-semibold text-gray-900 mb-2">The Solution</h4>
                    <p className="text-sm text-gray-600">
                      Structured scope documents with clear acceptance criteria. Cryptographic signatures from all stakeholders. Complete audit trail for compliance. Export everything for external audits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Stats */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The cost of unclear scope
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scope creep costs the software industry billions every year. Here's what teams are dealing with:
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <div className="text-5xl font-bold text-accent mb-2">52%</div>
              <div className="text-gray-600">
                of projects experience significant scope creep
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <div className="text-5xl font-bold text-accent mb-2">$75K</div>
              <div className="text-gray-600">
                average cost overrun per project due to scope changes
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <div className="text-5xl font-bold text-accent mb-2">3.2x</div>
              <div className="text-gray-600">
                more time spent on projects without clear scope agreements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Size Recommendations */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
              Perfect for teams of any size
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're a solo freelancer or a 100-person agency
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-accent transition-colors">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Users2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">Solo & Small Teams</h3>
              <p className="text-gray-600 text-sm mb-4">1-5 people</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Fast setup and onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Simple approval workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Perfect for client projects</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-accent hover:border-accent transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">Growing Agencies</h3>
              <p className="text-gray-600 text-sm mb-4">5-50 people</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Multi-project management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Team collaboration features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Client portal access</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-accent transition-colors">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-4">50+ people</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Advanced compliance features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Custom approval workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>SSO and enterprise integrations</span>
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
            Start protecting your projects today
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join hundreds of teams creating clear, cryptographically signed scope agreements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            >
              Explore all features
            </Link>
          </div>
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
              <Link href="/explore" className="hover:text-gray-900 transition-colors">
                Explore
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
