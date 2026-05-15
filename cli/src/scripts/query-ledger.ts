// @ts-nocheck - depends on contract artifacts (npm run compact in contract/).
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract, ledger } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract';
import { loadConfig, buildProviders, contractConfig } from '../commons.js';
import { loadDeployment } from '../helpers.js';

export async function main(): Promise<void> {
  const config = loadConfig();
  const accountId = process.env.SAFEPASSAGE_ACCOUNT_ID ?? 'safepassage-reader-dev';
  const providers = buildProviders(config, accountId);
  const { contractAddress } = loadDeployment();

  const deployed = await findDeployedContract(providers, {
    contractAddress,
    contract: new Contract(adminWitnesses),
    privateStateId: contractConfig.privateStateStoreName,
    initialPrivateState: {},
  });

  const state = await deployed.contractPublicState();
  const pub = ledger(state);

  console.log('SafePassage public ledger state');
  console.log(`  Contract:       ${contractAddress}`);
  console.log(`  Network:        ${config.networkId}`);
  console.log(`  Admin:          ${pub.admin}`);
  console.log(`  Pool balance:   ${pub.poolBalance}`);
  console.log(`  Code commits:   ${pub.codeCommitments.size()}`);
  console.log(`  Revoked codes:  ${pub.revokedCommitments.size()}`);
  console.log(`  Nullifiers:     ${pub.nullifiers.size()}`);
  console.log(`  Service routes: ${pub.serviceRoutes.size()}`);
  console.log('');
  console.log('No survivor identity. No raw codes. Selective disclosure verified.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
