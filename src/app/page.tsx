"use client";

import { useState } from "react";
import MermaidPreview from "@/components/MermaidPreview";
import RequirementsForm from "@/components/RequirementsForm";
import CritiqueResult from "@/components/CritiqueResult";
import type { Requirements, ValidationError } from "@/lib/types";

const EMPTY_REQUIREMENTS: Requirements = {
  dau: "",
  readWriteRatio: "",
  consistencyNeeds: "",
  latencySla: "",
  growthTargets: "",
};

export default function ReviewPage() {
  const [mermaidSource, setMermaidSource] = useState("");
  const [requirements, setRequirements] = useState<Requirements>(EMPTY_REQUIREMENTS);
  const [mermaidError, setMermaidError] = useState("");
  const [requirementsError, setRequirementsError] = useState("");
  const [critique, setCritique] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMermaidError("");
    setRequirementsError("");
    setCritique(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mermaidSource, requirements }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.mermaidError) {
          setMermaidError(data.mermaidError);
        }
        if (data.requirementsErrors) {
          setRequirementsError(
            (data.requirementsErrors as ValidationError[]).map((e) => e.message).join(", ")
          );
        }
        if (data.error && !data.mermaidError && !data.requirementsErrors) {
          setMermaidError(data.error);
        }
        return;
      }

      setCritique(data.critique);
    } catch (err) {
      setMermaidError("Request failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <section>
        <h2>Diagram (mermaid)</h2>
        <textarea
          rows={14}
          placeholder={"flowchart TD\n  Client --> API --> DB"}
          value={mermaidSource}
          onChange={(e) => setMermaidSource(e.target.value)}
        />
        <MermaidPreview source={mermaidSource} />
        <p className="error">{mermaidError}</p>
      </section>

      <RequirementsForm values={requirements} onChange={setRequirements} error={requirementsError} />

      <button type="submit" disabled={submitting}>
        {submitting ? "Reviewing..." : "Submit for review"}
      </button>

      {critique !== null && <CritiqueResult critique={critique} />}
    </form>
  );
}
