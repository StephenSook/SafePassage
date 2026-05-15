# Murder Board Q&A - Top 10 Questions a Skeptical Judge Will Ask

Prepared answers for the 10 most likely adversarial questions during Q&A. Drilled from Q4 of the NotebookLM gap-hunting round.

## 1. The DUST Sponsoring Problem

**Q:** Midnight requires DUST to submit any transaction. Your survivor has $0 and is being monitored. How does she pay the network fee without the abuser seeing her acquire crypto?

**A:** SafePassage v1 uses an advocate-mediated desktop flow. The shelter advocate, not the survivor, signs and pays DUST on the claim transaction. The survivor provides the raw code in person or via secure channel. v2 design uses a sponsored-transaction relayer (architecture in `docs/dust-sponsoring.md`) where the shelter operates a pre-funded relayer wallet. The survivor never holds DUST in either version. This is a deliberate v1 scope decision, not an oversight.

## 2. The Mobile ZK Proving Gap

**Q:** Your pitch says the survivor has 11 minutes alone, implying mobile usage. But Lace Mobile doesn't support Midnight, and proof generation needs Docker. How does she actually generate the proof on her phone?

**A:** She doesn't. v1 is desktop-prepared. The advocate runs the Lace install + proof server during shelter intake. The survivor confirms via a low-footprint channel (Signal, encrypted SMS). Mobile-native ZK proving is a tracked v2 dependency on Lace Mobile. We don't pretend the protocol works on her iPhone today; we built the v1 that actually works today.

## 3. Destination Privacy

**Q:** Your pitch implies the abuser sees nothing. But sendUnshielded reveals the destination address on the public ledger. Isn't that a privacy leak?

**A:** Survivor identity is hidden. Survivor wallet is never used. The chain cannot link her to any disbursement. The service address (e.g., Lyft Health corporate) is intentionally public-by-design - this is what lets state auditors verify funds flowed to legitimate aid, and what satisfies FVPSA compliance. The abuser sees that a state fund paid a medical transport network. He doesn't see her name, her request, or her location. We don't claim destination privacy; we claim survivor unlinkability. That's a deliberate architectural choice.

## 4. Centralized Oracle Trust

**Q:** Your service-route registry is admin-controlled. If the admin key is compromised, the attacker redirects all transport payments to their wallet. Isn't that centralization risk?

**A:** Yes. v1 is single-sig admin for hackathon scope. v2 design uses multisig governance with shelter coalition + Midnight Foundation co-signers. Even in v1, the attack surface is limited: the relayer can redirect future payments, but cannot fabricate claims (admin key cannot create valid witnesses for codes the admin didn't register). The damage from admin compromise is bounded by the next admin-key rotation, not unbounded survivor exposure.

## 5. Statistical Inference on Unshielded Routes

**Q:** A sophisticated chain analyst can correlate timing of pool decrements with public service-route addresses. Aren't you leaking aggregate shelter-network activity?

**A:** Yes, at the aggregate level. The protocol reveals that "this shelter network saw 12 transport disbursements this week" to a sophisticated observer. Individual survivor identities remain unlinked. v2 mitigation includes dummy traffic from the relayer and batched settlement (designed, not built). For v1, this is a known limitation - threat model in `docs/threat-model.md` documents it explicitly. We do not overclaim.

## 6. Price Oracle Dependency

**Q:** The contract denominates in NIGHT tokens but the UI shows USD. How is the conversion calculated securely?

**A:** v1 hardcodes a 1:1 rate for the demo ($1 = 1 NIGHT). Production would use a Chainlink-style oracle. Enterprise integration via Stripe Issuing or Marqeta is the path for fiat conversion - the survivor never touches the chain-to-fiat boundary; the verified service provider does. The on-chain demo abstracts this; the architecture in the README anchors how it works in production.

## 7. Front-Running the Nullifier

**Q:** A malicious node operator could see the claim transaction in the mempool and front-run or censor it. How do you defend?

**A:** Out of scope for v1. Midnight's roadmap includes shielded mempool support which would mitigate. For a 48-hour hackathon, we don't ship mempool privacy. The threat model in `docs/threat-model.md` documents this as a deferred concern. Realistic attack timeline: front-running requires sub-second adversarial response to a transaction window measured in minutes for a shelter intake. Operationally, the survivor's escape doesn't depend on millisecond-tight settlement.

## 8. Admin Key Recovery

**Q:** What happens if the admin's Lace install is destroyed mid-operation?

**A:** v1 single-sig admin = recovery via the seed phrase backup. v2 multisig allows continuity without seed compromise. Demo wallet seed is stored offline (paper) per the constitution rule. Production deployment would mandate multisig from day one.

## 9. Indexer Latency

**Q:** Your frontend depends on the Midnight Indexer GraphQL API. If the indexer lags 3 minutes behind chain finality, the survivor sees a "processing" screen during her escape window. What's the fallback?

**A:** Optimistic UI: the claim form returns success on transaction submission and shows the service confirmation immediately. The public ledger view on the left side updates when the indexer catches up. The UX never blocks on indexer latency. If the indexer is fully down, the contract still works; the demo just can't show the public-ledger side update in real time.

## 10. Unused Code Garbage Collection

**Q:** If shelters generate thousands of codeCommitments for survivors who never claim, does the public Set bloat indefinitely? Who pays state rent?

**A:** v1 doesn't garbage collect. The Set grows monotonically. On Midnight mainnet, state rent is paid in DUST at deploy time and per write. For a hackathon-scale deployment, this is bounded. Production deployment would add code-expiration logic to `revokeCode` (auto-revoke after N days). v2 design includes a code-rotation policy.

## Pre-canned bridges

If pressed for more detail than the above, deflect with: "The architecture lives in `docs/threat-model.md` and `docs/dust-sponsoring.md`. Build Club mentorship is the right venue to harden v1 into a production protocol with a real shelter partner."
