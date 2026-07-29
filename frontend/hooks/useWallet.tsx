"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { WatchWalletChanges } from "@stellar/freighter-api";
import { connectWallet, getWalletAddress, signTx, shortenAddress } from "@/lib/wallet";

interface WalletContextValue {
  address: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;
  signTx: typeof signTx;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connecting = useRef(false);
  const ignoreWatcher = useRef(false);

  const syncAddress = useCallback(async () => {
    const current = await getWalletAddress();
    if (!ignoreWatcher.current) setAddress(current);
  }, []);

  useEffect(() => {
    let mounted = true;
    void syncAddress();
    const watcher = new WatchWalletChanges(2500);
    watcher.watch(({ address: nextAddress }) => {
      if (mounted && !ignoreWatcher.current) setAddress(nextAddress || null);
    });
    return () => {
      mounted = false;
      watcher.stop();
    };
  }, [syncAddress]);

  const connect = useCallback(async () => {
    if (connecting.current) return;
    connecting.current = true;
    ignoreWatcher.current = false;
    setLoading(true);
    setError(null);
    try {
      setAddress(await connectWallet());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Freighter could not connect.");
    } finally {
      connecting.current = false;
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Freighter does not expose a programmatic disconnect. Hide the local
    // session until the user explicitly reconnects instead.
    ignoreWatcher.current = true;
    setAddress(null);
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(() => ({
    address,
    shortAddress: address ? shortenAddress(address) : null,
    isConnected: Boolean(address),
    loading,
    error,
    connect,
    disconnect,
    retry: connect,
    signTx,
  }), [address, loading, error, connect, disconnect]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
