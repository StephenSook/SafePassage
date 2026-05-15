# Contributor Hub Signal Extract — Source #10 for NotebookLM

**Purpose:** Intelligence on what the Midnight team is actively prioritizing as of May 2026, derived from the `midnightntwrk/contributor-hub` GitHub repository's open bounty issues and the official `midnightntwrk` example dApp repositories.

**Date pulled:** May 14, 2026 (evening, day before MLH Midnight Hackathon kickoff)

**Source URLs:**
- Repo: https://github.com/midnightntwrk/contributor-hub
- Issues: https://github.com/midnightntwrk/contributor-hub/issues
- Example dApps: https://github.com/orgs/midnightntwrk/repositories

---

## Section 1 — Active Tutorial Bounties (Open Issues with `bounty` Label)

These are content commissions Midnight is currently paying contributors NIGHT tokens to write. They are tutorial bounties, NOT dApp build bounties — but they reveal what the Midnight team thinks the developer ecosystem most needs documented. The implicit signal: what they're paying to teach is what they want devs to build well.

Most are authored by **Olanetsoft**, a Midnight content contributor.

| Issue # | Bounty Title | Priority | Signal for SafePassage |
|---|---|---|---|
| #328 | [Tutorial] Building an Unshielded Token dApp with UI | HIGH | Confirms unshielded + UI is a canonical, judge-acceptable pattern — not second-class. SafePassage's public-route + sendUnshielded path is aligned. |
| #327 | [Tutorial] Shielded Token Operations: Mint, Transfer & Burn with Test Suite | MEDIUM | Test suite is valued. If time permits, add minimal test coverage to SafePassage repo. |
| #326 | [Tutorial] Building a Shielded Token dApp with UI | MEDIUM | Shielded variant is also canonical. Confirms the shielded vs unshielded fork in SafePassage is a real architectural choice, not a workaround. |
| #324 | [Tutorial] Midnight vs Other Privacy Chains: Architecture Comparison for Developers | MEDIUM | They want devs articulating *why Midnight specifically* — exactly the Pillar 2 requirement. Include a "Why Midnight, not Aztec/Aleo" paragraph in the README. |
| #323 | [Tutorial] Running a Midnight Node: Setup, Sync & Monitoring | MEDIUM | Node operation treated as first-class topic. Not directly relevant to SafePassage. |
| #322 | [Tutorial] Getting NIGHT Tokens: Exchanges, Bridging & Wallet Funding on Mainnet | MEDIUM | Token acquisition is acknowledged as a real developer friction. |
| #321 | [Tutorial] Handling Midnight SDK Breaking Changes: A Developer's Upgrade Playbook | MEDIUM | Version skew is a confirmed top developer pain. Reinforces the "pin everything Thursday, never update during hackathon" discipline. |
| #320 | [Tutorial] Security Checklist for Midnight dApps Before Deployment | LOW | Pre-deployment security review is valued. Add a short threat-model section to the README. |
| #319 | [Tutorial] When Proofs Fail: Debugging Proof Server Errors & ZK Generation Failures | MEDIUM | Proof server is unstable enough to need its own debugging tutorial. Confirms the Hour 2 kill-switch is necessary. |
| #318 | [Tutorial] Decoding Error 1010: What 'Invalid Transaction' Actually Means | LOW | 1010 errors are a known developer frustration. Pre-build error-handling matters. |
| #317 | [Tutorial] Building Batch Transactions: Multi-Recipient Settlements & Complex Flows | LOW | Multi-recipient is a recognized advanced pattern. Out of scope for SafePassage v1. |

**Aggregate signal:** The Midnight team is investing most heavily in documenting the **Shielded/Unshielded Token dApp with UI** pattern. SafePassage's architecture (one contract + service routing + React UI) maps directly onto this canonical pattern. If SafePassage's README and demo video explicitly mirror the structure of these tutorials, it will read as on-template, not exotic.

---

## Section 2 — Official Midnight Example dApps (Scaffolding Candidates)

These are the production-grade reference dApps maintained by the Midnight org. They are the canonical starting points for any new dApp.

