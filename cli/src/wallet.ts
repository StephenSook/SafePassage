import 'dotenv/config';
import { Buffer } from 'node:buffer';
import { webcrypto } from 'node:crypto';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';

import * as ledger from '@midnight-ntwrk/ledger-v8';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import {
  createKeystore,
  PublicKey as UnshieldedPublicKey,
  type UnshieldedKeystore,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { NoOpTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type {
  MidnightProvider,
  WalletProvider,
  UnboundTransaction,
} from '@midnight-ntwrk/midnight-js-types';

import type { NetworkConfig } from './commons.js';

// Wallet SDK uses Apollo over WebSocket; Node 22 lacks the global ws ref.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).WebSocket = WebSocket;

export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

export async function mnemonicToSeed(mnemonic: string): Promise<Buffer> {
  const words = mnemonic.trim().split(/\s+/);
  if (!bip39.validateMnemonic(words.join(' '), english)) {
    throw new Error('Invalid BIP39 mnemonic phrase');
  }
  const seed = await bip39.mnemonicToSeed(words.join(' '));
  return Buffer.from(seed);
}

export function generateMnemonic(): string {
  return bip39.generateMnemonic(english, 256);
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  webcrypto.getRandomValues(bytes);
  return bytes;
}

async function initWalletWithSeed(
  seed: Buffer,
  config: NetworkConfig,
): Promise<WalletContext> {
  const hdWallet = HDWallet.fromSeed(seed);
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from seed');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive wallet keys');
  }

  hdWallet.hdWallet.clear();

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(
    derivationResult.keys[Roles.Zswap],
  );
  const dustSecretKey = ledger.DustSecretKey.fromSeed(
    derivationResult.keys[Roles.Dust],
  );
  const unshieldedKeystore = createKeystore(
    derivationResult.keys[Roles.NightExternal],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config.networkId as any,
  );

  const relayURL = new URL(config.node.replace(/^http/, 'ws'));
  const indexerClientConnection = {
    indexerHttpUrl: config.indexer,
    indexerWsUrl: config.indexerWS,
  };

  const shieldedConfig = {
    networkId: config.networkId,
    indexerClientConnection,
    provingServerUrl: new URL(config.proofServer),
    relayURL,
  };

  const unshieldedConfig = {
    networkId: config.networkId,
    indexerClientConnection,
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
  };

  const dustConfig = {
    networkId: config.networkId,
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
    indexerClientConnection,
    provingServerUrl: new URL(config.proofServer),
    relayURL,
  };

  const unifiedConfig = { ...shieldedConfig, ...unshieldedConfig, ...dustConfig };

  const facade = await WalletFacade.init({
    configuration: unifiedConfig,
    shielded: () =>
      ShieldedWallet(shieldedConfig).startWithSecretKeys(shieldedSecretKeys),
    unshielded: () =>
      UnshieldedWallet(unshieldedConfig).startWithPublicKey(
        UnshieldedPublicKey.fromKeyStore(unshieldedKeystore),
      ),
    dust: () =>
      DustWallet(dustConfig).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });

  await facade.start(shieldedSecretKeys, dustSecretKey);

  return { wallet: facade, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

export async function waitForSync(wallet: WalletFacade): Promise<void> {
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((s) => console.log(`[wallet] sync=${s.isSynced}`)),
      Rx.filter((s) => s.isSynced),
    ),
  );
}

export async function waitForFunds(wallet: WalletFacade): Promise<bigint> {
  const balance = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((s) => {
        const u = s.unshielded?.balances[ledger.nativeToken().raw] ?? 0n;
        const sh = s.shielded?.balances[ledger.nativeToken().raw] ?? 0n;
        console.log(`[wallet] waiting for NIGHT  unshielded=${u}  shielded=${sh}`);
      }),
      Rx.filter((s) => s.isSynced),
      Rx.map(
        (s) =>
          (s.unshielded?.balances[ledger.nativeToken().raw] ?? 0n) +
          (s.shielded?.balances[ledger.nativeToken().raw] ?? 0n),
      ),
      Rx.filter((bal) => bal > 0n),
    ),
  );
  return balance;
}

