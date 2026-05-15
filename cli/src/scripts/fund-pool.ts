// @ts-nocheck - depends on contract artifacts (npm run compact in contract/).
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract';
import { loadConfig, buildProviders, contractConfig } from '../commons.js';
import { loadDeployment } from '../helpers.js';

export async function main(): Promise<void> {
  const amount = BigInt(process.argv[2] ?? '0');
  if (amount <= 0n) {
    console.error('Usage: fund-pool <amount>');
    process.exit(1);
  }

  const config = loadConfig();
  const accountId = process.env.SAFEPASSAGE_ACCOUNT_ID ?? 'safepassage-admin-dev';
  const providers = buildProviders(config, accountId);
  const { contractAddress } = loadDeployment();

  const deployed = await findDeployedContract(providers, {
    contractAddress,
    contract: new Contract(adminWitnesses),
    privateStateId: contractConfig.privateStateStoreName,
    initialPrivateState: {},
  });

  const tx = await deployed.callTx.fundPool(amount);
  console.log(`fundPool(${amount}) submitted. Tx: ${tx.public.txId}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
