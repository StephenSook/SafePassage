# SafePassage — Applied Section 9 (Sookra Methodology Output)

**Project:** SafePassage — Privacy-Preserving Emergency Disbursement for IPV Survivors
**Builder:** Stephen Sookra (solo)
**Event:** MLH Midnight Hackathon · May 15-17, 2026 · DeFi Track
**Methodology:** Sookra Methodology v3.2.1 (5 Pillars)
**Document purpose:** Source #2 for NotebookLM synthesis — the applied methodology output that demonstrates how the 5 Pillars resolve to a concrete project. Read alongside Source #1 (Sookra Methodology framework).

---

## Problem Statement

Intimate partner violence survivors attempting to leave their abusers cannot use existing financial tools to access emergency aid without triggering retaliation. 99% of IPV cases involve financial abuse, in which the abuser maintains active surveillance over bank accounts, mobile payment apps, shared devices, and crypto wallets. Every transaction creates a visible footprint on a surface the abuser monitors. The act of *preparing to leave* becomes itself the moment of greatest danger — and the leading indicator that escalates the abuser's response to lethal violence.

The named person: **Tanya Williams**, 31, East Atlanta hairstylist. Her partner controls all finances and monitors her phone. She has $0 of her own money and approximately eleven minutes alone in the bathroom each day. That window — not money — is the asset she needs to preserve.

## The Gap

The structural failure has three concurrent dimensions:

**Technological:** Transparent blockchains (Ethereum, Bitcoin, Solana) make wallet activity publicly observable to anyone who knows the survivor's address. The USENIX Security 2023 audit of 17 P2P payment apps (Venmo, Cash App, PayPal) proved empirically that all tested apps fail the UI-bound adversary threat model — an abuser with physical device access can observe, intercept, and harass via standard UI without sophisticated tooling.

**Institutional:** State coalitions and federal agencies disbursing emergency aid (FVPSA, VOCA, TANF) are bound to strict confidentiality requirements under federal grant rules but rely on paper receipts, EBT cards, and case-manager-mediated checks — workflows that force shelters to manually redact PII before audit submission. The compliance burden bottlenecks lifesaving capital.

**Data:** No existing financial rail provides *both* abuser-invisible disbursement *and* auditor-verifiable accountability. Mixers (Tornado Cash) provide privacy but no auditability. Bank transfers provide auditability but no privacy. The gap is a *selective disclosure* gap — exactly what Midnight is architected to fill.

## Key Statistics

- **99%** of IPV cases involve financial abuse (NNEDV).
- **$103,767** — CDC NISVS lifetime economic burden per female IPV victim (Peterson et al., 2018, AJPH).
- **$3.6 trillion** — Cumulative national economic burden of IPV (CDC NISVS).
- **1 in 4 women** (24%) experience severe physical violence by an intimate partner in their lifetime (CDC NISVS).
- **14,095** requests for emergency DV services went unmet on a single 24-hour day in 2024 due to capital bottlenecks (NNEDV annual census).
- **$172.2M** — FVPSA Fiscal Year 2025 federal appropriation; average state award $2.58M.
- **2,015** recognized DV programs and emergency shelters nationally; **56** state and territorial coalitions.
- **10.5%** of Venmo's 389M historical transactions leaked sensitive information about 8.5M unique users (academic audit).
- **41 states** have passed Address Confidentiality Programs analogous to Georgia's SB 324 (effective July 1, 2026) — physical-world precedent for cryptographic identity substitution.

## Proposed Approach

A single Compact smart contract on Midnight implementing a privacy-preserving emergency disbursement protocol with the following architecture:

**Funding side.** State coalitions, shelter networks, corporate employer-benefit programs, and private philanthropies seed liquidity pools on-chain via a `fundPool` circuit. The contract's NIGHT balance serves as the canonical pool.

**Survivor side.** A pre-vetted survivor receives a one-time shelter-issued voucher (codeDigest + issuerSalt) through their advocate relationship. They enter the code into the SafePassage client, select a service category (HOUSING / TRANSPORT / LEGAL / PRESCRIPTION), and submit a claim. The client hashes the code to `Bytes<32>` in TypeScript before passing it as a private witness input to the `claimSafePassage` circuit.

**Verification side.** The ZK circuit verifies four conditions atomically: (1) the code commitment is registered, (2) the commitment is not revoked, (3) the deterministic nullifier has not been consumed, (4) the requested amount is under the issuer-set cap for that voucher. On success, the nullifier is consumed publicly and funds route via `sendUnshielded` to a pre-registered service-provider address corresponding to the selected category.

