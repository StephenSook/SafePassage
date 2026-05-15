/**
 * Mock Lyft Health dispatch endpoint.
 *
 * In production, this would be replaced with a real Lyft Health API
 * integration (or another verified-service-provider's webhook). For the
 * hackathon demo, this returns a plausible response shape that the LiveDemo
 * frontend treats as ground truth after a successful on-chain claim.
 *
 * The DUST sponsoring architecture (docs/dust-sponsoring.md) describes how
 * the shelter-operated relayer service would call this endpoint as the next
 * step after the Midnight contract emits the public route payment.
 */
export interface LyftDispatchResponse {
  status: 'dispatched';
  service: 'Lyft Health';
  destination: string;
  etaMinutes: number;
  reference: string;
  amountCents: number;
  category: 'TRANSPORT';
}

export function mockLyftDispatch(amount: number): LyftDispatchResponse {
  return {
    status: 'dispatched',
    service: 'Lyft Health',
    destination: 'verified shelter address',
    etaMinutes: 8,
    reference: `lyft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amountCents: amount * 100,
    category: 'TRANSPORT',
  };
}
