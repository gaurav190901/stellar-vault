import {
  isConnected,
  getAddress,
  signTransaction,
  isAllowed,
  requestAccess,
  getNetworkDetails,
} from "@stellar/freighter-api";

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

function describeWalletError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message || "Freighter returned an error.");
  }
  return String(error || "Freighter returned an error.");
}

async function waitForFreighter(attempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await isConnected();
    if (result.isConnected) return true;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return false;
}

export async function connectWallet(): Promise<string> {
  if (!(await waitForFreighter())) {
    throw new Error("Freighter was not detected. Install or unlock the extension, then try again.");
  }

  // requestAccess is the reliable user-initiated path. It handles both first
  // connection and an extension that has been locked or reset since page load.
  const access = await requestAccess();
  if (access.error) {
    throw new Error(describeWalletError(access.error));
  }
  const address = access.address || (await getAddress()).address;
  if (!address) {
    throw new Error("Freighter did not return an address. Unlock the wallet and try again.");
  }

  const network = await getNetworkDetails();
  if (network.networkPassphrase && network.networkPassphrase !== TESTNET_PASSPHRASE) {
    throw new Error("Switch Freighter to Stellar Testnet, then connect again.");
  }

  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    if (!(await waitForFreighter(1))) return null;
    const allowed = await isAllowed();
    if (!allowed.isAllowed) return null;
    const { address, error } = await getAddress();
    if (error) return null;
    return address || null;
  } catch {
    return null;
  }
}

export async function signTx(xdr: string): Promise<string> {
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";
  const networkPassphrase =
    network === "testnet"
      ? "Test SDF Network ; September 2015"
      : "Public Global Stellar Network ; September 2015";
  const result = await signTransaction(xdr, {
    networkPassphrase,
  });
  if (result.error) throw new Error(describeWalletError(result.error));
  if (!result.signedTxXdr) throw new Error("Freighter did not return a signed transaction.");
  return result.signedTxXdr;
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
