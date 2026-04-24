import {
  Contract,
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
  xdr,
  Transaction,
} from "@stellar/stellar-sdk";

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

export const CONTRACTS = {
  subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_CONTRACT_ID || "",
  revenueRouter: process.env.NEXT_PUBLIC_REVENUE_ROUTER_CONTRACT_ID || "",
  vaultToken: process.env.NEXT_PUBLIC_VAULT_TOKEN_CONTRACT_ID || "",
};

export interface TierConfig {
  id: number;
  name: string;
  price: bigint;
  duration_ledgers: number;
  active: boolean;
}

export interface SubscriptionRecord {
  subscriber: string;
  tier_id: number;
  start_ledger: number;
  expiry_ledger: number;
  active: boolean;
}

function assertContract(id: string, name: string) {
  if (!id || id.length < 10) throw new Error(`${name} contract not deployed yet.`);
}

async function buildAndAssemble(
  callerAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<Transaction> {
  const contract = new Contract(contractId);
  const account = await server.getAccount(callerAddress);
  const tx = new TransactionBuilder(account, {
    fee: String(Number(BASE_FEE) * 10),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
    const e = sim as SorobanRpc.Api.SimulateTransactionErrorResponse;
    throw new Error(`Simulation failed: ${e.error}`);
  }
  return SorobanRpc.assembleTransaction(tx, sim).build();
}

async function simulateOnly(
  callerAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<SorobanRpc.Api.SimulateTransactionSuccessResponse | null> {
  const contract = new Contract(contractId);
  const account = await server.getAccount(callerAddress);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationSuccess(sim)) return sim;
  return null;
}

async function pollTx(hash: string): Promise<{ hash: string; status: string }> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const s = await server.getTransaction(hash);
      if (s.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return { hash, status: "SUCCESS" };
      if (s.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        throw new Error(`Transaction failed. See: https://stellar.expert/explorer/testnet/tx/${hash}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Transaction failed")) throw e;
    }
  }
  return { hash, status: "PENDING" };
}

// Guard against concurrent sign attempts (prevents double-popup)
let _signingInProgress = false;

async function signAndSend(
  assembled: Transaction,
  signTx: (xdr: string) => Promise<string>
): Promise<{ hash: string; status: string }> {
  if (_signingInProgress) {
    throw new Error("A transaction is already awaiting signature. Please complete it first.");
  }
  _signingInProgress = true;
  try {
    const signedXdr = await signTx(assembled.toXDR());
    const signed = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const res = await server.sendTransaction(signed);
    if (res.status === "ERROR") throw new Error(`Send failed: ${JSON.stringify(res.errorResult)}`);
    return pollTx(res.hash);
  } finally {
    _signingInProgress = false;
  }
}

export async function createTier(
  callerAddress: string,
  name: string,
  priceXlm: number,
  durationDays: number,
  signTx: (xdr: string) => Promise<string>
) {
  assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
  const priceStroops = BigInt(Math.round(priceXlm * 10_000_000));
  const durationLedgers = durationDays * 17280;
  const assembled = await buildAndAssemble(callerAddress, CONTRACTS.subscriptionManager, "create_tier", [
    nativeToScVal(name, { type: "string" }),
    nativeToScVal(priceStroops, { type: "i128" }),
    nativeToScVal(durationLedgers, { type: "u32" }),
  ]);
  return signAndSend(assembled, signTx);
}

export async function subscribe(
  subscriberAddress: string,
  tierId: number,
  signTx: (xdr: string) => Promise<string>
) {
  assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
  const assembled = await buildAndAssemble(subscriberAddress, CONTRACTS.subscriptionManager, "subscribe", [
    Address.fromString(subscriberAddress).toScVal(),
    nativeToScVal(tierId, { type: "u32" }),
  ]);
  return signAndSend(assembled, signTx);
}

export async function getSubscription(
  callerAddress: string,
  subscriberAddress: string,
  tierId: number
): Promise<SubscriptionRecord | null> {
  try {
    assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
    const sim = await simulateOnly(callerAddress, CONTRACTS.subscriptionManager, "get_subscription", [
      Address.fromString(subscriberAddress).toScVal(),
      nativeToScVal(tierId, { type: "u32" }),
    ]);
    if (!sim?.result) return null;
    const n = scValToNative(sim.result.retval) as Record<string, unknown>;
    return {
      subscriber: String(n.subscriber),
      tier_id: Number(n.tier_id),
      start_ledger: Number(n.start_ledger),
      expiry_ledger: Number(n.expiry_ledger),
      active: Boolean(n.active),
    };
  } catch { return null; }
}

export async function renewSubscription(
  subscriberAddress: string,
  tierId: number,
  signTx: (xdr: string) => Promise<string>
) {
  assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
  const assembled = await buildAndAssemble(subscriberAddress, CONTRACTS.subscriptionManager, "renew", [
    Address.fromString(subscriberAddress).toScVal(),
    nativeToScVal(tierId, { type: "u32" }),
  ]);
  return signAndSend(assembled, signTx);
}

/** Returns estimated expiry as a Date, given a ledger number.
 *  Stellar Testnet closes ~1 ledger per 5.5 seconds. */
export function ledgerToEstimatedDate(expiryLedger: number, currentLedger: number): Date {
  const secondsUntilExpiry = (expiryLedger - currentLedger) * 5.5;
  return new Date(Date.now() + secondsUntilExpiry * 1000);
}

export async function getCurrentLedger(): Promise<number> {
  try {
    const resp = await fetch("https://horizon-testnet.stellar.org/ledgers?order=desc&limit=1");
    if (!resp.ok) return 0;
    const data = await resp.json();
    return data.records?.[0]?.sequence ?? 0;
  } catch { return 0; }
}

export async function getTierCount(callerAddress: string): Promise<number> {
  try {
    assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
    const sim = await simulateOnly(callerAddress, CONTRACTS.subscriptionManager, "get_tier_count", []);
    if (sim?.result) return Number(scValToNative(sim.result.retval));
    return 0;
  } catch { return 0; }
}

export async function getTier(callerAddress: string, tierId: number): Promise<TierConfig | null> {
  try {
    assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
    const sim = await simulateOnly(callerAddress, CONTRACTS.subscriptionManager, "get_tier", [
      nativeToScVal(tierId, { type: "u32" }),
    ]);
    if (!sim?.result) return null;
    const n = scValToNative(sim.result.retval) as Record<string, unknown>;
    return {
      id: tierId,
      name: n.name as string,
      price: BigInt(String(n.price)),
      duration_ledgers: Number(n.duration_ledgers),
      active: n.active as boolean,
    };
  } catch { return null; }
}

export async function getTotalSubscribers(callerAddress: string): Promise<number> {
  try {
    assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
    const sim = await simulateOnly(callerAddress, CONTRACTS.subscriptionManager, "get_total_subscribers", []);
    if (sim?.result) return Number(scValToNative(sim.result.retval));
    return 0;
  } catch { return 0; }
}

export async function isSubscriptionActive(
  callerAddress: string,
  subscriberAddress: string,
  tierId: number
): Promise<boolean> {
  try {
    assertContract(CONTRACTS.subscriptionManager, "SubscriptionManager");
    const sim = await simulateOnly(callerAddress, CONTRACTS.subscriptionManager, "is_active", [
      Address.fromString(subscriberAddress).toScVal(),
      nativeToScVal(tierId, { type: "u32" }),
    ]);
    if (sim?.result) return Boolean(scValToNative(sim.result.retval));
    return false;
  } catch { return false; }
}

export async function getVaultBalance(address: string): Promise<bigint> {
  try {
    assertContract(CONTRACTS.vaultToken, "VaultToken");
    const sim = await simulateOnly(address, CONTRACTS.vaultToken, "balance", [
      Address.fromString(address).toScVal(),
    ]);
    if (sim?.result) return BigInt(String(scValToNative(sim.result.retval)));
    return BigInt(0);
  } catch { return BigInt(0); }
}

export async function getXlmBalance(address: string): Promise<string> {
  try {
    const resp = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
    if (!resp.ok) return "0";
    const data = await resp.json();
    const native = data.balances?.find(
      (b: { asset_type: string; balance: string }) => b.asset_type === "native"
    );
    return native ? parseFloat(native.balance).toFixed(2) : "0";
  } catch { return "0"; }
}

export function stroopsToXlm(stroops: bigint): string {
  return (Number(stroops) / 10_000_000).toFixed(2);
}

export function ledgersToDays(ledgers: number): number {
  return Math.round(ledgers / 17280);
}
