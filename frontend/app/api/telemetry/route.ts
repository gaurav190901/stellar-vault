type TelemetryPayload = {
  name?: unknown;
  properties?: unknown;
  path?: unknown;
  timestamp?: unknown;
};

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 16_384) {
    return Response.json({ accepted: false, error: "Payload too large." }, { status: 413 });
  }

  try {
    const payload = await request.json() as TelemetryPayload;
    if (typeof payload.name !== "string" || payload.name.length > 80) {
      return Response.json({ accepted: false, error: "Invalid event name." }, { status: 400 });
    }

    const event = {
      name: payload.name,
      path: typeof payload.path === "string" ? payload.path.slice(0, 200) : "/",
      timestamp: typeof payload.timestamp === "string"
        ? payload.timestamp
        : new Date().toISOString(),
      properties: typeof payload.properties === "object" && payload.properties !== null
        ? payload.properties
        : {},
    };

    console.info("[stellar-vault:telemetry]", JSON.stringify(event));
    return Response.json(
      { accepted: true },
      { status: 202, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ accepted: false, error: "Invalid JSON payload." }, { status: 400 });
  }
}
