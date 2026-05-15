# CONSTITUTION - SafePassage

> Per-project non-negotiable principles for AI-assisted development.
> Treat as IMMUTABLE during the 46h build window. Edit only post-event.

**Stack:** Vite + React 18 + TypeScript strict | @react-three/fiber + @react-three/drei | GSAP + Framer Motion | Tailwind CSS | Compact (Midnight) | Midnight.js 4.0.4 | Lace 2.0.x | Apache-2.0
**Build window:** 46h (Fri 2026-05-15 13:45 ET to Sun 2026-05-17 11:45 ET)
**Event:** MLH Midnight Hackathon May 2026 (DeFi Track + Top 2 Overall)

## Scope frame

One user: IPV survivor (abstract on website, voiced over in demo).
One problem: emergency funds cannot reach verified services without observable preparation footprint.
One demo flow: code -> ZK proof -> service payment -> ledger records nullifier + category only -> replay rejected.

**Hard feature cap:** 5 contract circuits, 5 CLI commands, 1 landing page, 1 LiveDemo. Anything beyond = scope creep.

In scope: contract on mainnet, CLI with 5 commands, cinematic frontend, 2-min pitch video, 90s CLI fallback, full doc set, Apache-2.0 LICENSE, Devpost submission.

Out of scope: mobile-native ZK, sponsored-tx relayer service, multi-shelter governance, real service-provider APIs (mocked), front-running protection, KYC of providers, production monitoring, live shelter partner onboarding, SafeReturn implementation.

## Three-tier boundaries

### ALWAYS
- TypeScript strict mode in every workspace
- Compact: pragma 0.22, admin via ownPublicKey(), multi-arg hash via persistentHash<Vector<N,T>>([...]), plain Uint<64> not Counter, return [] at end of every circuit
- Witness inputs (codeDigest, issuerSalt) hashed to Bytes<32> in TS layer before circuit
- Issuer-assigned salts only (user-chosen salts forbidden)
- Map lookups guarded by .member(key) before .lookup(key)
- Compiled artifacts via npm run compact; gitignore contract/src/managed/
- Demo wallet seed phrase stored OFFLINE (paper) only
- Every commit lands as separate atomic GitHub contribution (green-dot policy)
- README hero leads with contract address (Preprod prize-eligible, mainnet stretch) + team credits + tagline
- Section 9 framework used for any README description block

### ASK FIRST
- New runtime dependency (any npm install in any workspace)
- Schema migration on safepassage.compact after first deploy
- Adding 6th contract circuit beyond 5 in scope
- Changing demo flow after Phase 3 Task 3.5 starts
- Pivoting from mainnet to testnet for final submission (must trigger Hour-42 kill switch)
- Adding any payment/email/SMS integration

### NEVER
- Persona names (Tanya, Marcus, Maria) in any rendered string on website, MVP UI, README screenshots, or pitch-video lower-thirds. Voiceover only.
- Secrets in client code. No VITE_* env vars for keys.
- Personal Lace seed used for demo. Fresh seed only.
- disclose() wrapping omitted on witness-derived values flowing into public ledger writes
- Force-push to claude/safepassage-hackathon-HsbSl branch
- Compact runtime upgraded mid-build (locked at 0.15.0)
- Direct npm install without pinning --save-exact for @midnight-ntwrk/* packages
- ScrollTrigger camera moves on R3F Canvas after Hour 18 if not stable
- Counter type used for poolBalance (plain Uint<64> only)

## Performance targets

- Frontend LCP < 2.5s on demo network
- Initial JS bundle < 500 KB gzipped
- R3F scenes: dispose geometries/materials/textures on unmount
- Compact contract circuits compile within 60s on Mac M-series
- Mainnet transaction confirmation < 30s end-to-end

## Security must-haves

- Apache-2.0 LICENSE committed before Phase 5
- No private keys, seed phrases, or .env.local ever committed
- Admin gate via assert(ownPublicKey() == admin, ...) on every admin circuit
- Nullifier replay rejection mandatory and tested
- Service-route registry admin-only (setServiceRoute gated)
- Indexer URL pinned to mainnet in Phase 5 only; testnet for Phases 1-4

## Definition of Done (every Phase passes this)

- All Phase tasks committed individually (green-dot policy)
- No TODO, FIXME, console.log left in demo path
- CI workflow green
- Phase verification commands return expected output
- One ADR appended to docs/architecture-decisions.md
- Kill switch state evaluated

## Demo prep guardrails

- T-4 hr (Hour 42): stop feature work. Bug-fixes + demo polish only.
- T-2 hr (Hour 44): record demo. Backup video locally + YouTube unlisted.
- T-1 hr (Hour 45): lock contract address as canonical demo. No more deploys.
- Pitch deck/video: finalized at T-3 hr (Hour 43). No edits during last 3 hours.

## Decision-deferral rule

If a decision arises not covered above:
1. Pick option that ships fastest with acceptable quality
2. Add deviation to docs/architecture-decisions.md
3. Continue. No mid-build re-litigation.
