import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TraceDetailClient } from "./TraceDetailClient";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  params: Promise<{ traceId: string }>;
}

export default async function TraceDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { traceId } = await params;

  return <TraceDetailClient traceId={traceId as Id<"traces">} />;
}
