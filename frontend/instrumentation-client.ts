import { trackEvent } from "@/lib/telemetry";

try {
  performance.mark("stellar-vault-init");

  window.addEventListener("error", (event) => {
    trackEvent("client_error", {
      message: event.message.slice(0, 300),
      source: event.filename ? new URL(event.filename, window.location.href).pathname : null,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason instanceof Error
      ? event.reason.message
      : String(event.reason || "Unhandled promise rejection");
    trackEvent("unhandled_rejection", { message: message.slice(0, 300) });
  });
} catch {
  // Monitoring must remain isolated from application startup.
}

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  trackEvent("navigation_started", { url, navigationType });
}
