import { VoyageAIClient } from "voyageai";
import { loadCorpus, type CorpusEntry } from "./loader.js";

interface IndexedEntry extends CorpusEntry {
  embedding: number[];
}

let index: IndexedEntry[] | null = null;

function getClient(): VoyageAIClient {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }
  return new VoyageAIClient({ apiKey });
}

/** Embeds the full corpus once and holds it in memory. Call at startup. */
export async function buildCorpusIndex(): Promise<void> {
  const entries = loadCorpus();
  const client = getClient();

  const response = await client.embed({
    input: entries.map((e) => e.content),
    model: "voyage-3",
    inputType: "document",
  });

  const embeddings = response.data ?? [];
  index = entries.map((entry, i) => ({
    ...entry,
    embedding: embeddings[i]?.embedding ?? [],
  }));
}

export function isCorpusIndexed(): boolean {
  return index !== null;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface RetrievedEntry extends CorpusEntry {
  score: number;
}

const RELEVANCE_THRESHOLD = 0.3;

/** Retrieves the top-k most relevant corpus entries for a query, above a minimum relevance threshold. */
export async function retrieveRelevant(
  query: string,
  topK = 3
): Promise<RetrievedEntry[]> {
  if (!index) {
    throw new Error("Corpus index not built yet — call buildCorpusIndex() first");
  }

  const client = getClient();
  const response = await client.embed({
    input: [query],
    model: "voyage-3",
    inputType: "query",
  });
  const queryEmbedding = response.data?.[0]?.embedding ?? [];

  const scored = index
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }))
    .filter((e) => e.score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
