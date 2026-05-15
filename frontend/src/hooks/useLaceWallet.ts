import { useCallback, useEffect, useState } from 'react';
import type { DAppConnectorAPI, DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

/**
 * Lace wallet integration for SafePassage.
 *
 * Detects the Midnight DApp connector exposed by the Lace browser extension,
 * requests user authorization, and surfaces wallet state to React components.
 *
 * Phase 5 deploy wires the connected wallet into actual claim submission. For
 * now, the LiveDemo can render real "connected as <address>" status while
 * still simulating the submission flow until the contract is deployed.
 */

export type LaceConnectionStatus =
  | { kind: 'detecting' }
  | { kind: 'not-installed' }
  | { kind: 'available'; name: string; apiVersion: string }
  | { kind: 'authorizing' }
  | { kind: 'connected'; address: string; coinPublicKey: string; api: DAppConnectorWalletAPI }
  | { kind: 'error'; error: string };

declare global {
  interface Window {
    midnight?: {
      mnLace?: DAppConnectorAPI;
    };
  }
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
      const api = typeof window !== 'undefined' ? window.midnight?.mnLace : undefined;
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
    const dapp = window.midnight?.mnLace;
    if (!dapp) {
      setStatus({ kind: 'not-installed' });
      return;
    }

    setStatus({ kind: 'authorizing' });
    try {
      const enabled = await dapp.isEnabled();
      const api: DAppConnectorWalletAPI = enabled ? await dapp.enable() : await dapp.enable();
      const stateApi = await api.state();
      const state = await stateApi;

      // The shape of `state` depends on the connector version; both 4.0.x
      // builds we test against expose `address` + `coinPublicKey`.
      const address: string =
        (state as { address?: string }).address ??
        (state as { walletAddress?: string }).walletAddress ??
        '';
      const coinPublicKey: string =
        (state as { coinPublicKey?: string }).coinPublicKey ??
        (state as { coinPublicKeyLegacy?: string }).coinPublicKeyLegacy ??
        '';

      if (!address) {
        setStatus({
          kind: 'error',
          error: 'Lace returned no wallet address. Ensure the wallet is unlocked and on the correct network (Preprod).',
        });
        return;
      }

      setStatus({ kind: 'connected', address, coinPublicKey, api });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', error: message });
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus({ kind: 'detecting' });
    setTimeout(() => {
      const dapp = window.midnight?.mnLace;
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
