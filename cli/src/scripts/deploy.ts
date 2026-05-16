import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract';
import { loadConfig, buildProviders, contractConfig } from '../commons.js';

const DEPLOY_OUTPUT_PATH = resolve(process.cwd(), '../deployment/deploy-output.json');

export async function main(): Promise<void> {
  const config = loadConfig();
  const accountId = process.env.SAFEPASSAGE_ACCOUNT_ID ?? 'safepassage-admin-dev';
  const providers = buildProviders(config, accountId);

  const result = await deployContract(providers, {
    contract: new Contract(adminWitnesses),
    privateStateId: contractConfig.privateStateStoreName,
    initialPrivateState: {},
  });

  const contractAddress = result.deployTxData.public.contractAddress;
  const txId = result.deployTxData.public.txId;

  console.log(`Deployed: ${contractAddress}`);
  console.log(`Tx: ${txId}`);
  console.log(`Network: ${config.networkId}`);

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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
