import { NextResponse } from "next/server";
import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import { mapAgentTurnToCustomerPayload } from "@/lib/agent/customer-mappers";
import { runAdvisorTurn } from "@/lib/agent/response-planner";
import type { AgentTurnRequest } from "@/lib/agent/schemas";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AgentTurnRequest>;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const turn = runAdvisorTurn({
    message,
    currentFacts: body.currentFacts,
    entryPage: body.entryPage,
  });
  const customerPayload = mapAgentTurnToCustomerPayload(turn);
  assertCustomerSafePayload(customerPayload);

  return NextResponse.json(customerPayload);
}
