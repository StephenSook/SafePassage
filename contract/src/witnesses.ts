import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from './managed/safepassage/contract/index.js';

/**
 * Private state for SafePassage circuits.
 *
 * Admin flow (deploy, fundPool, registerCode, revokeCode, setServiceRoute)
 * doesn't call witnesses. Claimant flow (claimSafePassage) reads two
 * Bytes<32> witnesses: codeDigest and issuerSalt.
 *
 * Claimant private state holds the raw digest + salt for the single code
 * the survivor is claiming. The CLI / frontend writes this into the private
 * state store before submitting the claim transaction.
 */
export type SafePassagePrivateState = {
  codeDigest: Uint8Array;
  issuerSalt: Uint8Array;
};

export const emptyPrivateState: SafePassagePrivateState = {
  codeDigest: new Uint8Array(32),
  issuerSalt: new Uint8Array(32),
};

/**
 * Admin-side witnesses. Even though admin circuits don't reference
 * codeDigest / issuerSalt, the generated Contract type requires both
 * witnesses to be supplied. Returning the private state value is harmless
 * for circuits that never consume the witness output.
 */
export const adminWitnesses = {
  codeDigest: (
    { privateState }: WitnessContext<Ledger, SafePassagePrivateState>,
  ): [SafePassagePrivateState, Uint8Array] => [privateState, privateState.codeDigest],
  issuerSalt: (
    { privateState }: WitnessContext<Ledger, SafePassagePrivateState>,
  ): [SafePassagePrivateState, Uint8Array] => [privateState, privateState.issuerSalt],
};

/**
 * Claimant-side witnesses scoped to a single claim. The CLI/frontend
 * supplies the survivor's specific digest + salt for one transaction.
 */
export function claimWitnesses(digest: Uint8Array, salt: Uint8Array) {
  if (digest.length !== 32) throw new Error('codeDigest must be 32 bytes');
  if (salt.length !== 32) throw new Error('issuerSalt must be 32 bytes');
  return {
    codeDigest: (
      { privateState }: WitnessContext<Ledger, SafePassagePrivateState>,
    ): [SafePassagePrivateState, Uint8Array] => [privateState, digest],
    issuerSalt: (
      { privateState }: WitnessContext<Ledger, SafePassagePrivateState>,
    ): [SafePassagePrivateState, Uint8Array] => [privateState, salt],
  };
}
