"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import type { RegistryStatus } from "@/types";

/**
 * Manufacturer Registry Membership state for the signed-in manufacturer.
 * `registry` is null when there's no company yet.
 */
interface MembershipState {
  loaded: boolean;
  registry: RegistryStatus | null;
  /** Never activated (no company, or never paid) → must finish onboarding. */
  needsOnboarding: boolean;
  /** Was a member, membership lapsed → product editing is blocked. */
  lapsed: boolean;
  refresh: () => Promise<void>;
}

const MembershipContext = createContext<MembershipState | null>(null);

export function MembershipProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [registry, setRegistry] = useState<RegistryStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: RegistryStatus }>("/billing/registry");
      setRegistry(res.data);
    } catch {
      setRegistry(null); // no company yet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  const lapsed = !!registry && !registry.active && !!registry.last_active;
  const value: MembershipState = {
    loaded: enabled ? loaded : true,
    registry,
    needsOnboarding: enabled && loaded && !registry?.active && !lapsed,
    lapsed: enabled && lapsed,
    refresh,
  };

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership(): MembershipState {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}
