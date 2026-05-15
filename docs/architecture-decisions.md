# SafePassage — Architecture & Build Decisions

Living log of decisions made during the 46h MLH Midnight build. Each entry is
dated; reversed decisions are struck through, not deleted.

---

## 2026-05-15 — Remote container vs. Mac dev environment

Two distinct environments are in play during this build:

- **Remote container (this session):** Linux x86_64, Node 22, Docker available
  but Docker Hub *anonymous* pull rate limit blocks `proof-server:8.0.3` here.
  No Midnight `compact` devtool is packaged for a headless Linux install
  path. **Therefore: this container is for source authoring, git history,
  and any test that doesn't need the Midnight runtime.** Source code lands
  here, compilation + proof generation happens on the Mac.
- **Local Mac (yours):** Authoritative environment for `compact compile`,
  `docker run midnightntwrk/proof-server`, Lace wallet flows, mainnet deploy,
  and demo recording. **The Hour-2 kill switch is verified there**, not here.

Reference contract source-of-truth lives at `/tmp/example-zkloan` in this
container (cloned `midnightntwrk/example-zkloan` at depth 1, 2026-05-15).
Re-clone on your Mac before starting Phase 1.

## 2026-05-15 — Phase 0 environment

- **Dev environment is Linux x86_64** (remote container, Node 22, Docker
  available). Demo + Lace wallet flow run on macOS. Mac M-series compatibility
  risk from the original plan is therefore deferred to Phase 5 only.
- **Toolchain pins (locked from live example-zkloan README, 2026-05-15):**
  - `@midnight-ntwrk/ledger-v8@8.0.3`
  - `@midnight-ntwrk/compact-runtime@0.15.0`
  - `@midnight-ntwrk/compact-js@2.5.0`
  - `@midnight-ntwrk/midnight-js-*@4.0.4`
  - `@midnight-ntwrk/dapp-connector-api@4.0.1`
  - `@midnight-ntwrk/wallet-sdk-facade` / `dust-wallet` / `hd` `@3.0.0`
  - `@midnight-ntwrk/wallet-sdk-shielded` / `unshielded-wallet` `@2.1.0`
  - Compact toolchain `compact compile` version **0.30.0** (via the `compact`
    devtool — NOT `compactc` via Nix as original plan claimed)
  - Compact language pragma **0.22** (NOT 0.14 as plan claimed — would not
    compile)
  - Proof server image `midnightntwrk/proof-server:8.0.3`
  - Indexer image `midnightntwrk/indexer-standalone:4.0.1`
  - Node image `midnightntwrk/midnight-node:0.22.3`

  Q20 reconnaissance was wrong on at least 4 of these. The original plan
  inherited some of those errors. Live `example-zkloan` README is the source
  of truth.
- **Repo layout:** research PDFs live in `research/` (out of root). Generated
  Compact artifacts (`contract/src/managed/`) are gitignored — regenerable
  from source. Demo recordings are gitignored (hosted externally).

---

## Tightened kill switches (supersedes plan table)

| Hour | Trigger | Pivot |
|---|---|---|
| 2  | Proof server won't boot, OR `compactc` not invocable | Abort SafePassage → Gaming Track pivot |
| **4**  | `safepassage.compact` doesn't compile after first witness+ledger pass | Strip to bare claim circuit only — no revoke, no setServiceRoute, no category caps |
| 10 | CLI claim flow doesn't execute end-to-end on Preprod | Cancel cinematic frontend, ship CLI-only demo |
| **18** | GSAP ScrollTrigger camera not stable in R3F | Downgrade Three.js scope (see "Three.js downgrade plan") |
| 30 | Frontend broken | Final demo = pre-recorded CLI fallback + static landing |
| 36 | Pitch video not recorded | Record voiceover-only over OBS desktop capture of CLI — do not lose Devpost over video |
| 42 | Mainnet deploy fails | Submit with Preprod deployment + README note; notify MLH organizer |

Changes vs. original plan: Hour 6 → **Hour 4** (toolchain mismatch won't fix
itself in 2 more hours), Hour 22 → **Hour 18** (sunk-cost trap), added Hour 36
pitch-video gate.

