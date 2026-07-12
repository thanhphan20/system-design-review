import { loadCorpus, type CorpusEntry } from "./loader";

/**
 * The corpus is a handful of hand-curated pattern cards (see corpus/*.md), small
 * enough to include in full on every request rather than doing embedding-based
 * retrieval. This avoids an embeddings API dependency entirely.
 */
export function getCorpusEntries(): CorpusEntry[] {
  return loadCorpus();
}
