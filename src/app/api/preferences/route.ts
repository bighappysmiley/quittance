import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { upsertPreferences } from "@/lib/data";
import type { Preferences } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prefs = (await req.json()) as Preferences;
  await upsertPreferences(session.user.id, prefs);
  return NextResponse.json({ ok: true });
}
