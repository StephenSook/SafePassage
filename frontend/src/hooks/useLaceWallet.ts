import { useCallback, useEffect, useState } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

/**
 * Lace wallet integration for SafePassage.
 *
 * Detects the Midnight DApp connector exposed by the Lace browser extension,
 * connects via the v4 API (`connect(networkId)`), and surfaces wallet state
 * to React components. The hook targets dapp-connector-api 4.0.x: the older
 * Cardano-style `isEnabled` / `enable` surface no longer exists.
 *
 * Phase 5 deploy wires the connected wallet into actual claim submission.
 */

export type LaceConnectionStatus =
  | { kind: 'detecting' }
  | { kind: 'not-installed' }
  | { kind: 'available'; name: string; apiVersion: string }
  | { kind: 'authorizing' }
  | { kind: 'connected'; address: string; coinPublicKey: string; api: ConnectedAPI }
  | { kind: 'error'; error: string };

const NETWORK_ID = (import.meta.env.VITE_MIDNIGHT_NETWORK_ID ?? 'preprod') as string;

function findLaceConnector(): InitialAPI | undefined {
  if (typeof window === 'undefined') return undefined;
  const root = window.midnight;
  if (!root) return undefined;
  // Lace registers under `mnLace` (per Midnight DApp Connector docs).
  // Fall back to scanning entries to support future rdns shifts.
  return root.mnLace ?? Object.values(root)[0];
}

export function useLaceWallet(): {
  status: LaceConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
} {
  const [status, setStatus] = useState<LaceConnectionStatus>({ kind: 'detecting' });

  useEffect(() => {
    let cancelled = false;

    const probe = (attempt: number) => {
      if (cancelled) return;
      const api = findLaceConnector();
      if (api) {
        setStatus({
          kind: 'available',
          name: api.name ?? 'Midnight Lace',
          apiVersion: api.apiVersion ?? 'unknown',
        });
        return;
      }
      if (attempt > 12) {
        setStatus({ kind: 'not-installed' });
        return;
      }
      setTimeout(() => probe(attempt + 1), 250);
    };

    probe(0);
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    const dapp = findLaceConnector();
    if (!dapp) {
      setStatus({ kind: 'not-installed' });
      return;
    }

    setStatus({ kind: 'authorizing' });
    try {
      const api = await dapp.connect(NETWORK_ID);
      const { shieldedAddress, shieldedCoinPublicKey } = await api.getShieldedAddresses();

      if (!shieldedAddress) {
        setStatus({
          kind: 'error',
          error: 'Lace returned no shielded address. Ensure the wallet is unlocked and on the correct network (Preprod).',
        });
        return;
      }

      setStatus({
        kind: 'connected',
        address: shieldedAddress,
        coinPublicKey: shieldedCoinPublicKey ?? '',
        api,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', error: message });
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus({ kind: 'detecting' });
    setTimeout(() => {
      const dapp = findLaceConnector();
      if (dapp) {
        setStatus({
          kind: 'available',
          name: dapp.name ?? 'Midnight Lace',
          apiVersion: dapp.apiVersion ?? 'unknown',
        });
      } else {
        setStatus({ kind: 'not-installed' });
      }
    }, 0);
  }, []);

  return { status, connect, disconnect };
}

export function shortAddress(addr: string, head = 8, tail = 6): string {
  if (!addr) return '';
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}
