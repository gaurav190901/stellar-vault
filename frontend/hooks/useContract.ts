"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getTierCount,
  getTier,
  getTotalSubscribers,
  getVaultBalance,
  getXlmBalance,
  TierConfig,
  stroopsToXlm,
} from "@/lib/contracts";

export interface DashboardStats {
  totalSubscribers: number;
  tierCount: number;
  vaultBalance: string;
  xlmBalance: string;
  monthlyRevenue: string;
}

export function useDashboard(address: string | null) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    tierCount: 0,
    vaultBalance: "0",
    xlmBalance: "0",
    monthlyRevenue: "0",
  });
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [count, totalSubs, vaultBal, xlmBal] = await Promise.all([
        getTierCount(address),
        getTotalSubscribers(address),
        getVaultBalance(address),
        getXlmBalance(address),
      ]);

      // Fetch all tiers in parallel instead of sequentially
      const tierResults = await Promise.all(
        Array.from({ length: count }, (_, i) => getTier(address, i))
      );
      const tierList: TierConfig[] = tierResults.filter((t): t is TierConfig => t !== null);

      const monthlyRev = tierList
        .filter((t) => t.active)
        .reduce((acc, t) => acc + parseFloat(stroopsToXlm(t.price)), 0)
        .toFixed(2);

      setTiers(tierList);
      setStats({
        totalSubscribers: totalSubs,
        tierCount: count,
        vaultBalance: stroopsToXlm(vaultBal),
        xlmBalance: xlmBal,
        monthlyRevenue: monthlyRev,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, tiers, loading, error, refresh };
}
