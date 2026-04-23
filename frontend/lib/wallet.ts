import {
  isConnected,
  getAddress,
  signTransaction,
  isAllowed,
  setAllowed,
} from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected.isConnected) {
    throw new Error("Freighter not installed. Please install the Freighter browser extension.");
  }
  const allowed = await isAllowed();
  if (!allowed.isAllowed) {
    await setAllowed();
  }
  const { address } = await getAddress();
  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected.isConnected) return null;
    const allowed = await isAllowed();
    if (!allowed.isAllowed) return null;
    const { address } = await getAddress();
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
  if (result.error) throw new Error(result.error);
  return result.signedTxXdr;
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
