import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { importLedger, replaceWithDemo } from "@/lib/data";
import type { LedgerState } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body.action === "demo") {
    const ledger = await replaceWithDemo(session.user.id);
    return NextResponse.json({ ledger });
  }
  if (body.action === "import" && body.ledger) {
    const ledger = await importLedger(
      session.user.id,
      body.ledger as LedgerState,
    );
    return NextResponse.json({ ledger });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
