import Anthropic from "@anthropic-ai/sdk";
import { retrieveRelevant, type RetrievedEntry } from "../corpus/index";
import type { Requirements } from "../types";

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

function buildQuery(mermaidSource: string, requirements: Requirements): string {
  return [
    mermaidSource,
    `DAU/QPS: ${requirements.dau}`,
    `Read:write ratio: ${requirements.readWriteRatio}`,
    `Consistency needs: ${requirements.consistencyNeeds}`,
    `Latency SLA: ${requirements.latencySla}`,
    `Growth targets: ${requirements.growthTargets}`,
  ].join("\n");
}

function buildPrompt(
  mermaidSource: string,
  requirements: Requirements,
  retrieved: RetrievedEntry[]
): string {
  const requirementsBlock = `- DAU/QPS: ${requirements.dau}
- Read:write ratio: ${requirements.readWriteRatio}
- Consistency needs: ${requirements.consistencyNeeds}
- Latency SLA: ${requirements.latencySla}
- Growth targets: ${requirements.growthTargets}`;

  const referenceBlock =
    retrieved.length > 0
      ? retrieved
          .map((r) => `### Reference: ${r.title}\n${r.content}`)
          .join("\n\n")
      : "(No sufficiently relevant reference material was found for this design — proceed without corpus grounding.)";

  return `You are a senior engineer mentoring someone practicing for system design interviews. Review the following system design against the stated requirements.

## Submitted design (mermaid)
\`\`\`mermaid
${mermaidSource}
\`\`\`

## Stated requirements
${requirementsBlock}

## Reference material
${referenceBlock}

## Instructions
Write a freeform critique in prose, mentor-style. Address the design specifically in light of the stated requirements above (do not give generic advice unrelated to them). Where reference material above is relevant, tie your critique's claims back to it explicitly (e.g. "as in the reference X design, ..."). If no reference material was relevant, say so briefly and rely on your own judgment. Cover: what's good, what's missing or wrong, and what would break first at the stated scale.`;
}

export interface CritiqueResult {
  critique: string;
  retrieved: RetrievedEntry[];
}

export async function generateCritique(
  mermaidSource: string,
  requirements: Requirements
): Promise<CritiqueResult> {
  const query = buildQuery(mermaidSource, requirements);
  const retrieved = await retrieveRelevant(query, 3);

  const prompt = buildPrompt(mermaidSource, requirements, retrieved);
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const critique = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return { critique, retrieved };
}
