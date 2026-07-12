"use client";

import type { Requirements } from "@/lib/types";

const FIELDS: { key: keyof Requirements; label: string; placeholder: string }[] = [
  { key: "dau", label: "Expected DAU / QPS", placeholder: "e.g. 5M DAU, ~2k req/s peak" },
  { key: "readWriteRatio", label: "Read:write ratio", placeholder: "e.g. 100:1" },
  {
    key: "consistencyNeeds",
    label: "Consistency needs",
    placeholder: "e.g. eventual OK for reads, strong for writes",
  },
  { key: "latencySla", label: "Latency SLA", placeholder: "e.g. p99 < 200ms" },
  { key: "growthTargets", label: "Growth targets", placeholder: "e.g. 10x in 2 years" },
];

export default function RequirementsForm({
  values,
  onChange,
  error,
}: {
  values: Requirements;
  onChange: (values: Requirements) => void;
  error: string;
}) {
  return (
    <section>
      <h2>Requirements</h2>
      {FIELDS.map(({ key, label, placeholder }) => (
        <label key={key}>
          {label}
          <input
            type="text"
            value={values[key]}
            placeholder={placeholder}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
          />
        </label>
      ))}
      <p className="error">{error}</p>
    </section>
  );
}
