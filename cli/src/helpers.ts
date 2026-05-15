import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
