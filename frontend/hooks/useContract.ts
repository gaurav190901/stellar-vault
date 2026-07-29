"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getTierCount,
  getTier,
  getTotalSubscribers,
  getVaultBalance,
  getXlmBalance,
  getSplits,
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

type DashboardSnapshot = {
  stats: DashboardStats;
  tiers: TierConfig[];
  splits: { address: string; basisPoints: number }[];
};

const SNAPSHOT_TTL_MS = 15_000;
const snapshotCache = new Map<string, { snapshot: DashboardSnapshot; fetchedAt: number }>();
const inFlight = new Map<string, Promise<void>>();

export function useDashboard(address: string | null) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    tierCount: 0,
    vaultBalance: "0",
    xlmBalance: "0",
    monthlyRevenue: "0",
  });
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [splits, setSplits] = useState<{ address: string; basisPoints: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: DashboardSnapshot) => {
    setTiers(snapshot.tiers);
    setSplits(snapshot.splits);
    setStats(snapshot.stats);
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!address) return;
    const cached = snapshotCache.get(address);
    if (!force && cached && Date.now() - cached.fetchedAt < SNAPSHOT_TTL_MS) {
      applySnapshot(cached.snapshot);
      return;
    }

    const existingRequest = inFlight.get(address);
    if (existingRequest) return existingRequest;

    const request = (async () => {
      setLoading(true);
      setError(null);
      try {
        const [count, totalSubs, vaultBal, xlmBal, fetchedSplits] = await Promise.all([
          getTierCount(address),
          getTotalSubscribers(address),
          getVaultBalance(address),
          getXlmBalance(address),
          getSplits(address),
        ]);

        const tierResults = await Promise.all(
          Array.from({ length: count }, (_, i) => getTier(address, i))
        );
        const tierList: TierConfig[] = tierResults.filter((t): t is TierConfig => t !== null);
        const monthlyRev = tierList
          .filter((t) => t.active)
          .reduce((acc, t) => acc + parseFloat(stroopsToXlm(t.price)), 0)
          .toFixed(2);
        const snapshot: DashboardSnapshot = {
          tiers: tierList,
          splits: fetchedSplits,
          stats: {
            totalSubscribers: totalSubs,
            tierCount: count,
            vaultBalance: stroopsToXlm(vaultBal),
            xlmBalance: xlmBal,
            monthlyRevenue: monthlyRev,
          },
        };
        snapshotCache.set(address, { snapshot, fetchedAt: Date.now() });
        applySnapshot(snapshot);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();

    inFlight.set(address, request);
    try {
      await request;
    } finally {
      inFlight.delete(address);
    }
  }, [address, applySnapshot]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, tiers, splits, loading, error, refresh };
}
