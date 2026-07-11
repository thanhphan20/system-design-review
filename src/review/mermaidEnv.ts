import { JSDOM } from "jsdom";

let initialized = false;

/**
 * mermaid's package touches `window`/`document`/`navigator` even for parse-only
 * calls, so a minimal jsdom shim is installed once before mermaid is imported.
 */
export function ensureMermaidDomShim(): void {
  if (initialized) return;

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    configurable: true,
  });

  initialized = true;
}
