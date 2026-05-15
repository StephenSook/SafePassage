import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

/**
 * Runtime config for SafePassage CLI.
 *
 * Default targets the Midnight testnet (testnet-02) for Phases 1-4 development.
 * At Phase 5 (mainnet deploy), override via environment variables:
 *
 *   PROOF_SERVER=http://localhost:6300 \
 *   INDEXER_URI=https://indexer.mainnet.midnight.network/api/v1/graphql \
 *   INDEXER_WS=wss://indexer.mainnet.midnight.network/api/v1/graphql/ws \
 *   npx tsx src/cli.ts deploy
 *
 * Verify the indexer URI against current Midnight docs - the hostname has
 * changed several times across testnet/preview/mainnet releases.
 */
export const CONFIG = {
  proofServer: process.env.PROOF_SERVER ?? 'http://localhost:6300',
  indexerUri: process.env.INDEXER_URI ?? 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWs: process.env.INDEXER_WS ?? 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  zkConfigPath: process.env.ZK_CONFIG_PATH ?? '../contract/src/managed/safepassage',
};

export const providers = (privateStateStoreName: string) => ({
  privateStateProvider: levelPrivateStateProvider({ privateStateStoreName }),
  proofProvider: httpClientProofProvider(CONFIG.proofServer),
  publicDataProvider: indexerPublicDataProvider(CONFIG.indexerUri, CONFIG.indexerWs),
  zkConfigProvider: new NodeZkConfigProvider(CONFIG.zkConfigPath),
});