**Audit side.** The public ledger reveals only: the consumed nullifier, the anonymous category bucket, the pool balance change, and the verifiable service-provider routing. No survivor wallet, name, exact amount-linked-to-identity, or transaction history. The state crime-victim fund auditor receives mathematical proof that funds flowed to a legitimate aid category under approved limits — without ever seeing the survivor's PII.

**Selective disclosure framing.** This is the architectural North Star: abuser-invisible by design, auditor-accountable by construction. Privacy where the threat model demands it; transparency where compliance demands it.

## Expected Deliverable

By Sunday 1:00 PM ET on May 17, 2026:

1. **A deployed Compact smart contract** on Midnight Preprod (mainnet rehearsal Sunday morning if Preprod is rock-solid) implementing: enum Category, witness localSk(), public ledger sets and maps for code commitments / revoked codes / nullifiers / category mapping / cap mapping / service routes, admin circuits (`registerCode`, `revokeCode`, `registerRoute`), funding circuit (`fundPool`), and the primary `claimSafePassage` claim circuit.
2. **A working demo flow** showing one happy-path claim + one nullifier-replay failure (proves the one-time-code mechanism).
3. **A thin React + Vite frontend** with DApp Connector integration to Lace 2.0.4 wallet, demonstrating the survivor's claim submission in under 30 seconds.
4. **A 2-minute MLH-compliant demo video** opening with "Hey I'm Stephen and this is my demo for the Midnight Hackathon," using "selective disclosure" / "metadata as attack surface" / "unobserved readiness" vocabulary literally, and showing the public ledger view alongside the survivor's view to demonstrate what the abuser would see (nothing attributable).
5. **A public GitHub repository** with README that names Pressley's June 2025 Congressional hearing on crypto + IPV abuse as the regulatory frame, NNEDV / GCADV / PADV as institutional validators, and a Build Club application paragraph covering idea-stage validation, regulatory alignment, and interoperability.
6. **Devpost submission** on the DeFi track, with email matching events.mlh.io check-in email.

## Before / After

**Before SafePassage:**
A survivor in Atlanta needs $25 for a Lyft to a shelter. Her options: (a) cash she doesn't have, (b) Cash App / Venmo on a phone her abuser checks daily, (c) calling PADV's hotline from a phone whose call history is monitored, (d) walking to an advocate office without bus fare. The shelter, if she reaches them, writes a check to a landlord or hands her an EBT card — both create paper trails. The state coalition manually redacts her name from the receipt before submitting it for federal FVPSA reimbursement six weeks later. The shelter has fronted the cash. If anything in this chain is observable to her abuser before she actually exits, she may not survive the attempt.

**After SafePassage:**
The same survivor receives a one-time code from her advocate during a routine intake call. In the eleven-minute window she has each day, she opens the SafePassage client on a clean device, enters the code, selects "Transport," and confirms. The Midnight ZK circuit verifies in seconds, consumes the nullifier, and routes $25 to PADV's pre-verified Lyft Health corporate account. A car arrives. On her abuser's monitored chain explorer, the only visible event is `nullifier 0x7f3a... consumed | category: transport | pool: -$25`. No address, no destination, no time-correlation to her behavior. The state's CJCC auditor, querying the indexer, sees the same nullifier matched to GCADV's authorized program category and FVPSA-compliant disbursement cap. The shelter has not fronted cash. The redaction work has not happened, because there was never PII to redact.

## Feasibility Assessment

**Verdict: HIGH (build feasibility) · MEDIUM-HIGH (Build Club selection feasibility) · MEDIUM (Top 2 Overall feasibility).**

**Technical (HIGH):** Solo 48-hour build is feasible because the architecture maps cleanly onto Midnight's `example-zkloan` reference dApp, which uses the identical witness-state-plus-public-ledger pattern. Forking `example-zkloan` as the scaffold (rather than `example-bboard`) eliminates the largest source of first-time-Compact-developer failure: deciding how to structure the witness/ledger boundary. The Compact Agent Skill (forum.midnight.network/t/1083) is a compiler-validated AI reference that further reduces hallucinated-syntax risk. Pre-hashing shelter codes to `Bytes<32>` in TypeScript before passing into Compact eliminates the `Opaque<"string">` compiler trap. The issuer-assigned salt design closes the nullifier replay vulnerability. Mac M-series is documented as supported. Lace 2.0.4 (May 9 patch) is stable enough to demo from. The single biggest residual risk is proof-server bringup on Docker; mitigation is the Hour 2 environment-frozen kill-switch.

**Domain (HIGH):** Every claim about IPV financial abuse is grounded in NNEDV / CDC NISVS / Peterson et al. published data. Georgia's SB 324 Address Confidentiality Program (effective July 1, 2026) provides a precise real-world precedent for "trusted institutional intermediary issues credential, credential substitutes for identity in public-facing systems." NNEDV Safety Net is the canonical industry validator. GCADV and PADV are named, named for a reason, and verifiable.

