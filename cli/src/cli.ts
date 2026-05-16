#!/usr/bin/env tsx
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { main as deploy } from './scripts/deploy.js';
import { main as fundPool } from './scripts/fund-pool.js';
import { main as registerCode } from './scripts/register-code.js';
import { main as claim } from './scripts/claim.js';
import { main as queryLedger } from './scripts/query-ledger.js';
import { main as initWallet } from './scripts/init-wallet.js';

void yargs(hideBin(process.argv))
  .scriptName('safepassage')
  .command(
    'init-wallet',
    'Generate a fresh admin wallet (prints address + seed, --write persists to cli/.env)',
    (y) => y.option('write', { type: 'boolean', default: false }),
    () => initWallet(),
  )
  .command('deploy', 'Deploy SafePassage contract', {}, () => deploy())
  .command('fund-pool <amount>', 'Fund pool with N tokens', {}, () => fundPool())
  .command(
    'register-code <code> <category> <cap>',
    'Register a one-time shelter code commitment',
    {},
    () => registerCode(),
  )
  .command(
    'claim <code> <category> <amount>',
    'Submit a claim (consumes nullifier, routes to verified service)',
    {},
    () => claim(),
  )
  .command('query-ledger', 'Print public ledger state', {}, () => queryLedger())
  .demandCommand(1)
  .strictCommands()
  .help()
  .parse();
