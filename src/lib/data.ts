import { sql } from "@/lib/db";
import { buildDemoLedger, mapEntry, mapPerson, mapPreferences } from "@/lib/seed";
import type { Entry, LedgerState, Preferences } from "@/lib/types";
import { ensurePerson } from "@/lib/ledger";

export async function loadLedger(userId: string): Promise<LedgerState> {
  const db = sql();
  const [peopleRows, entryRows, prefRows] = await Promise.all([
    db`SELECT id, name, color FROM people WHERE user_id = ${userId} ORDER BY name`,
    db`SELECT * FROM entries WHERE user_id = ${userId} ORDER BY date DESC, created_at DESC`,
    db`SELECT * FROM preferences WHERE user_id = ${userId} LIMIT 1`,
  ]);

  return {
    people: peopleRows.map((r) => mapPerson(r as { id: string; name: string; color: string })),
    entries: entryRows.map((r) => mapEntry(r as Record<string, unknown>)),
    preferences: mapPreferences(prefRows[0] as Record<string, unknown> | undefined),
  };
}

export async function upsertPreferences(userId: string, prefs: Preferences) {
  const db = sql();
  await db`
    INSERT INTO preferences (user_id, theme, accent, currency, density, confirm_actions, updated_at)
    VALUES (${userId}, ${prefs.theme}, ${prefs.accent}, ${prefs.currency}, ${prefs.density}, ${prefs.confirmActions}, now())
    ON CONFLICT (user_id) DO UPDATE SET
      theme = EXCLUDED.theme,
      accent = EXCLUDED.accent,
      currency = EXCLUDED.currency,
      density = EXCLUDED.density,
      confirm_actions = EXCLUDED.confirm_actions,
      updated_at = now()
  `;
}

export async function addEntry(
  userId: string,
  input: {
    personName: string;
    direction: Entry["direction"];
    assetType: Entry["assetType"];
    amount: number;
    itemName?: string;
    category?: string;
    date: string;
    expectedBack?: string;
    reminder?: string;
  },
) {
  const db = sql();
  const ledger = await loadLedger(userId);
  const { people, person } = ensurePerson(ledger.people, input.personName);

  if (!ledger.people.find((p) => p.id === person.id)) {
    await db`
      INSERT INTO people (id, user_id, name, color)
      VALUES (${person.id}, ${userId}, ${person.name}, ${person.color})
    `;
  }

  const rows = await db`
    INSERT INTO entries (
      user_id, person_id, direction, asset_type, amount, paid,
      item_name, category, date, expected_back, reminder, settled
    ) VALUES (
      ${userId}, ${person.id}, ${input.direction}, ${input.assetType},
      ${input.amount}, 0, ${input.itemName ?? null}, ${input.category ?? null},
      ${input.date}, ${input.expectedBack ?? null}, ${input.reminder ?? null}, false
    )
    RETURNING *
  `;

  return { people, entry: mapEntry(rows[0] as Record<string, unknown>) };
}

export async function settleEntry(userId: string, entryId: string) {
  const db = sql();
  await db`
    UPDATE entries
    SET settled = true,
        paid = CASE WHEN asset_type = 'money' THEN amount ELSE paid END,
        settled_at = CURRENT_DATE
    WHERE id = ${entryId} AND user_id = ${userId}
  `;
}

export async function deleteEntry(userId: string, entryId: string) {
  const db = sql();
  await db`DELETE FROM entries WHERE id = ${entryId} AND user_id = ${userId}`;
}

export async function replaceWithDemo(userId: string) {
  const db = sql();
  const demo = buildDemoLedger();
  await db`DELETE FROM entries WHERE user_id = ${userId}`;
  await db`DELETE FROM people WHERE user_id = ${userId}`;

  for (const person of demo.people) {
    await db`
      INSERT INTO people (id, user_id, name, color)
      VALUES (${person.id}, ${userId}, ${person.name}, ${person.color})
    `;
  }

  for (const entry of demo.entries) {
    await db`
      INSERT INTO entries (
        id, user_id, person_id, direction, asset_type, amount, paid,
        item_name, category, date, expected_back, reminder, settled, settled_at, created_at
      ) VALUES (
        ${entry.id}, ${userId}, ${entry.personId}, ${entry.direction}, ${entry.assetType},
        ${entry.amount}, ${entry.paid}, ${entry.itemName ?? null}, ${entry.category ?? null},
        ${entry.date}, ${entry.expectedBack ?? null}, ${entry.reminder ?? null},
        ${entry.settled}, ${entry.settledAt ?? null}, ${entry.createdAt}
      )
    `;
  }

  await upsertPreferences(userId, demo.preferences);
  return loadLedger(userId);
}

export async function importLedger(userId: string, data: LedgerState) {
  const db = sql();
  await db`DELETE FROM entries WHERE user_id = ${userId}`;
  await db`DELETE FROM people WHERE user_id = ${userId}`;

  for (const person of data.people ?? []) {
    await db`
      INSERT INTO people (id, user_id, name, color)
      VALUES (${person.id}, ${userId}, ${person.name}, ${person.color})
    `;
  }

  for (const entry of data.entries ?? []) {
    await db`
      INSERT INTO entries (
        id, user_id, person_id, direction, asset_type, amount, paid,
        item_name, category, date, expected_back, reminder, settled, settled_at, created_at
      ) VALUES (
        ${entry.id}, ${userId}, ${entry.personId}, ${entry.direction}, ${entry.assetType},
        ${entry.amount}, ${entry.paid}, ${entry.itemName ?? null}, ${entry.category ?? null},
        ${entry.date}, ${entry.expectedBack ?? null}, ${entry.reminder ?? null},
        ${entry.settled}, ${entry.settledAt ?? null}, ${entry.createdAt ?? new Date().toISOString()}
      )
    `;
  }

  if (data.preferences) await upsertPreferences(userId, data.preferences);
  return loadLedger(userId);
}
