import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { SafePassage, adminWitnesses, emptyPrivateState } from '@safepassage/contract';
import { loadConfig, buildProviders, contractConfig } from '../commons.js';
import { buildWalletFromEnv, closeWallet } from '../wallet.js';

const DEPLOY_OUTPUT_PATH = resolve(process.cwd(), '../deployment/deploy-output.json');

export async function main(): Promise<void> {
  const config = loadConfig();
  console.log(`[deploy] network=${config.networkId} indexer=${config.indexer}`);

  const walletCtx = await buildWalletFromEnv(config);
  try {
    const providers = await buildProviders(config, walletCtx);

    const compiled = CompiledContract.make('SafePassage', SafePassage.Contract).pipe(
      CompiledContract.withWitnesses(adminWitnesses),
      CompiledContract.withCompiledFileAssets(contractConfig.zkConfigPath),
    );

    console.log('[deploy] submitting contract deployment...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await deployContract(providers as any, {
      compiledContract: compiled,
      privateStateId: contractConfig.privateStateStoreName,
      initialPrivateState: emptyPrivateState,
    });

    const contractAddress = result.deployTxData.public.contractAddress;
    const txId = result.deployTxData.public.txId;

    console.log(`[deploy] DEPLOYED at ${contractAddress}`);
    console.log(`[deploy] txId ${txId}`);
    console.log(`[deploy] network ${config.networkId}`);

    mkdirSync(dirname(DEPLOY_OUTPUT_PATH), { recursive: true });
    writeFileSync(
      DEPLOY_OUTPUT_PATH,
      JSON.stringify(
        {
          contractAddress,
          txId,
          deployedAt: new Date().toISOString(),
          network: config.networkId,
        },
        null,
        2,
      ),
    );
    console.log(`[deploy] wrote ${DEPLOY_OUTPUT_PATH}`);
  } finally {
    await closeWallet(walletCtx);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
