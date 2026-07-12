import { NextResponse } from "next/server";
import { generateCritique } from "@/lib/review/critique";
import { validateMermaidSource, validateRequirements } from "@/lib/review/validation";
import { createSession } from "@/lib/db/sessions";
import type { Requirements } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { mermaidSource, requirements } = body as {
    mermaidSource?: string;
    requirements?: Partial<Requirements>;
  };

  const requirementsErrors = validateRequirements(requirements ?? {});
  const mermaidResult = await validateMermaidSource(mermaidSource ?? "");

  if (!mermaidResult.valid || requirementsErrors.length > 0) {
    return NextResponse.json(
      {
        mermaidError: mermaidResult.valid ? undefined : mermaidResult.error,
        requirementsErrors: requirementsErrors.length > 0 ? requirementsErrors : undefined,
      },
      { status: 400 }
    );
  }

  try {
    const { critique } = await generateCritique(mermaidSource!, requirements as Requirements);
    const session = await createSession(mermaidSource!, requirements as Requirements, critique);
    return NextResponse.json({ critique, sessionId: session.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate critique" },
      { status: 500 }
    );
  }
}
