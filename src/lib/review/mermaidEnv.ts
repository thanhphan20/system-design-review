import { JSDOM } from "jsdom";

/**
 * mermaid's package touches `window`/`document`/`navigator`/`MutationObserver` even for
 * parse-only calls. In Next.js, API routes and SSR page rendering share the same Node
 * process, so a permanent global shim would leak a half-real DOM into unrelated page
 * renders (breaking Next's own browser-environment detection). Instead, install the shim
 * only for the duration of `fn`, then restore whatever was there before.
 */
export async function withMermaidDomShim<T>(fn: () => Promise<T>): Promise<T> {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");

  const previous = {
    window: (globalThis as Record<string, unknown>).window,
    document: (globalThis as Record<string, unknown>).document,
    navigator: (globalThis as Record<string, unknown>).navigator,
    MutationObserver: (globalThis as Record<string, unknown>).MutationObserver,
  };

  const target = globalThis as Record<string, unknown>;
  target.window = dom.window;
  target.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    configurable: true,
  });
  target.MutationObserver = dom.window.MutationObserver;

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete target[key];
      } else {
        Object.defineProperty(globalThis, key, {
          value,
          configurable: true,
          writable: true,
        });
      }
    }
    dom.window.close();
  }
}
