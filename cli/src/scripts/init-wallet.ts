import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import { webcrypto } from 'node:crypto';
import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { loadConfig } from '../commons.js';

const ENV_PATH = resolve(process.cwd(), '.env');
const ENV_EXAMPLE_PATH = resolve(process.cwd(), '.env.example');

/**
 * Generate a fresh BIP39 mnemonic, derive the unshielded Bech32 address for
 * the Preprod network, and (optionally) persist the seed to cli/.env.
 *
 * One-shot bootstrap for the demo wallet. Print the address so the user can
 * paste it into faucet.preprod.midnight.network and credit it with tNIGHT.
 */
export async function main(): Promise<void> {
  const config = loadConfig();

  const mnemonic = bip39.generateMnemonic(english, 256);
  const seed = Buffer.from(await bip39.mnemonicToSeed(mnemonic));

  const hdWallet = HDWallet.fromSeed(seed);
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from generated seed');
  }
  const derivation = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivation.type !== 'keysDerived') {
    throw new Error('Failed to derive keys from generated seed');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keystore = createKeystore(derivation.keys[Roles.NightExternal], config.networkId as any);
  const address = keystore.getBech32Address().asString();
  hdWallet.hdWallet.clear();

  console.log('');
  console.log('================================================================');
  console.log('  NEW SAFEPASSAGE ADMIN WALLET');
  console.log('================================================================');
  console.log('');
  console.log(`Network:  ${config.networkId}`);
  console.log(`Address:  ${address}`);
  console.log('');
  console.log('Seed phrase (24 words, KEEP SECRET — write on paper):');
  console.log('');
  console.log(`  ${mnemonic}`);
  console.log('');

  if (process.argv.includes('--write')) {
    const password =
      process.env.MIDNIGHT_STORAGE_PASSWORD ?? Buffer.from(webcrypto.getRandomValues(new Uint8Array(24))).toString('base64');

    let body = '';
    if (existsSync(ENV_PATH)) {
      body = readFileSync(ENV_PATH, 'utf8');
    } else if (existsSync(ENV_EXAMPLE_PATH)) {
      body = readFileSync(ENV_EXAMPLE_PATH, 'utf8');
    }

    body = upsertLine(body, 'MIDNIGHT_SEED_PHRASE', `"${mnemonic}"`);
    body = upsertLine(body, 'MIDNIGHT_STORAGE_PASSWORD', password);
    body = upsertLine(body, 'NETWORK', config.networkId);

    writeFileSync(ENV_PATH, body);
    console.log(`Wrote seed + storage password to ${ENV_PATH}`);
  } else {
    console.log('Re-run with --write to persist to cli/.env automatically.');
  }

  console.log('');
  console.log('Next step:');
  console.log('  1. Open https://faucet.preprod.midnight.network/');
  console.log('  2. Paste the address above into the faucet form');
  console.log('  3. Wait 30-60s for tNIGHT to land');
  console.log('  4. Run: npx tsx src/cli.ts deploy');
  console.log('');
}

function upsertLine(body: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(body)) return body.replace(re, line);
  return body.endsWith('\n') || body === '' ? body + line + '\n' : body + '\n' + line + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
