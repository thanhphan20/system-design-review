const listEl = document.getElementById("session-list");
const emptyMessageEl = document.getElementById("empty-message");
const detailSection = document.getElementById("detail");
const detailMermaidEl = document.getElementById("detail-mermaid");
const detailRequirementsEl = document.getElementById("detail-requirements");
const detailCritiqueEl = document.getElementById("detail-critique");

async function loadSessions() {
  const res = await fetch("/api/sessions");
  const sessions = await res.json();

  if (sessions.length === 0) {
    emptyMessageEl.hidden = false;
    return;
  }

  for (const session of sessions) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = new Date(session.createdAt).toLocaleString();
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadDetail(session.id);
    });
    li.appendChild(link);
    listEl.appendChild(li);
  }
}

async function loadDetail(id) {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) return;
  const session = await res.json();

  detailMermaidEl.textContent = session.mermaidSource;
  detailRequirementsEl.textContent = JSON.stringify(session.requirements, null, 2);
  detailCritiqueEl.textContent = session.critiqueText;
  detailSection.hidden = false;
}

loadSessions();
