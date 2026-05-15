# SafePassage

> **Money moved. Identity stayed.**

[![DeFi Track](https://img.shields.io/badge/MLH-DeFi%20Track-A4F4FD)](https://mlh.link/midnight-hackathon-may-2026)
[![Top 2 Overall](https://img.shields.io/badge/Build%20Club-Candidate-A4F4FD)](https://midnight.network/build-club)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Built on Midnight](https://img.shields.io/badge/Built%20on-Midnight-1a1a2e)](https://midnight.network)

Privacy-preserving emergency disbursement on the Midnight network. SafePassage routes emergency funds (transport, shelter, legal aid, prescription) directly to verified service providers without creating any on-chain footprint that an abuser monitoring the survivor's device or wallet could observe.

**Contract:** Preprod-deployed for prize eligibility; mainnet deployment is the stretch target *(see `deployment/deploy-output.json` once deployed)*. Per Midnight Foundation Discord guidance 2026-05-15: mainnet is not required for prize eligibility — Preprod is sufficient. SafePassage targets mainnet anyway for institutional credibility against the Technology + Completion + Business Value judging dimensions.

**Hackathon submission:** MLH Midnight Hackathon, May 15-17 2026. DeFi Track + Top 2 Overall (Build Club accelerator). Team: **Stephen Sookra** (frontend, design, pitch) + **Vinh Le** (backend).

---

## Why this exists

99% of intimate partner violence cases involve financial abuse. The CDC estimates the lifetime economic burden at $103,767 per female victim, $3.6 trillion cumulative. The structural barrier to leaving isn't money - it's **unobserved readiness**. Every traditional financial tool (banking app, Cash App, Venmo, prepaid card) creates a transaction trail that an abuser actively monitoring the survivor's device can see. The act of preparation triggers the danger.

SafePassage uses Midnight's selective disclosure to fix one specific gap: a survivor can claim a one-time shelter-issued code, generate a zero-knowledge proof, and route emergency funds directly to a verified service provider's address. The public ledger records the disbursement category (so state crime-victim auditors can verify funds flowed to legitimate aid) but never records the survivor's identity, wallet, or specific destination linkage.

The result: **the abuser watching the blockchain sees a state crime-victim fund pay a medical transport network. He never sees her name, her request, or her location. Money moved without her money ever appearing to move.**

## Team

**Stephen Sookra** *(frontend, design, pitch)* — CS sophomore in Atlanta, GA. Builds privacy infrastructure for vulnerable populations using zero-knowledge proofs, confidential token standards, and trusted-execution environments. SafePassage is a roadmap toward **SafeReturn** *(future)* — post-exit financial recovery for survivors rebuilding credit and savings.

**Vinh Le** *(backend)* — Compact contract, CLI, Midnight.js provider wiring.

## Architecture

**Stack:** Vite + React 18 + TypeScript strict | @react-three/fiber + @react-three/drei | GSAP + Framer Motion | Tailwind CSS | Compact (Midnight, pragma 0.22) | Midnight.js 4.0.4 | Lace 2.0.x | Apache-2.0

### Three workspaces

- `contract/` — one Compact contract (`safepassage.compact`) with five circuits: `fundPool`, `registerCode`, `revokeCode`, `setServiceRoute`, `claimSafePassage`. Nullifier set + commitment registry + category routing. Witness-vs-ledger split: survivor's raw shelter code never touches the public ledger.
- `cli/` — TypeScript yargs CLI with five commands: `deploy`, `fund-pool`, `register-code`, `claim`, `query-ledger`. Pre-hashes shelter codes to `Bytes<32>` in TS layer before passing to Compact circuits. Connects to Midnight proof server (Docker, port 6300) and indexer (GraphQL).
- `frontend/` — Cinematic landing page (R3F shield orb + GSAP scroll-driven camera + Framer Motion entrance animations + liquid-glass UI). Functional LiveDemo split-screen wires to deployed contract via Lace wallet.

### Why Midnight (and not Aleo / Aztec / FHE)

Three privacy stacks could have hosted SafePassage in principle. Midnight wins for one structural reason: **selective disclosure is its product positioning, not just its primitive.**

- **Aleo (snarkVM)** is a general-purpose ZK execution layer with a Leo DSL similar to Compact. It treats privacy as a compute property, not as an institutional compliance posture. SafePassage's regulatory defense ("auditable for the state, invisible to the abuser") needs a chain whose own messaging supports that framing. Aleo's doesn't yet.
- **Aztec Network** focuses on private DeFi composability (pools, bridges, AMMs). The Aztec narrative is privacy for finance, not privacy for vulnerable populations. A grant-funded survivor-aid pool on Aztec would read as "stealth Uniswap fork" to a Build Club reviewer.
- **FHE (Zama, Fhenix)** is genuinely promising for the long term but the proof-server tooling, indexer ergonomics, and wallet integration story aren't yet at hackathon-mainnet maturity. Midnight just hit mainnet; FHE chains have not.

Midnight specifically enables: (1) public-ledger nullifier sets that prove "this disbursement happened" without proving who claimed it; (2) witness-vs-ledger separation that lets shelter operators audit pool flows while keeping survivor codes off-chain; (3) DApp-specific public keys that prevent linkability between the survivor's claim wallet and any other on-chain activity. Those three primitives **are** the SafePassage protocol.

### Threat model

See [`docs/threat-model.md`](docs/threat-model.md). Four adversary tiers (curious chain observer, UI-bound abuser, sophisticated chain analyst, regulator). What's protected, what leaks, what's deferred to v2. The UI-bound abuser is the primary threat - v1 mitigation is an advocate-mediated desktop flow; mobile-native is a tracked v2 dependency on Lace Mobile.

### DUST sponsoring

See [`docs/dust-sponsoring.md`](docs/dust-sponsoring.md). v1 uses advocate-paid DUST (shelter advocate signs the claim transaction on behalf of survivor). v2 design uses a sponsored-transaction relayer service operated per-shelter. The survivor never holds DUST in either version.

## Sookra Methodology

This project was developed using a five-pillar hackathon framework that emphasizes specific people with specific problems, structural gaps no existing consumer tool addresses, sourced human-scale statistics, technology as the inevitable answer, and concrete business numbers.

**Pillar 1 - Real problem, specific people.** IPV survivor with 11 minutes alone, every financial tool watched. Validator receipts from USENIX Security 2023, Cornell Tech CETA (Diana Freed), NNEDV Safety Net (Erica Olsen) - see [`docs/validator-receipts.md`](docs/validator-receipts.md). Live outreach to NNEDV / CETA / PADV sent on build day - see [`research/outreach/sent-emails.md`](research/outreach/sent-emails.md).

**Pillar 2 - The structural gap.** Transparent blockchains fail because wallet activity is public. Centralized apps fail because the abuser controls the device. Selective disclosure is structurally required - not a privacy upgrade.

**Pillar 3 - Statistics that tell the human story.** 99% of IPV cases involve financial abuse (NNEDV). $103,767 lifetime burden per victim (CDC). 1 in 4 women experience severe IPV in lifetime (CDC NISVS).

**Pillar 4 - Technology as the inevitable answer.** The protocol literally cannot exist on a transparent chain. The demo proves what selective disclosure makes possible.

**Pillar 5 - Business numbers.** Privacy infrastructure for vulnerable populations is a multi-billion-dollar gap. Year 1 underwritten by FVPSA Title IV-A discretionary funding plus private foundation co-funding (Allstate Foundation, Avon Foundation, Mary Kay Ash Foundation have historical precedent funding DV-tech infrastructure). Sustained by yield-on-pooled-capital and B2B SaaS to state coalitions post-Build-Club.

## Verify yourself

Once the contract is deployed (Preprod or mainnet — endpoint differs):

```bash
# Replace <CONTRACT_ADDRESS> with the value from deployment/deploy-output.json
# Preprod indexer:
INDEXER=https://indexer.testnet-02.midnight.network/api/v1/graphql
# Mainnet indexer (when deployed):
# INDEXER=https://indexer.mainnet.midnight.network/api/v1/graphql

curl -X POST "$INDEXER" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { contractState(contractAddress: \"<CONTRACT_ADDRESS>\") { ledger { poolBalance nullifiers { length } codeCommitments { length } } } }"}'
```

Expected output: pool balance, nullifier set size, code commitment registry size. No survivor identity. No raw codes. Selective disclosure verifiable on-chain.

## Getting started

```bash
# 1. Clone
git clone https://github.com/StephenSook/SafePassage.git
cd SafePassage

# 2. Pre-flight (see plan for full Hour-0 playbook)
nvm use 22
docker pull midnightntwrk/proof-server:8.0.3
docker run -d -p 6300:6300 --name midnight-proof midnightntwrk/proof-server:8.0.3

# 3. Compile contract
cd contract && npm install && npm run compact

# 4. Run CLI
cd ../cli && npm install
npx tsx src/cli.ts deploy
npx tsx src/cli.ts fund-pool 1000
npx tsx src/cli.ts register-code "PADV-DEMO-001" TRANSPORT 50
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25       # success
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25       # FAILS: nullifier already used
npx tsx src/cli.ts query-ledger

# 5. Run frontend
cd ../frontend && npm install && npm run dev
```

## Roadmap

- **v1 (this hackathon):** Single Compact contract on Midnight (Preprod prize-eligible, mainnet stretch). CLI + cinematic frontend. Advocate-mediated desktop flow.
- **v2 (post-Build-Club):** Sponsored-transaction relayer service per shelter. Multisig admin governance. Mobile-native ZK proving on Lace Mobile (tracked dependency).
- **SafeReturn (next thesis layer):** Post-exit financial recovery for survivors rebuilding credit and savings. Privacy-preserving credit history bootstrap, employment-income proofs, child-support disbursement.

## License

Apache-2.0. See [LICENSE](LICENSE).

## Acknowledgments

Built during the MLH Midnight Hackathon, May 15-17 2026, by Stephen Sookra (frontend, design, pitch) and Vinh Le (backend). References against [`midnightntwrk/example-zkloan`](https://github.com/midnightntwrk/example-zkloan) (canonical Compact + witness-vs-ledger pattern source). IPV-tech threat modeling grounded in NNEDV Safety Net Project, Cornell Tech Clinic to End Tech Abuse (Diana Freed et al.), and USENIX Security 2023 audit of financial-app UI-bound adversaries.

## Judging criteria mapping

How this project addresses each of the 6 official Midnight Hackathon judging criteria:

| Criterion | Where it lives |
|---|---|
| **Technology** | `contract/src/safepassage.compact` — 5 circuits including a ZK nullifier-set replay-rejection primitive. Witness-vs-ledger separation. Compact pragma 0.22 + Midnight.js 4.0.4. |
| **Originality** | Privacy as a survivor-safety primitive, not a finance feature. Selective disclosure used to satisfy state-auditor compliance while denying signal to an active threat actor. No comparable submission in the DeFi track space. |
| **Execution** | Three.js + GSAP + Framer-Motion cinematic landing page. Functional LiveDemo split-screen mirroring real public-ledger state. CLI fallback with replay-rejection killshot pre-recorded. |
| **Completion** | End-to-end demo flow works on Preprod: fund pool → register code → claim → ledger updates → second-claim rejected. Mainnet deployment as stretch. |
| **Documentation** | This README + `docs/threat-model.md` + `docs/dust-sponsoring.md` + `docs/murder-board-qa.md` + `docs/validator-receipts.md` + `docs/architecture-decisions.md`. Cold-readable in 5 minutes. |
| **Business Value** | Multi-billion-dollar gap in privacy infrastructure for vulnerable populations. FVPSA Title IV-A + private foundation co-funding path. B2B SaaS to state coalitions post-Build-Club. Full thesis in the BuildClubCTA section of the landing page. |

Contact: [stephensookra@gmail.com](mailto:stephensookra@gmail.com) | [stephensookra.com](https://stephensookra.com)
