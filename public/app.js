mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

const sourceEl = document.getElementById("mermaid-source");
const previewEl = document.getElementById("mermaid-preview");
const mermaidErrorEl = document.getElementById("mermaid-error");
const requirementsErrorEl = document.getElementById("requirements-error");
const form = document.getElementById("review-form");
const resultSection = document.getElementById("result");
const critiqueTextEl = document.getElementById("critique-text");

let previewCounter = 0;

async function renderPreview() {
  const source = sourceEl.value.trim();
  mermaidErrorEl.textContent = "";
  if (!source) {
    previewEl.innerHTML = "";
    return;
  }
  try {
    const id = `preview-${previewCounter++}`;
    const { svg } = await mermaid.render(id, source);
    previewEl.innerHTML = svg;
  } catch (err) {
    mermaidErrorEl.textContent = "Diagram preview error: " + (err?.message || err);
  }
}

let debounceTimer;
sourceEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(renderPreview, 400);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mermaidErrorEl.textContent = "";
  requirementsErrorEl.textContent = "";
  resultSection.hidden = true;

  const payload = {
    mermaidSource: sourceEl.value,
    requirements: {
      dau: document.getElementById("dau").value,
      readWriteRatio: document.getElementById("readWriteRatio").value,
      consistencyNeeds: document.getElementById("consistencyNeeds").value,
      latencySla: document.getElementById("latencySla").value,
      growthTargets: document.getElementById("growthTargets").value,
    },
  };

  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Reviewing...";

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.mermaidError) {
        mermaidErrorEl.textContent = data.mermaidError;
      }
      if (data.requirementsErrors) {
        requirementsErrorEl.textContent = data.requirementsErrors
          .map((e) => e.message)
          .join(", ");
      }
      if (data.error && !data.mermaidError && !data.requirementsErrors) {
        mermaidErrorEl.textContent = data.error;
      }
      return;
    }

    critiqueTextEl.textContent = data.critique;
    resultSection.hidden = false;
  } catch (err) {
    mermaidErrorEl.textContent = "Request failed: " + (err?.message || err);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit for review";
  }
});
