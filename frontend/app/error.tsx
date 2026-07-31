"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/telemetry";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("route_error", {
      message: error.message.slice(0, 300),
      digest: error.digest || null,
    });
  }, [error]);

  return (
    <section className="min-h-[55vh] flex items-center justify-center text-center" role="alert">
      <div className="card max-w-lg p-8">
        <p className="tag w-fit mx-auto mb-4">Recovery Mode</p>
        <h1 className="text-2xl font-bold mb-3">This Page Couldn’t Load</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Check your connection, then retry. Your wallet and funds were not changed.
        </p>
        <button type="button" className="btn-primary" onClick={reset}>Retry Page</button>
      </div>
    </section>
  );
}
