const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC || "https://soroban-testnet.stellar.org";

const contracts = {
  subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_CONTRACT_ID || "",
  revenueRouter: process.env.NEXT_PUBLIC_REVENUE_ROUTER_CONTRACT_ID || "",
  vaultToken: process.env.NEXT_PUBLIC_VAULT_TOKEN_CONTRACT_ID || "",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    const rpc = await response.json();
    const configured = Object.values(contracts).every((id) => /^C[A-Z2-7]{55}$/.test(id));
    const healthy = response.ok && rpc?.result?.status === "healthy" && configured;

    return Response.json({
      status: healthy ? "ok" : "degraded",
      network: "Stellar Testnet",
      rpc: rpc?.result?.status || "unavailable",
      contractsConfigured: configured,
      contracts,
      checkedAt: new Date().toISOString(),
    }, {
      status: healthy ? 200 : 503,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json({
      status: "degraded",
      network: "Stellar Testnet",
      rpc: "unavailable",
      contractsConfigured: Object.values(contracts).every((id) => /^C[A-Z2-7]{55}$/.test(id)),
      contracts,
      checkedAt: new Date().toISOString(),
    }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  } finally {
    clearTimeout(timeout);
  }
}
