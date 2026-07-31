export type TelemetryProperties = Record<string, string | number | boolean | null>;

export function trackEvent(name: string, properties: TelemetryProperties = {}) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    name,
    properties,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/telemetry",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/telemetry", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Telemetry must never interrupt the product experience.
  }
}
