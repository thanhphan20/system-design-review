import { getDb } from "./client";
import type { Requirements, SessionDetail, SessionSummary } from "../types";

interface SessionRow {
  id: number;
  created_at: string;
  mermaid_source: string;
  requirements_json: string;
  critique_text: string;
}

export async function createSession(
  mermaidSource: string,
  requirements: Requirements,
  critiqueText: string
): Promise<SessionDetail> {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const result = await db.execute({
    sql: `INSERT INTO sessions (created_at, mermaid_source, requirements_json, critique_text)
          VALUES (?, ?, ?, ?)`,
    args: [createdAt, mermaidSource, JSON.stringify(requirements), critiqueText],
  });

  return {
    id: Number(result.lastInsertRowid),
    createdAt,
    mermaidSource,
    requirements,
    critiqueText,
  };
}

export async function listSessions(): Promise<SessionSummary[]> {
  const db = await getDb();
  const result = await db.execute(
    `SELECT id, created_at FROM sessions ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    createdAt: String(row.created_at),
  }));
}

export async function getSession(id: number): Promise<SessionDetail | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT * FROM sessions WHERE id = ?`,
    args: [id],
  });

  const row = result.rows[0] as unknown as SessionRow | undefined;
  if (!row) return null;

  return {
    id: Number(row.id),
    createdAt: String(row.created_at),
    mermaidSource: String(row.mermaid_source),
    requirements: JSON.parse(String(row.requirements_json)),
    critiqueText: String(row.critique_text),
  };
}
