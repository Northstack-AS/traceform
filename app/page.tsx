import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-8">
          Traceform
        </p>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight mb-4">
          The black box for<br className="hidden sm:block" /> your AI agents.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-xl mb-10 leading-relaxed">
          Capture every trace, span, and tool call from your AI agents —
          without changing your architecture.
        </p>

        <div className="relative flex flex-col items-center gap-4 w-full max-w-md">
          <WaitlistForm />
          <p className="text-xs text-neutral-600 font-mono">
            Launching Q2 2026 · Built by Northstack
          </p>
        </div>
      </section>

      {/* Feature blocks */}
      <section className="border-t border-neutral-800 px-6 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800">
          <div className="px-0 sm:px-10 py-10 sm:py-0 first:pt-0 sm:first:pt-0 first:pl-0">
            <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-3">
              01
            </p>
            <h2 className="text-lg font-semibold text-white mb-3">Drop-in SDK</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Install in 2 lines. Works with any agent framework — LangChain,
              Vercel AI SDK, raw OpenAI. Zero lock-in.
            </p>
            <pre className="mt-5 bg-neutral-900 border border-neutral-800 rounded p-4 text-xs font-mono text-neutral-300 overflow-x-auto">
              <code>{`npm install @traceform/sdk\nimport { trace } from "@traceform/sdk";`}</code>
            </pre>
          </div>

          <div className="px-0 sm:px-10 py-10 sm:py-0">
            <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-3">
              02
            </p>
            <h2 className="text-lg font-semibold text-white mb-3">Full trace visibility</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              See every LLM call, tool execution, and retrieval step. Waterfall
              timeline. Input/output at every node.
            </p>
            <div className="mt-5 space-y-2">
              {["LLM call · 340ms", "Tool: search · 120ms", "Retrieval · 85ms", "LLM call · 290ms"].map(
                (label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="h-1.5 bg-neutral-600 rounded-full"
                      style={{ width: `${[70, 30, 22, 60][i]}%` }}
                    />
                    <span className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="px-0 sm:px-10 py-10 sm:py-0 last:pb-0 sm:last:pb-0 last:pr-0">
            <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-3">
              03
            </p>
            <h2 className="text-lg font-semibold text-white mb-3">Cost & performance</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Token spend by model, latency by step, error rate over time. Know
              what your agents cost before your bill does.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "tokens", value: "142k" },
                { label: "p95 latency", value: "1.4s" },
                { label: "error rate", value: "0.3%" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-neutral-900 border border-neutral-800 rounded p-3 text-center"
                >
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