export async function registerNightForDust(
  ctx: WalletContext,
): Promise<boolean> {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  const unregistered =
    state.unshielded?.availableCoins.filter(
      (coin) => coin.registeredForDustGeneration === false,
    ) ?? [];

  if (unregistered.length === 0) {
    const dust = state.dust?.balance(new Date()) ?? 0n;
    console.log(`[wallet] no NIGHT UTXOs to register; current dust=${dust}`);
    return dust > 0n;
  }

  console.log(`[wallet] registering ${unregistered.length} NIGHT UTXO(s) for dust generation`);

  const recipe = await ctx.wallet.registerNightUtxosForDustGeneration(
    unregistered,
    ctx.unshieldedKeystore.getPublicKey(),
    (payload) => ctx.unshieldedKeystore.signData(payload),
  );
  const finalizedTx = await ctx.wallet.finalizeRecipe(recipe);
  const txId = await ctx.wallet.submitTransaction(finalizedTx);
  console.log(`[wallet] dust registration submitted txId=${txId}`);

  await Rx.firstValueFrom(
    ctx.wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((s) => console.log(`[wallet] dust balance=${s.dust?.balance(new Date()) ?? 0n}`)),
      Rx.filter((s) => (s.dust?.balance(new Date()) ?? 0n) > 0n),
    ),
  );
  return true;
}

export async function buildWalletFromEnv(config: NetworkConfig): Promise<WalletContext> {
  const mnemonic = process.env.MIDNIGHT_SEED_PHRASE;
  if (!mnemonic) {
    throw new Error(
      'MIDNIGHT_SEED_PHRASE is not set. Set it in cli/.env (see .env.example). ' +
        'Use the 24-word recovery phrase from your fresh Lace demo wallet.',
    );
  }

  const seed = await mnemonicToSeed(mnemonic);
  const ctx = await initWalletWithSeed(seed, config);

  console.log(`[wallet] address: ${ctx.unshieldedKeystore.getBech32Address().asString()}`);
  await waitForSync(ctx.wallet);

  const state = await Rx.firstValueFrom(ctx.wallet.state());
  const totalNight =
    (state.unshielded?.balances[ledger.nativeToken().raw] ?? 0n) +
    (state.shielded?.balances[ledger.nativeToken().raw] ?? 0n);

  if (totalNight === 0n) {
    console.log('[wallet] balance 0 — waiting for faucet credit');
    await waitForFunds(ctx.wallet);
  }

  await registerNightForDust(ctx);
  return ctx;
}

export async function createWalletAndMidnightProvider(
  ctx: WalletContext,
): Promise<WalletProvider & MidnightProvider> {
  await Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  return {
    getCoinPublicKey(): ledger.CoinPublicKey {
      return ctx.shieldedSecretKeys.coinPublicKey;
    },
    getEncryptionPublicKey(): ledger.EncPublicKey {
      return ctx.shieldedSecretKeys.encryptionPublicKey;
    },
    async balanceTx(
      tx: UnboundTransaction,
      ttl?: Date,
    ): Promise<ledger.FinalizedTransaction> {
      const txTtl = ttl ?? new Date(Date.now() + 30 * 60 * 1000);
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: ctx.shieldedSecretKeys,
          dustSecretKey: ctx.dustSecretKey,
        },
        { ttl: txTtl },
      );
      return ctx.wallet.finalizeRecipe(recipe);
    },
    async submitTx(tx: ledger.FinalizedTransaction): Promise<ledger.TransactionId> {
      return ctx.wallet.submitTransaction(tx);
    },
  };
}

export async function closeWallet(ctx: WalletContext): Promise<void> {
  try {
    await ctx.wallet.stop();
  } catch (e) {
    console.error(`[wallet] error closing: ${e}`);
  }
}
