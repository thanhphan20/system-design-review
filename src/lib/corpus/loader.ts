import fs from "node:fs";
import path from "node:path";

export interface CorpusEntry {
  id: string;
  title: string;
  content: string;
}

const corpusDir = path.resolve(process.cwd(), "corpus");

export function loadCorpus(): CorpusEntry[] {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const filePath = path.join(corpusDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const titleMatch = raw.match(/^title:\s*(.+)$/m);

    return {
      id: path.basename(file, ".md"),
      title: titleMatch ? titleMatch[1].trim() : path.basename(file, ".md"),
      content: raw,
    };
  });
}