---

## Compact patterns — corrected from live example-zkloan (2026-05-15)

The original plan's Compact snippets had several errors that would have
blocked compilation. Patterns below are verbatim from
`/tmp/example-zkloan/contract/src/zkloan-credit-scorer.compact`:

1. **Pragma is `pragma language_version 0.22;`** (plan said 0.14 — wrong).
2. **Admin pattern: do NOT use `localSk()` witness.** Use the built-in
   `ownPublicKey()` and store `ledger admin: ZswapCoinPublicKey`. Guard with
   `assert(ownPublicKey() == admin, "Only admin can ...");`. Much cleaner
   than the plan's hashed-secret-key pattern.
3. **Hash signature is `persistentHash<T>(value)` single-arg with type
   parameter.** To combine multiple values, use
   `persistentHash<Vector<N, T>>([a, b, ...])`. The plan's
   `persistentHash<Bytes<32>>(digest, salt)` two-arg form does not exist —
   needs to be `persistentHash<Vector<2, Bytes<32>>>([digest, salt])`.
4. **`transientHash<T>(value)`** exists alongside `persistentHash` — used for
   in-circuit hashing that doesn't need to be reproducible off-chain.
5. **`disclose(value)`** wraps witness-derived values when they need to be
   published into ledger state or used in assertions on public state.
6. **`Map.lookup(k)` returns the value directly** (after `.member(k)` guard);
   does NOT return an Option. Nested `Map.lookup(k1).lookup(k2)` and
   `Map.lookup(k1).insert(k2, v)` work for `Map<K1, Map<K2, V>>`.
7. **`default<T>`** for default values when inserting into Maps.
8. **No `Counter` needed for `poolBalance`.** Just declare
   `ledger poolBalance: Uint<64>;` and assign with arithmetic
   (`poolBalance = poolBalance + amount;`). Verify on first compile pass.
9. **`Set.insert / .member / .remove`** all available.
10. **`Uint<16>` is the standard width** used throughout the reference repo;
    `Uint<64>` for pool amounts should still work but we may need `Uint<32>`
    if 64 hits a circuit-size ceiling.

Nullifier-replay pattern for SafePassage claim circuit:

```compact
const nullifier = persistentHash<Vector<2, Bytes<32>>>([codeDigest, issuerSalt]);
assert(!nullifiers.member(nullifier), "claim: nullifier already used");
nullifiers.insert(nullifier);
```

Frontend toolchain still to verify at Phase 3 start:
- `@midnight-ntwrk/dapp-connector-api@4.0.1` exists on npm — confirmed by
  example-zkloan README dependency table.
- Lace wallet build version compatible with mainnet — re-check at Phase 5.

---

## Three.js downgrade plan (pre-committed)

If Hour 18 gate fires, execute this downgrade — saves ~6–8h, ~80% of the
visual impact survives in a 2-minute demo.

1. Keep static R3F `ShieldOrb` with auto-rotation. Drop scroll-driven camera.
2. Replace `ScrollTrigger` camera moves with Framer Motion `useScroll` +
   `useTransform` on a CSS `transform: scale / translateZ` of the Canvas
   wrapper.
3. Drop `ParticleField`. Replace with CSS radial gradient + SVG noise overlay.
4. Keep liquid-glass utility, navbar, LiveDemo split-screen — these are the
   "win" surfaces, not the 3D.

---

## Sookra Pillar 1 & 5 — substitutes (audit fixes)

- **Pillar 1 (Validator Receipt).** USENIX 2023 + Cornell Tech CETA (Diana
  Freed) + NNEDV Safety Net (Erica Olsen) citations stand in for a live
  interview. **Risk:** a DV-practitioner judge will ask "which advocate
  reviewed the threat model?" **Mitigation:** send 3 cold outreach emails on
  build day to NNEDV Safety Net + a local PADV chapter requesting a 15-min
  Sun-morning review. Store the thread (or unanswered emails) in
  `research/outreach/` — proves the attempt was made.
