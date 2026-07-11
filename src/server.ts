import express from "express";
import path from "node:path";
import "./db/index.js";
import { buildCorpusIndex } from "./corpus/index.js";
import { generateCritique } from "./review/critique.js";
import { validateMermaidSource, validateRequirements } from "./review/validation.js";
import { createSession, getSession, listSessions } from "./db/sessions.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "public")));

app.post("/api/reviews", async (req, res) => {
  const { mermaidSource, requirements } = req.body ?? {};

  const requirementsErrors = validateRequirements(requirements ?? {});
  const mermaidResult = await validateMermaidSource(mermaidSource ?? "");

  if (!mermaidResult.valid || requirementsErrors.length > 0) {
    res.status(400).json({
      mermaidError: mermaidResult.valid ? undefined : mermaidResult.error,
      requirementsErrors: requirementsErrors.length > 0 ? requirementsErrors : undefined,
    });
    return;
  }

  try {
    const { critique } = await generateCritique(mermaidSource, requirements);
    const session = createSession(mermaidSource, requirements, critique);
    res.json({ critique, sessionId: session.id });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to generate critique",
    });
  }
});

app.get("/api/sessions", (_req, res) => {
  res.json(listSessions());
});

app.get("/api/sessions/:id", (req, res) => {
  const id = Number(req.params.id);
  const session = getSession(id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
});

async function start() {
  try {
    await buildCorpusIndex();
  } catch (err) {
    console.warn(
      "Corpus index not built (reviews will fail until this is fixed):",
      err instanceof Error ? err.message : err
    );
  }
  app.listen(PORT, () => {
    console.log(`system-design-review listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
