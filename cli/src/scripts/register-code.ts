import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses, hashCode, newIssuerSalt } from '@safepassage/contract';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
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
  const cap = process.argv[4];
  if (!rawCode || !categoryStr || !cap) {
    console.error('Usage: register-code <code> <category> <cap>');
    process.exit(1);
  }

  const category = parseCategory(categoryStr);
  const { digest, commitment } = hashCode(rawCode);
  const salt = newIssuerSalt();

  const { contractAddress } = loadDeployment();
  const deployed = await findDeployedContract(providers('safepassage-admin'), {
    contractAddress,
    contract: new Contract(adminWitnesses),
    privateStateId: 'safepassage-admin',
    initialPrivateState: {},
  });

  const tx = await deployed.callTx.registerCode(commitment, category, BigInt(cap));
  console.log(`registerCode submitted. Tx: ${tx.public.txId}`);
  console.log(`  Commitment: ${commitment.toString('hex')}`);
  console.log(`  Category: ${categoryStr}`);
  console.log(`  Cap: ${cap}`);

  // Persist locally so the demo claim can replay the digest+salt pair
  const entry: CodeEntry = {
    rawCode,
    category: categoryStr,
    cap,
    digestHex: digest.toString('hex'),
    saltHex: salt.toString('hex'),
    commitmentHex: commitment.toString('hex'),
    registeredAt: new Date().toISOString(),
  };
  mkdirSync(resolve(process.cwd(), '../demo'), { recursive: true });
  const existing: CodeEntry[] = existsSync(REGISTRY_PATH)
    ? JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
    : [];
  existing.push(entry);
  writeFileSync(REGISTRY_PATH, JSON.stringify(existing, null, 2));
  console.log(`  Saved digest+salt to ${REGISTRY_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
