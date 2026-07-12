"use client";

import { useEffect, useState } from "react";
import type { SessionDetail, SessionSummary } from "@/lib/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then(setSessions);
  }, []);

  async function loadDetail(id: number) {
    const res = await fetch(`/api/sessions/${id}`);
    if (!res.ok) return;
    setDetail(await res.json());
  }

  return (
    <>
      <ul className="session-list">
        {sessions?.map((session) => (
          <li key={session.id}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                loadDetail(session.id);
              }}
            >
              {new Date(session.createdAt).toLocaleString()}
            </a>
          </li>
        ))}
      </ul>
      {sessions?.length === 0 && <p>No past sessions yet.</p>}

      {detail && (
        <section>
          <h2>Session detail</h2>
          <h3>Diagram</h3>
          <pre>{detail.mermaidSource}</pre>
          <h3>Requirements</h3>
          <pre>{JSON.stringify(detail.requirements, null, 2)}</pre>
          <h3>Critique</h3>
          <pre>{detail.critiqueText}</pre>
        </section>
      )}
    </>
  );
}
