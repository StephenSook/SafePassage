import { createHash, randomBytes } from 'crypto';
import { type WitnessContext } from '@midnight-ntwrk/compact-runtime';

/**
 * Witnesses for the admin deployment + admin-only circuits.
 * Admin identity is established by ownPublicKey() in the contract, so no
 * secret witness is needed for admin gating - the wallet signing the tx
 * IS the admin proof.
 */
export const adminWitnesses = {};

/**
 * Witnesses for the survivor claim flow. The survivor supplies:
 *   - codeDigest: sha256(rawCode) - knowledge of the one-time code
 *   - issuerSalt: random per-issuance salt - domain-separates the nullifier
 */
export const claimWitnesses = (codeDigest: Buffer, issuerSalt: Buffer) => ({
  codeDigest: (_ctx: WitnessContext<unknown, unknown>) => [codeDigest],
  issuerSalt: (_ctx: WitnessContext<unknown, unknown>) => [issuerSalt],
});

/**
 * Off-chain hashing - the commitment stored on-chain is sha256(sha256(code)).
 * The first sha256 is the codeDigest (private witness); the second is the
 * commitment (public ledger membership check).
 */
export function hashCode(rawCode: string): { digest: Buffer; commitment: Buffer } {
  const digest = createHash('sha256').update(rawCode).digest();
  const commitment = createHash('sha256').update(digest).digest();
  return { digest, commitment };
}

/** Random 32-byte salt for nullifier domain separation. */
export function newIssuerSalt(): Buffer {
  return randomBytes(32);
}
