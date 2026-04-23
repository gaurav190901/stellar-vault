"use client";
import { useState, useEffect, useCallback } from "react";
import { connectWallet, getWalletAddress, signTx, shortenAddress } from "@/lib/wallet";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWalletAddress().then((addr) => {
      if (addr) setAddress(addr);
    });
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  return {
    address,
    shortAddress: address ? shortenAddress(address) : null,
    isConnected: !!address,
    loading,
    error,
    connect,
    disconnect,
    signTx,
  };
}
