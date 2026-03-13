import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TraceTable } from "@/components/TraceTable";
import { Id } from "@/convex/_generated/dataModel";

// Demo project ID — in production, derive from Clerk org/user
const DEMO_PROJECT_ID = process.env.DEMO_PROJECT_ID as Id<"projects"> | undefined;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-white">Traceform</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">alpha</span>
        </div>
        <span className="text-sm text-gray-400">AI Agent Observability</span>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Traces</h1>
          <p className="text-gray-400 text-sm">Real-time stream of agent executions</p>
        </div>
        {DEMO_PROJECT_ID ? (
          <TraceTable projectId={DEMO_PROJECT_ID} />
        ) : (
          <div className="rounded-lg border border-gray-800 p-8 text-center">
            <p className="text-gray-400 mb-2">No project configured</p>
            <p className="text-gray-600 text-sm">Set DEMO_PROJECT_ID env var after creating a project</p>
          </div>
        )}
      </main>
    </div>
  );
}