| Repository | Description | Relevance to SafePassage |
|---|---|---|
| `midnightntwrk/example-bboard` | Compact contract + CLI + React UI bulletin-board template | Default scaffold most teams start from. NOT the best choice for SafePassage. |
| `midnightntwrk/example-counter` | Compact contract + CLI template (simplest) | Useful for Hour 0-2 environment verification only. |
| `midnightntwrk/example-dex` | Privacy-preserving DEX with ZKPs | DeFi-track aligned but architecturally distant from SafePassage. |
| **`midnightntwrk/example-zkloan`** | **Private credit scoring with witness state for sensitive financial profile + public ledger for non-sensitive outcome** | **STRUCTURAL TWIN OF SAFEPASSAGE. Fork this as the starting scaffold.** |
| `midnightntwrk/example-nft-contracts` | NFT contract examples | Not relevant. |
| `midnightntwrk/example-locker` | Time-locked release pattern | Not directly relevant; could inform a revocation-with-cooldown extension. |

---

## Section 3 — Critical Finding: example-zkloan as SafePassage's Structural Twin

From the example-zkloan README:

> *"The user's sensitive financial profile (creditScore, monthlyIncome, etc.) is the private state, provided to the contract's logic as a witness and never transmitted to the network. The final, non-sensitive outcome of the loan application is the public state, verifiably recorded on the ledger."*

> *"The bridge between these two worlds is the zero-knowledge proof. The contract's logic executes off-chain, evaluating the user's private data and generating a cryptographic proof. This proof confirms that the evaluation was performed correctly according to the predefined rules, without revealing any of the underlying private information. The on-chain component of the contract simply verifies this proof before updating the public ledger, ensuring both privacy and integrity."*

This is the **exact** witness-vs-ledger pattern SafePassage needs. The mapping:

| example-zkloan element | SafePassage element |
|---|---|
| Applicant struct (creditScore, monthlyIncome) — private state | Survivor's shelter code + issuerSalt + requested amount — private witness inputs |
| Eligibility tier evaluation circuit | claimSafePassage circuit verifying commitment + nullifier + cap + category |
| Loan status (Approved/Proposed/NotAccepted) — public state | Nullifier consumed + category bucket + pool delta — public ledger |
| secretPin per applicant | issuerSalt per voucher (the architectural correction over user-chosen salt) |
| respondToLoan circuit (user agency) | revokeCode circuit (admin agency) |

**Tactical implication:** Fork `example-zkloan` as the starting scaffold, not `example-bboard`. The bulletin-board template is for write-public-data dApps. SafePassage is a write-private-data-verify-publicly dApp — which is exactly what example-zkloan models.

---

## Section 4 — What the Contributor Hub Does NOT Show

Important non-findings:

1. **No active dApp build bounties as of pull date.** The `bounty` label is currently attached only to tutorial content commissions. The Midnight team is not publicly funding new dApp development through this hub right now — they are funding *documentation of existing dApp patterns*.

2. **No specific bounty for emergency-disbursement or DV-aid dApps.** SafePassage is not directly aligned with any existing bounty. This is neutral — it means it's also not duplicating something Midnight has already commissioned, which is a positive Originality signal for MLH judging.

3. **No DeFi-Track-specific bounty.** The DeFi track for the May 2026 MLH hackathon does not have a published, granular rubric inside the contributor hub. The rubric is expected to be revealed at the Saturday May 15 noon ET kickoff (confirmed by IslandGhostStephanie in Discord).

---

## Section 5 — How to Use This Intelligence

**For the README:**
- Mirror the structure of the tutorial bounties (Why Midnight, threat model, before deployment checklist).
- Reference `example-zkloan` as the scaffold inspiration. Specifically credit the Midnight team's "Kachina model" pattern of separating private witness state from public ledger state.

**For the pitch video:**
- One line that says "Built on the same witness-ledger architecture pattern as Midnight's zkLoan reference dApp" earns immediate familiarity points with Midnight DevRel judges.

**For Q&A:**
- "Is this just zkLoan repackaged?" is now a likely judge question. Prepare the differentiation answer: *zkLoan evaluates eligibility for capital you receive into your own wallet; SafePassage evaluates eligibility for capital routed to a service provider, never your wallet. The difference is that the survivor never holds the asset — which is the whole point.*

**For Build Club application paragraph:**
- Cite that SafePassage adopts Midnight's reference patterns by design, which signals "ready for productionalization" rather than "exotic one-off."

---

*End of Contributor Hub Signal Extract. Upload as Source #10 in NotebookLM. Combined with the Discord transcript (Source #9) and Claude's recon report (Source #8), this completes the event-specific intelligence layer of the source set.*
