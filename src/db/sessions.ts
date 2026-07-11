import { db } from "./index.js";
import type { Requirements } from "../review/validation.js";

export interface SessionSummary {
  id: number;
  createdAt: string;
}

export interface SessionDetail extends SessionSummary {
  mermaidSource: string;
  requirements: Requirements;
  critiqueText: string;
}

interface SessionRow {
  id: number;
  created_at: string;
  mermaid_source: string;
  requirements_json: string;
  critique_text: string;
}

export function createSession(
  mermaidSource: string,
  requirements: Requirements,
  critiqueText: string
): SessionDetail {
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO sessions (created_at, mermaid_source, requirements_json, critique_text)
     VALUES (?, ?, ?, ?)`
  );
  const result = stmt.run(
    createdAt,
    mermaidSource,
    JSON.stringify(requirements),
    critiqueText
  );

  return {
    id: Number(result.lastInsertRowid),
    createdAt,
    mermaidSource,
    requirements,
    critiqueText,
  };
}

export function listSessions(): SessionSummary[] {
  const rows = db
    .prepare(`SELECT id, created_at FROM sessions ORDER BY created_at DESC`)
    .all() as Pick<SessionRow, "id" | "created_at">[];

  return rows.map((row) => ({ id: row.id, createdAt: row.created_at }));
}

export function getSession(id: number): SessionDetail | null {
  const row = db
    .prepare(`SELECT * FROM sessions WHERE id = ?`)
    .get(id) as SessionRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    createdAt: row.created_at,
    mermaidSource: row.mermaid_source,
    requirements: JSON.parse(row.requirements_json),
    critiqueText: row.critique_text,
  };
}
