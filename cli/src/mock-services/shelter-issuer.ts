// @ts-nocheck - depends on contract artifacts (npm run compact in contract/).
import { hashCode, newIssuerSalt } from '@safepassage/contract';

/**
 * Mock shelter code issuer.
 *
 * A real deployment would have each shelter operate their own issuer
 * service that generates codes for incoming survivors during intake. For
 * the hackathon demo, this is a single function that produces the same
 * digest+salt+commitment triplet the survivor and the contract need.
 *
 * The contract only ever sees the commitment (sha256(sha256(rawCode))).
 * The digest+salt pair lives off-chain and is required to construct a
 * valid claim witness.
 */
export interface IssuedCode {
  rawCode: string;
  digest: Buffer;
  salt: Buffer;
  commitment: Buffer;
  shelterId: string;
  category: 'HOUSING' | 'TRANSPORT' | 'LEGAL' | 'PRESCRIPTION';
  capUsd: number;
}

export function issueCode(
  shelterId: string,
  category: IssuedCode['category'],
  capUsd: number,
): IssuedCode {
  const rawCode = `${shelterId}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const { digest, commitment } = hashCode(rawCode);
  const salt = newIssuerSalt();
  return { rawCode, digest, salt, commitment, shelterId, category, capUsd };
}
