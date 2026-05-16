import path from 'node:path';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

/**
 * Runtime config for SafePassage CLI.
 *
 * Mirrors the example-zkloan Standalone + Preprod pattern. Default target is
 * Preprod (prize-eligible per Midnight Foundation Discord ruling 2026-05-15).
 * Mainnet is a stretch deploy; switch with NETWORK=mainnet.
 *
 *   PROOF_SERVER=http://localhost:6300 \
 *   NETWORK=preprod \
 *   npx tsx src/cli.ts deploy
 */

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export const contractConfig = {
  privateStateStoreName: 'safepassage-private-state',
  zkConfigPath: path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'safepassage'),
};

export interface NetworkConfig {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
  readonly networkId: 'undeployed' | 'preprod' | 'testnet' | 'mainnet';
}

export class StandaloneConfig implements NetworkConfig {
  indexer = 'http://127.0.0.1:8088/api/v4/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v4/graphql/ws';
  // ^ Standalone (local) - matches Build on Midnight slide 17: `localhost:8088/api/v4/graphql`
  node = 'http://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  networkId = 'undeployed' as const;
  constructor() {
    setNetworkId('undeployed');
  }
}

export class PreprodConfig implements NetworkConfig {
  indexer = 'https://indexer.preprod.midnight.network/api/v4/graphql';
  indexerWS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';
  node = 'wss://rpc.preprod.midnight.network';
  proofServer = process.env.PROOF_SERVER ?? 'http://localhost:6300';
  networkId = 'preprod' as const;
  constructor() {
    setNetworkId('preprod');
  }
}

export class MainnetConfig implements NetworkConfig {
  indexer = 'https://indexer.midnight.network/api/v4/graphql';
  indexerWS = 'wss://indexer.midnight.network/api/v4/graphql/ws';
  node = 'wss://rpc.midnight.network';
  proofServer = process.env.PROOF_SERVER ?? 'http://localhost:6300';
  networkId = 'mainnet' as const;
  constructor() {
    setNetworkId('mainnet');
  }
}

export function loadConfig(): NetworkConfig {
  const network = (process.env.NETWORK ?? 'preprod').toLowerCase();
  switch (network) {
    case 'standalone':
    case 'undeployed':
      return new StandaloneConfig();
    case 'mainnet':
      return new MainnetConfig();
    case 'preprod':
    case 'testnet':
    default:
      return new PreprodConfig();
  }
}

/**
 * Builds the provider bundle for either admin or claimant flow.
 *
 * `accountId` is the bech32 wallet address derived from the demo wallet seed.
 * For Phase 1 development we accept the address as a parameter; full wallet
 * wiring (HDWallet + WalletFacade + ShieldedWallet + DustWallet +
 * UnshieldedWallet) lives in src/wallet.ts and is consumed by the deploy /
 * fund-pool / register-code / claim / query-ledger scripts.
 *
 * The `privateStoragePasswordProvider` MUST return a string. For development
 * we read from MIDNIGHT_STORAGE_PASSWORD env. Never check in a real password.
 */
export function buildProviders(config: NetworkConfig, accountId: string) {
  const storagePassword = process.env.MIDNIGHT_STORAGE_PASSWORD;
  if (!storagePassword) {
    throw new Error(
      'MIDNIGHT_STORAGE_PASSWORD is not set. Set it in cli/.env (see .env.example). ' +
        'The level-private-state-provider requires it to encrypt private state on disk.',
    );
  }

  const zkConfigProvider = new NodeZkConfigProvider(contractConfig.zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: contractConfig.privateStateStoreName,
      privateStoragePasswordProvider: () => storagePassword,
      accountId,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
  };
}
