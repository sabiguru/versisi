export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">See how it works</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
            From proposal to signed scope, end to end.
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Walk through the Versisi flow: capture requirements, request approvals, and lock signed scope versions everyone can trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Capture scope",
              body: "Add sections, items, and acceptance criteria so everyone agrees on what’s in and what’s out.",
            },
            {
              title: "Request approvals",
              body: "Invite clients and teammates to review the snapshot, sign with their name, and attest to the scope.",
            },
            {
              title: "Lock the version",
              body: "Once approved, the version is sealed with hashes and audit logs, keeping delivery aligned.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold">
                {card.title.slice(0, 1)}
              </div>
              <h2 className="font-heading text-xl font-semibold text-gray-900">{card.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center space-y-4">
          <h3 className="font-heading text-2xl font-semibold text-gray-900">Want a full walkthrough?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule a guided session with our team to see Versisi in action and map it to your workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
            >
              Start free
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
