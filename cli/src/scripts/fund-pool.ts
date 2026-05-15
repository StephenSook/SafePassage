import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract';
import { providers } from '../commons.js';
import { loadDeployment } from '../helpers.js';

export async function main(): Promise<void> {
  const amount = BigInt(process.argv[2] ?? '0');
  if (amount <= 0n) {
    console.error('Usage: fund-pool <amount>');
    process.exit(1);
  }

  const { contractAddress } = loadDeployment();
  const deployed = await findDeployedContract(providers('safepassage-admin'), {
    contractAddress,
    contract: new Contract(adminWitnesses),
    privateStateId: 'safepassage-admin',
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
