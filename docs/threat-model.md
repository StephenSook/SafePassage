# SafePassage Threat Model

This document describes who SafePassage protects against, what they can and cannot observe, and what the protocol does not defend.

## Protected party

IPV survivor or any individual whose physical safety depends on emergency funds reaching a verified service (transport, shelter, legal aid, prescription) without observable preparation on any surface their adversary can access.

## Adversary tiers

### Tier 1: Curious chain observer (default)

**Capabilities:** Can query the Midnight indexer and explorer. Can see public ledger state (pool balance, nullifier set, category bucket counts, service-route registry).

**Cannot observe:** Survivor identity. The raw shelter code. The digest-salt pair used to construct the nullifier. Which specific category bucket each individual nullifier maps to.

**Mitigation:** Core selective-disclosure design. No mitigation required beyond contract correctness.

### Tier 2: UI-bound abuser (PRIMARY THREAT)

**Capabilities:** Physical access to survivor device (per Cornell Tech CETA research, Diana Freed et al. on financial-app UI-bound adversaries). Can read banking apps, screenshots, browser history, shared Apple/Google accounts. Can inspect transaction logs. Stalkerware may be installed (per NNEDV Safety Net 2025 guidelines).

**What is protected:** If the protocol completes on a Lace install that the abuser cannot access (advocate-mediated desktop flow), no evidence of the disbursement reaches the abuser view.

**What leaks:** If the survivor uses Lace on a compromised device, the abuser sees the Lace transaction history. v1 protocol does NOT defend the device. It defends the chain. Compensating control: desktop-prepared, advocate-mediated flow recommended for v1. Mobile-native flow is a tracked v2 dependency on Lace Mobile.

### Tier 3: Sophisticated chain analyst (statistical inference)

**Capabilities:** Correlates timing of pool decrements with public service-route addresses. Observes that the Lyft Health address gets a 25-NIGHT payout 30 seconds after a TRANSPORT nullifier appears.

**What is protected:** Survivor identity remains unlinked. Service is publicly known. Survivor is not.

**What leaks:** In aggregate, the protocol reveals service-bucket flow rates. A sophisticated observer can infer that a given shelter network saw 12 transport disbursements this week.

**Mitigation:** Dummy traffic from the relayer (planned, not built). Batched settlement (planned, not built). v1 acknowledges the leak.

### Tier 4: Regulator or state auditor

**Capabilities:** Subpoena Midnight indexer logs. Demand admin account records.

**What is protected:** Survivor identities. Admin only sees code commitments and category-cap registrations. Never raw codes or survivor identities.

**What is available for audit:** Total pool flows. Category-bucket totals. Nullifier-set growth. Sufficient for FVPSA Title IV-A and VOCA compliance reporting.

## Out of scope for v1

- Network-level deanonymization (Tor/VPN not enforced).
- Compromised demo wallet seed (Lace seed-phrase compromise = full break).
- Coerced disclosure (abuser physically forces survivor to enter code).
- Mobile-native ZK proving (depends on Lace Mobile).
- Front-running of the nullifier transaction (depends on Midnight mempool privacy roadmap).
- Centralized service-route registry (admin key compromise = router redirection. Mitigation is multisig governance in v2).

## Validator receipts

This threat model was constructed against the following published research:

1. **USENIX Security 2023** - Audit of 13 mobile banking apps and 17 P2P payment apps. Finding: all tested apps are generally ill-equipped to deal with user-interface-bound (UI-bound) adversaries, permitting unauthorized access to logins, surreptitious surveillance, and harassing messages. The adversary model studied (physical access via standard UI) is exactly the IPV abuser threat model.

2. **Cornell Tech Clinic to End Tech Abuse (CETA), Diana Freed et al.** - Abusers rarely need sophisticated technical skills. The biggest danger lies not in the device itself, but in how it is handled. Most surveillance uses standard consumer apps.

3. **NNEDV Safety Net Project, Erica Olsen (Tech Summit 2025)** - Minimize opportunities for abuse, while also maximizing support for any survivor or victim who is abused on the platform. Ensure any history of the app/tool is cleared on exit (browser, session, logs).

Outreach to these organizations is in `research/outreach/sent-emails.md`. Live advocate review requested for Sunday morning before submission.
