"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/telemetry";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    trackEvent("web_vital", {
      id: metric.id,
      metric: metric.name,
      rating: metric.rating,
      value: Math.round(metric.value * 1000) / 1000,
    });
  });

  return null;
}