**Business (MEDIUM-HIGH):** The B2B SaaS model targeting state coalitions ($25K-$50K/year) is benchmarked against existing case management software (EmpowerDB, CharityTracker, CaseWorthy at $20-$150/user/month) and Maven Clinic's privacy-first employer-benefits model. The 24-month SOM target of 100 shelters or 5 coalitions = $500K-$1.5M ARR is plausible founder-led. The $5M ARR vision (20 coalitions + 400 shelters + 30 corporate integrations) maps to acquisition by Bonterra ($260M revenue, $832M valuation) or Tyler Technologies ($2.1B revenue, 35 acquisitions since 1998). The principal residual risk is buyer-budget reality: FVPSA grant rules restrict administrative overhead, which may compress the realistic first-purchase price below the proposed $25K floor. Mitigation: pursue grant-subsidized initial deployment (Allstate Foundation Purple Purse precedent: $2.2M to 54 state coalitions for survivor economic empowerment).

**Regulatory (MEDIUM-HIGH):** Representative Ayanna Pressley's June 5, 2025 House Financial Services Committee hearing on crypto-enabled IPV abuse cuts both ways for SafePassage. *In favor:* Congress has explicitly named this intersection as a regulatory gap requiring protective infrastructure. SafePassage is the protective use case, not the abusive one. *Against, if mis-framed:* "Untraceable money for survivors" sounds like exactly the problem Pressley described. Mitigation is vocabulary discipline — use "selective disclosure," "compliant privacy," "auditable for the state crime-victim fund," and never use "anonymous," "untraceable," "mixer-like," or "censorship-resistant."

**Hackathon-specific (MEDIUM for Top 2 Overall):** The 4 MLH equally-weighted criteria (Technology / Originality / Execution / Learning per MLH policies repo; track sponsors may substitute Design for Originality) favor working demos over conceptual brilliance. The Mini Dapp Hackathon and Midnight Summit winning archetype (LucentLabs, Midnight Bank, Gracias Esteban, zkBadge) is "named institutional persona + compliance hook + working contract + selective-disclosure framing" — SafePassage maps onto that archetype precisely. The principal residual hackathon risk is competition from the AI Track, where privacy + AI is Eran Barak's loudest current narrative (the medical-records / metadata-as-attack-surface frame). Mitigation: include one line in the video explicitly noting SafePassage is AI-resistant by design, since witness state is unavailable to model training pipelines that would compromise survivors.

---

## Sookra Methodology Self-Score (for NotebookLM evaluation reference)

| Pillar | Score | Weakest Evidence | Strongest Evidence |
|---|---|---|---|
| **1. Real problem, named person** | 9/10 | Persona name in pitch only, never in product UI | Tanya Williams + 11-minute window + named Atlanta context |
| **2. Structural gap (data/tech/incentive)** | 9/10 | Auditor side could be more explicitly named (CJCC, FVPSA admins) | Selective-disclosure-as-architecture is genuinely uncopyable on transparent chains |
| **3. Human-scale stat that lands emotionally** | 9/10 | $103,767 is somewhat abstract | "99% of IPV cases involve financial abuse" + "eleven minutes alone" |
| **4. Tech as inevitable answer → 'that shouldn't be possible' demo** | 8/10 | Live demo carries 48-hour execution risk | example-zkloan structural twin reduces failure risk; nullifier-replay-fail demo is unforgettable |
| **5. Business numbers: TAM, cost/incident, revenue model** | 7/10 | FVPSA grant rules may compress proposed $25K SaaS floor | $172M FVPSA + $1-2B VOCA + Bonterra/Tyler exit comparators are real and named |

**Weakest pillar:** P5 Business Model. The Gemini lane priced state coalition SaaS at $25K-$50K/year, but FVPSA administrative-overhead restrictions may prevent shelters from absorbing this cost from federal grant lines. Mitigation: grant-subsidized first deployment (Allstate Foundation precedent) or yield-on-pooled-capital model (philanthropic pools generate the operating revenue, eliminating the SaaS line item entirely).

**Chairman verdict:** GO. Flip condition: if Hour 4 of hackathon shows the proof server cannot be brought up reliably on Mac M-series, pivot to Gaming Track with a simpler privacy primitive. One thing first: install Compact Agent Skill into AI tool before Thursday evening.

---

*End of applied Section 9. This document combined with the Sookra Methodology framework (Source #1) gives NotebookLM the full input needed to evaluate methodology fit, identify weak pillars, and surface gaps the other research lanes did not cover.*
