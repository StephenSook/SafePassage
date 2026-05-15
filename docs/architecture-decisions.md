# SafePassage — Architecture & Build Decisions

Living log of decisions made during the 46h MLH Midnight build. Each entry is
dated; reversed decisions are struck through, not deleted.

---

## 2026-05-15 — Phase 0 environment

- **Dev environment is Linux x86_64** (remote container, Node 22, Docker
  available). Demo + Lace wallet flow run on macOS. Mac M-series compatibility
  risk from the original plan is therefore deferred to Phase 5 only.
- **Toolchain pins (locked):** `@midnight-ntwrk/compact-runtime@0.15.0`,
  `@midnight-ntwrk/midnight-js-*@4.0.4`, `@midnight-ntwrk/dapp-connector-api`
  (version verified at install time, not assumed), `compactc` 0.31.0 via Nix,
  proof server `midnightnetwork/proof-server:4.0.0`. Q20 reconnaissance had
  these wrong; live `example-zkloan` repo is the source of truth.
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

## Compact stdlib assumptions to verify in Phase 1 (do not trust the plan)

The original plan's Compact snippets contain at least three patterns that
likely don't compile against `compact-runtime` 0.15.0. Verify against
`example-zkloan/src/*.compact` and the stdlib types file **before** writing
new circuits.

1. **`poolBalance: Counter` is probably wrong.** `Counter` in 0.15.0 typically
   only supports `increment()` with no argument (always +1). For variable
   amounts we need `Cell<Uint<64>>` and explicit read/write. **First thing to
   fix in Phase 1.3.**
2. **`persistentHash<Bytes<32>>(a, b)` two-arg form** likely doesn't exist.
   Standard pattern: concatenate / wrap-in-tuple first, then hash a single
   value. Plan to lose 30–60min iterating here.
3. **`Map.lookup`** may raise on missing key, or may return an `Option` — name
   and semantics vary by stdlib version. Always guard with `.member()` first
   (plan already does this).
4. **`ZswapCoinPublicKey` as `Map` value type** — verify storable, not just
   passable as an argument.
5. **`@midnight-ntwrk/dapp-connector-api@4.0.1`** — verify the version exists
   on npm before Phase 3 frontend work begins.
6. **Lace 2.0.4** — wallet has shipped past 2.x; mainnet flow may require a
   newer build. Re-check at Phase 5.

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
