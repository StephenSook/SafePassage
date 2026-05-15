import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract';
import { providers } from '../commons.js';
import { saveDeployment } from '../helpers.js';

export async function main(): Promise<void> {
  const result = await deployContract(providers('safepassage-admin'), {
    contract: new Contract(adminWitnesses),
    privateStateId: 'safepassage-admin',
    initialPrivateState: {},
  });
  const contractAddress = result.deployTxData.public.contractAddress;
  const txId = result.deployTxData.public.txId;
  console.log(`Deployed: ${contractAddress}`);
  console.log(`Tx: ${txId}`);
  saveDeployment({
    contractAddress,
    txId,
    deployedAt: new Date().toISOString(),
    network: process.env.INDEXER_URI?.includes('mainnet') ? 'mainnet' : 'testnet',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