- **Pillar 5 (Business model).** Allstate Purple Purse as a named Year-1
  underwriter is risky — the original Purple Purse branded program wound down
  and the Foundation rebranded. **Switch the pitch language to plural and
  generic:** "FVPSA Title IV-A discretionary funding plus private foundation
  co-funding (Allstate Foundation, Avon Foundation, Mary Kay Ash Foundation
  all have historical precedent funding DV-tech infrastructure)." Survives
  fact-check; still institutionally credible.

---

## No-personas rule — enforcement details

- Hero copy, feature sections, LiveDemo form, README hero, screenshots:
  **zero persona names** ("Tanya", "Marcus", "Maria" forbidden as rendered
  text).
- LiveDemo form placeholders use generic synthetic IDs:
  `placeholder="PADV-XXXX-###"` for the claim code, `placeholder="25"` for
  amount. No "e.g. Tanya's code" anywhere.
- Pitch video voiceover (`demo/safepassage-pitch-2min.mov`) uses the "Imagine
  Tanya..." framing — **audio only, never an on-screen lower-third**.
- Indexer view in LiveDemo will show real tx hashes; use a fresh seed for the
  demo wallet so those hashes don't decode to anything that identifies the
  builder on mainnet.

---

## Minimum-viable-submission floor (new — was missing from plan)

If everything else fails by Hour 44, this is what still ships and still wins
a Devpost slot:

1. Working CLI on Preview/Preprod (Phase 2 deliverable).
2. Static one-page landing (Phase 3 baseline; no 3D, no scroll cinema).
3. 90s screen-recorded CLI demo (`demo/safepassage-cli-fallback.mov`).
4. Devpost form filled, mainnet deploy attempted but not required.

The cinematic frontend (Phase 3.2+) and mainnet deploy (Phase 5) are
**upside**, not preconditions for submission.

---

## 2026-05-15 (late afternoon) — Team composition + mainnet stance updates

**Team:** SafePassage is registered as a 2-person team. Stephen Sookra (lead engineer + design + pitch) plus Vinh (teammate). Vinh does not contribute commits or code. His presence on the team satisfies the MLH Devpost rule that prize eligibility requires teams of 2-5 members. Confirmed by Oscar (MLH) in the Midnight Hackathon Discord 2026-05-15: "You can participate solo, but you are only eligible for prizes in a team of 2-5 people."

**Mainnet stance:** Phase 5 mainnet deploy is now OPTIONAL for prize eligibility. Jay Albert (Midnight Foundation team) in Discord 2026-05-15: "Mainnet not required. If you plan to deploy to the network, focus on preprod." Decision: pursue mainnet anyway as a stretch goal, since it strengthens the project against the Technology + Completion + Business Value judging dimensions. Hour-42 kill switch is RELAXED — if mainnet fails, submit with Preprod + README note. Mainnet is no longer a project-destroying failure mode.

**Official judging criteria:** Locked from Devpost 2026-05-15. Six dimensions:
1. Technology — technical impressiveness, problem difficulty, clever technique
2. Originality — fresh/bold concept, unique privacy/identity/security angle
3. Execution — polish in core functionality + UI
4. Completion — demonstrably complete in focused scope
5. Documentation — README clarity, goal communication, run instructions
6. Business Value — real-world product viability

README updated to map each repo asset to one criterion at the bottom of the file.

---

## Missing pieces flagged for Build Club cold-read (deferred to Phase 4)

- `docs/threat-model.md` — adversary model, what leaks, what's protected.
  One page beats nothing.
- README paragraph: "Why Midnight, not Aleo / Aztec / FHE."
- README paragraph: founder bio + SafeHaven Wells Fargo precedent (top of
  README, first 500 words).
- `LICENSE` file (Apache-2.0).
- `docs/dust-sponsoring.md` — relayer architecture sketch (1 page),
  unimplemented but designed.
- README "Verify yourself" section — curl/indexer command to inspect pool
  balance + nullifier set without trusting the demo.
- `research/outreach/` — copies of the DV-org outreach emails (whether
  answered or not).
