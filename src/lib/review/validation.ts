import { withMermaidDomShim } from "./mermaidEnv";
import type { Requirements, ValidationError } from "../types";

const REQUIRED_FIELDS: (keyof Requirements)[] = [
  "dau",
  "readWriteRatio",
  "consistencyNeeds",
  "latencySla",
  "growthTargets",
];

export function validateRequirements(
  requirements: Partial<Requirements>
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const field of REQUIRED_FIELDS) {
    const value = requirements[field];
    if (!value || value.trim() === "") {
      errors.push({ field, message: `${field} is required` });
    }
  }
  return errors;
}

export interface MermaidValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateMermaidSource(
  source: string
): Promise<MermaidValidationResult> {
  if (!source || source.trim() === "") {
    return { valid: false, error: "Mermaid source is empty" };
  }

  return withMermaidDomShim(async () => {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({ startOnLoad: false });

    try {
      await mermaid.parse(source);
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : "Failed to parse mermaid diagram",
      };
    }
  });
}
