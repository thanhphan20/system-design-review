"use client";

import { useEffect, useRef, useState } from "react";

let previewCounter = 0;

export default function MermaidPreview({ source }: { source: string }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const trimmed = source.trim();
      setError("");
      if (!trimmed) {
        setSvg("");
        return;
      }
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
        const id = `preview-${previewCounter++}`;
        const { svg } = await mermaid.render(id, trimmed);
        setSvg(svg);
      } catch (err) {
        setError("Diagram preview error: " + (err instanceof Error ? err.message : String(err)));
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [source]);

  return (
    <>
      <div id="mermaid-preview" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="error">{error}</p>
    </>
  );
}
