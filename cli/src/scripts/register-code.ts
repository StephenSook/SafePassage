import 'dotenv/config';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { SafePassage, adminWitnesses, emptyPrivateState } from '@safepassage/contract';
import { loadConfig, buildProviders, contractConfig } from '../commons.js';
import { buildWalletFromEnv, closeWallet } from '../wallet.js';
import { loadDeployment, parseCategory, hashCode, newIssuerSalt } from '../helpers.js';

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

  const config = loadConfig();
  const walletCtx = await buildWalletFromEnv(config);
  try {
    const providers = await buildProviders(config, walletCtx);
    const { contractAddress } = loadDeployment();

    const compiled = CompiledContract.make('SafePassage', SafePassage.Contract).pipe(
      CompiledContract.withWitnesses(adminWitnesses),
      CompiledContract.withCompiledFileAssets(contractConfig.zkConfigPath),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deployed = (await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract: compiled,
      privateStateId: contractConfig.privateStateStoreName,
      initialPrivateState: emptyPrivateState,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    const tx = await deployed.callTx.registerCode(commitment, category, BigInt(cap));
    console.log(`registerCode submitted. Tx: ${tx.public.txId}`);
    console.log(`  Commitment: ${commitment.toString('hex')}`);
    console.log(`  Category:   ${categoryStr}`);
    console.log(`  Cap:        ${cap}`);

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
      ? (JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as CodeEntry[])
      : [];
    existing.push(entry);
    writeFileSync(REGISTRY_PATH, JSON.stringify(existing, null, 2));
    console.log(`  Saved digest+salt to ${REGISTRY_PATH}`);
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
