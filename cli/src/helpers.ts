import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

const DEPLOY_OUTPUT_PATH = resolve(process.cwd(), '../deployment/deploy-output.json');

export interface DeployOutput {
  contractAddress: string;
  txId: string;
  deployedAt: string;
  network: 'testnet' | 'mainnet';
}

export function saveDeployment(out: DeployOutput): void {
  writeFileSync(DEPLOY_OUTPUT_PATH, JSON.stringify(out, null, 2));
}

export function loadDeployment(): DeployOutput {
  if (!existsSync(DEPLOY_OUTPUT_PATH)) {
    throw new Error(
      `No deployment found at ${DEPLOY_OUTPUT_PATH}. Run \`npm run deploy\` first.`,
    );
  }
  return JSON.parse(readFileSync(DEPLOY_OUTPUT_PATH, 'utf8')) as DeployOutput;
}

export const CATEGORY = {
  HOUSING: 0,
  TRANSPORT: 1,
  LEGAL: 2,
  PRESCRIPTION: 3,
} as const;

export type CategoryName = keyof typeof CATEGORY;

export function parseCategory(s: string): number {
  const upper = s.toUpperCase() as CategoryName;
  if (!(upper in CATEGORY)) {
    throw new Error(`Invalid category: ${s}. Must be one of: ${Object.keys(CATEGORY).join(', ')}`);
  }
  return CATEGORY[upper];
}

/**
 * Double-sha256 a raw shelter-issued code into the Bytes<32> digest that
 * flows into persistentHash<Bytes<32>>(digest) -> codeCommitments. The
 * commitment returned here is what the admin passes to registerCode.
 */
export function hashCode(rawCode: string): { digest: Buffer; commitment: Buffer } {
  const first = createHash('sha256').update(rawCode, 'utf8').digest();
  const digest = createHash('sha256').update(first).digest();
  const commitment = createHash('sha256').update(digest).digest();
  return { digest, commitment };
}

/** Fresh 32-byte issuer salt for a single code. */
export function newIssuerSalt(): Buffer {
  return Buffer.from(randomBytes(32));
}
