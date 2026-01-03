import { SiteNav } from "@/components/ui/site-nav";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AiPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav bordered />
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
            AI assistance for every agreement
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Versisi AI drafts scope, summarizes changes, and flags risks so you deliver signed agreements faster and with less back-and-forth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
            >
              See features
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "Draft proposals instantly",
                copy: "Generate structured scope drafts from bullet points, saving hours per project.",
              },
              {
                title: "Risk and clarity checks",
                copy: "Detect vague requirements and missing acceptance criteria before clients do.",
              },
              {
                title: "Change summaries",
                copy: "Summarize diffs between versions so stakeholders can approve faster.",
              },
              {
                title: "Signature-ready outputs",
                copy: "Produce clean, signed snapshots with hashes and audit trails included.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
