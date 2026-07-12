import OpenAI from "openai";
import { getCorpusEntries } from "../corpus/index";
import type { CorpusEntry } from "../corpus/loader";
import type { Requirements } from "../types";

const GROQ_MODEL = "llama-3.3-70b-versatile";

function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
}

function buildPrompt(
  mermaidSource: string,
  requirements: Requirements,
  corpus: CorpusEntry[]
): string {
  const requirementsBlock = `- DAU/QPS: ${requirements.dau}
- Read:write ratio: ${requirements.readWriteRatio}
- Consistency needs: ${requirements.consistencyNeeds}
- Latency SLA: ${requirements.latencySla}
- Growth targets: ${requirements.growthTargets}`;

  const referenceBlock =
    corpus.length > 0
      ? corpus.map((c) => `### Reference: ${c.title}\n${c.content}`).join("\n\n")
      : "(No reference material available.)";

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
Write a freeform critique in prose, mentor-style. Address the design specifically in light of the stated requirements above (do not give generic advice unrelated to them). Where reference material above is relevant, tie your critique's claims back to it explicitly (e.g. "as in the reference X design, ..."). If no reference material is relevant, say so briefly and rely on your own judgment. Cover: what's good, what's missing or wrong, and what would break first at the stated scale.`;
}

export interface CritiqueResult {
  critique: string;
}

export async function generateCritique(
  mermaidSource: string,
  requirements: Requirements
): Promise<CritiqueResult> {
  const corpus = getCorpusEntries();
  const prompt = buildPrompt(mermaidSource, requirements, corpus);
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const critique = response.choices[0]?.message?.content ?? "";

  return { critique };
}
