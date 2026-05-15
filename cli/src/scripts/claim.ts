import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { claimWitnesses } from '@safepassage/contract';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { providers } from '../commons.js';
import { loadDeployment, parseCategory } from '../helpers.js';

const REGISTRY_PATH = resolve(process.cwd(), '../demo/registered-codes.json');

interface CodeEntry {
  rawCode: string;
  category: string;
  cap: string;
  digestHex: string;
  saltHex: string;
  commitmentHex: string;
  registeredAt: string;
}

export async function main(): Promise<void> {
  const rawCode = process.argv[2];
  const categoryStr = process.argv[3];
  const amount = process.argv[4];
  if (!rawCode || !categoryStr || !amount) {
    console.error('Usage: claim <code> <category> <amount>');
    process.exit(1);
  }

  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`No registered codes found. Run register-code first.`);
  }
  const registry: CodeEntry[] = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const entry = registry.find((e) => e.rawCode === rawCode);
  if (!entry) {
    throw new Error(`Code "${rawCode}" not in registry. Did you register it?`);
  }

  const digest = Buffer.from(entry.digestHex, 'hex');
  const salt = Buffer.from(entry.saltHex, 'hex');
  const category = parseCategory(categoryStr);

  const { contractAddress } = loadDeployment();
  const deployed = await findDeployedContract(providers('safepassage-claimant'), {
    contractAddress,
    contract: new Contract(claimWitnesses(digest, salt)),
    privateStateId: 'safepassage-claimant',
    initialPrivateState: {},
  });

  try {
    const tx = await deployed.callTx.claimSafePassage(category, BigInt(amount));
    console.log(`claim submitted. Tx: ${tx.public.txId}`);
    console.log(`  Category: ${categoryStr}`);
    console.log(`  Amount: ${amount}`);
    console.log(`  Pool balance ticks down. Nullifier consumed. No identity recorded.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('nullifier already used')) {
      console.error('REPLAY REJECTED: nullifier already used (this is the demo killshot).');
      process.exit(2);
    }
    throw err;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
