import { NextResponse } from "next/server";
import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import { runRealAdvisorTurn } from "@/lib/agent/realAdvisorOrchestrator";
import { mapRealAgentTurnToCustomerPayload } from "@/lib/agent/realCustomerMapper";
import type { AgentTurnRequest } from "@/lib/agent/schemas";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AgentTurnRequest>;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const result = await runRealAdvisorTurn({
    message,
    currentFacts: body.currentFacts,
    entryPage: body.entryPage,
  });
  const customerPayload = mapRealAgentTurnToCustomerPayload(result.turn);
  assertCustomerSafePayload(customerPayload);

  return NextResponse.json(customerPayload);
}
