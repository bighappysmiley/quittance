import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { loadLedger } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ledger = await loadLedger(session.user.id);
  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    ledger,
  });
}
