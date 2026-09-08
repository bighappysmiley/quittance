import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { addEntry, deleteEntry, settleEntry } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const result = await addEntry(session.user.id, body);
  return NextResponse.json(result);
}

export async function PATCH(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body.action === "settle") {
    await settleEntry(session.user.id, body.entryId);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
  }
  await deleteEntry(session.user.id, entryId);
  return NextResponse.json({ ok: true });
}
