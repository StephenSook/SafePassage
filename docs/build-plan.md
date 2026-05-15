# SafePassage — Refined Build Plan (Mac VS Code Edition)

> Authoritative plan for the 46h MLH Midnight Hackathon build. Supersedes the
> Ultraplan that originated this. Every code block here is paste-ready for
> the Mac terminal inside a VS Code session. Rationale and audit history
> live in `docs/architecture-decisions.md`; this file is the executable
> plan.

**Goal.** Ship SafePassage on Midnight mainnet in under 46h. Win DeFi Track
+ Top 2 Overall (Build Club accelerator invitation).

**Method.** Reference `midnightntwrk/example-zkloan` (live as of 2026-05-15)
for every Midnight pattern. Strip loan logic, add nullifier set + category
routing for one-time-code disbursements to verified service addresses.
Cinematic React/Vite frontend; CLI fallback pre-recorded as demo insurance.

---

## Hard-won corrections (read this first)

The original plan's low-level details were wrong in ways that would have
blocked compilation. These are now corrected throughout this document:

| Original plan | Correct |
|---|---|
| `pragma language_version >= 0.14` | `pragma language_version 0.22;` |
| `compactc` via Nix flake | `compact compile` via the `compact` devtool |
| Proof server `4.0.0` | Proof server `8.0.3` |
| Admin gate via `persistentHash(localSk())` | Admin gate via `ownPublicKey() == admin` (no `localSk` witness needed) |
| `persistentHash<Bytes<32>>(a, b)` (two-arg) | `persistentHash<Vector<2, Bytes<32>>>([a, b])` |
| `poolBalance: Counter` with `.increment(amount)` | `ledger poolBalance: Uint<64>;` plain assignment |
| Hour-6 contract kill-switch | **Hour-4** contract kill-switch |
| Hour-22 Three.js kill-switch | **Hour-18** Three.js kill-switch |
| No pitch-video gate | **Hour-36** "if no video, record voiceover-only" |
| Allstate Purple Purse named underwriter | Plural language: "FVPSA Title IV-A + private foundation co-funding" |
| Pillar 1 = citations only | Citations **plus** outreach emails stored in `research/outreach/` |
| (missing) no-personas rule for form placeholders | Placeholders must read `PADV-XXXX-###`, `25` — never `e.g. Tanya's code` |
| (missing) submission floor | CLI + static landing + 90s recording always ships |

---

## Pre-flight checklist (do before Hour 0 on Mac)

Run these on your Mac before kicking off the timer. Items that fail are
true Hour-2 kill-switch triggers.

```bash
# 1. Node 22 + npm 10
nvm install 22 && nvm use 22
node --version   # v22.x
npm --version    # 10.x

# 2. Docker Desktop running + logged into Docker Hub (avoid anonymous rate limits)
docker info | head -5
docker login    # one-time

# 3. Pull the pinned proof server image. THIS IS THE HOUR-2 KILL SWITCH.
docker pull midnightntwrk/proof-server:8.0.3
docker run --rm -d -p 6300:6300 --name midnight-proof midnightntwrk/proof-server:8.0.3
sleep 5
curl -s http://localhost:6300/health   # expect a 200 or JSON OK
docker logs midnight-proof | tail -20  # sanity check

# 4. Compact toolchain. Follow https://docs.midnight.network/develop/tutorial/building/prereqs
#    (the install command is gated by Cloudflare from non-browser clients).
#    After install:
compact compile --version   # expect 0.30.0
compact update              # only if behind

# 5. Lace wallet — install from Chrome Web Store, latest version (NOT 2.0.4).
#    Create a fresh seed for the demo wallet. Save the seed phrase somewhere
#    safe and OFFLINE. This wallet will hold mainnet DUST and must not be
#    your personal wallet.

# 6. Re-clone the source-of-truth reference repo
cd ~/Desktop  # or wherever you keep code
git clone https://github.com/midnightntwrk/example-zkloan.git
cat example-zkloan/contract/src/zkloan-credit-scorer.compact | head -50

# 7. CEX with funded fiat for buying ~5 NIGHT (mainnet DUST source).
#    If you don't have one with completed KYC, start this NOW — KYC can take
#    12-48h and the Phase 5 mainnet deploy depends on it.
```

If **any** of steps 3, 4, or 7 fails, you are at the Hour-2 kill switch.
Pivot to Gaming Track.

---

## Repo state at Hour 0 (already done in this remote session)

The `claude/safepassage-hackathon-HsbSl` branch on
`StephenSook/SafePassage` already contains:

```
SafePassage/
├── .gitignore                       # node_modules, managed/, *.mov, deploy outputs
├── .nvmrc                           # 22
├── research/                        # 8 PDFs + 2 source MDs (out of root)
├── docs/
│   ├── architecture-decisions.md    # audit log + rationale
│   └── build-plan.md                # this file
└── (contract/, cli/, frontend/, demo/, deployment/ scaffolded empty)
```

On Mac, sync first:

```bash
cd ~/Desktop/SafePassage  # or wherever your local clone lives
git fetch origin
git checkout claude/safepassage-hackathon-HsbSl
git pull origin claude/safepassage-hackathon-HsbSl
```

---

## Phase 1 — Compact Contract (Hour 2 → Hour 10)

**Goal:** Deployed `safepassage.compact` with `fundPool`, `registerCode`,
`revokeCode`, `setServiceRoute`, `claimSafePassage`, and nullifier replay
rejection — compiling cleanly against pragma 0.22 and runtime 0.15.0.

### Task 1.1 — Scaffold `contract/` from example-zkloan

```bash
cd ~/Desktop/SafePassage
cp -r /tmp/example-zkloan/contract/* contract/   # or your local clone path
cd contract
rm src/zkloan-credit-scorer.compact src/schnorr.compact
rm -rf src/managed   # gitignored anyway
```

Rewrite `contract/package.json`:

```json
{
  "name": "@safepassage/contract",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./managed/safepassage/contract": {
      "types": "./dist/managed/safepassage/contract/index.d.ts",
      "import": "./dist/managed/safepassage/contract/index.js",
      "default": "./dist/managed/safepassage/contract/index.js"
    }
  },
  "scripts": {
    "compact": "compact compile src/safepassage.compact src/managed/safepassage",
    "test": "vitest run",
    "test:compile": "npm run compact && vitest run",
    "build": "rm -rf dist && tsc --project tsconfig.build.json && cp -Rf ./src/managed ./dist/managed && cp ./src/safepassage.compact ./dist",
    "lint": "eslint src",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

Run `npm install` in `contract/`. Commit:

```bash
git add contract/
git commit -m "feat(contract): scaffold workspace from example-zkloan"
```

### Task 1.2 — Write `safepassage.compact` (corrected patterns)

`contract/src/safepassage.compact`:

```compact
pragma language_version 0.22;
import CompactStandardLibrary;

// ---- Types ----
export enum Category { HOUSING, TRANSPORT, LEGAL, PRESCRIPTION }

// ---- Public ledger state ----
export ledger admin: ZswapCoinPublicKey;
export ledger codeCommitments: Set<Bytes<32>>;
export ledger revokedCommitments: Set<Bytes<32>>;
export ledger nullifiers: Set<Bytes<32>>;
export ledger codeCategory: Map<Bytes<32>, Category>;
export ledger codeCap: Map<Bytes<32>, Uint<64>>;
export ledger serviceRoutes: Map<Category, ZswapCoinPublicKey>;
export ledger poolBalance: Uint<64>;

// ---- Witnesses (private inputs supplied off-chain) ----
witness codeDigest(): Bytes<32>;
witness issuerSalt(): Bytes<32>;

constructor() {
    admin = ownPublicKey();
    poolBalance = 0;
}

export circuit getAdmin(): ZswapCoinPublicKey { return admin; }

// ---- Admin circuits ----
export circuit fundPool(amount: Uint<64>): [] {
    assert(ownPublicKey() == admin, "fundPool: only admin");
    poolBalance = poolBalance + amount;
    return [];
}

export circuit registerCode(commitment: Bytes<32>, category: Category, cap: Uint<64>): [] {
    assert(ownPublicKey() == admin, "registerCode: only admin");
    assert(!codeCommitments.member(commitment), "registerCode: already registered");
    codeCommitments.insert(commitment);
    codeCategory.insert(commitment, category);
    codeCap.insert(commitment, cap);
    return [];
}

export circuit revokeCode(commitment: Bytes<32>): [] {
    assert(ownPublicKey() == admin, "revokeCode: only admin");
    assert(codeCommitments.member(commitment), "revokeCode: not registered");
    revokedCommitments.insert(commitment);
    return [];
}

export circuit setServiceRoute(category: Category, route: ZswapCoinPublicKey): [] {
    assert(ownPublicKey() == admin, "setServiceRoute: only admin");
    serviceRoutes.insert(category, route);
    return [];
}

// ---- Survivor claim circuit (the killer feature) ----
export circuit claimSafePassage(category: Category, amount: Uint<64>): [] {
    const digest = codeDigest();
    const salt = issuerSalt();

    const commitment = persistentHash<Bytes<32>>(digest);
    assert(codeCommitments.member(commitment), "claim: invalid code");
    assert(!revokedCommitments.member(commitment), "claim: code revoked");
    assert(codeCategory.lookup(commitment) == category, "claim: wrong category");
    assert(amount <= codeCap.lookup(commitment), "claim: over cap");

    const nullifier = persistentHash<Vector<2, Bytes<32>>>([digest, salt]);
    assert(!nullifiers.member(nullifier), "claim: nullifier already used");
    nullifiers.insert(nullifier);

    assert(poolBalance >= amount, "claim: pool empty");
    poolBalance = poolBalance - amount;

    assert(serviceRoutes.member(category), "claim: no route for category");
    return [];
}
```

**Notes vs. original plan:**
- `pragma language_version 0.22;` — not `>= 0.14`.
- `admin: ZswapCoinPublicKey` initialized from `ownPublicKey()` — matches
  example-zkloan exactly. No `localSk()` witness needed; no separate hash.
- `persistentHash<Bytes<32>>(digest)` is single-arg; multi-input
  (`digest, salt` for the nullifier) goes through `Vector<2, Bytes<32>>`.
- `poolBalance` is a plain `Uint<64>` ledger field. Arithmetic uses normal
  operators — no `Counter`, no `.increment()`.
- All circuits end with `return [];` — example-zkloan convention.
- `disclose(...)` may be needed on `commitment`, `category`, `amount` if the
  compiler complains about witness-derived values flowing into public state.
  First-pass without; add as compiler directs.

Compile and commit:

```bash
cd contract
npm run compact
git add src/safepassage.compact
git commit -m "feat(contract): compiling SafePassage circuit with nullifier replay protection"
```

If this fails after 60min of iteration, the **Hour-4 kill switch** applies:
strip everything except `claimSafePassage`. Drop `revokeCode`,
`setServiceRoute`, and per-category caps. Keep only the nullifier set.

### Task 1.3 — Write `witnesses.ts`

`contract/src/witnesses.ts`:

```typescript
import { createHash } from 'crypto';
import { type WitnessContext } from '@midnight-ntwrk/compact-runtime';

/**
 * Witnesses for the *admin* deployment + admin-only circuits.
 * Admin identity is established by ownPublicKey() in the contract, so no
 * secret witness is needed for admin gating — the wallet signing the tx
 * IS the admin proof.
 */
export const adminWitnesses = {};

/**
 * Witnesses for the *survivor* claim flow. The survivor supplies:
 *   - codeDigest:  sha256(rawCode) — knowledge of the one-time code
 *   - issuerSalt:  random per-issuance salt — domain-separates the nullifier
 */
export const claimWitnesses = (codeDigest: Buffer, issuerSalt: Buffer) => ({
  codeDigest: (_ctx: WitnessContext<unknown, unknown>) => [codeDigest],
  issuerSalt: (_ctx: WitnessContext<unknown, unknown>) => [issuerSalt],
});

/**
 * Off-chain hashing — the commitment stored on-chain is sha256(sha256(code)).
 * The first sha256 is the codeDigest (private witness); the second is the
 * commitment (public ledger membership check).
 */
export function hashCode(rawCode: string): { digest: Buffer; commitment: Buffer } {
  const digest = createHash('sha256').update(rawCode).digest();
  const commitment = createHash('sha256').update(digest).digest();
  return { digest, commitment };
}

/** Random 32-byte salt for nullifier domain separation. */
export function newIssuerSalt(): Buffer {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('crypto').randomBytes(32);
}
```

```bash
git add src/witnesses.ts
git commit -m "feat(contract): TypeScript witness helpers + off-chain hashing"
```

---

## Phase 2 — CLI + Backup Demo Video (Hour 10 → Hour 14)

### Task 2.1 — Scaffold CLI workspace

```bash
cd ~/Desktop/SafePassage/cli
npm init -y
# Set name in cli/package.json to "@safepassage/cli"

npm install \
  @midnight-ntwrk/compact-runtime@0.15.0 \
  @midnight-ntwrk/ledger-v8@8.0.3 \
  @midnight-ntwrk/compact-js@2.5.0 \
  @midnight-ntwrk/midnight-js-contracts@4.0.4 \
  @midnight-ntwrk/midnight-js-fetch-zswap-network-id@4.0.4 \
  @midnight-ntwrk/midnight-js-http-client-proof-provider@4.0.4 \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.0.4 \
  @midnight-ntwrk/midnight-js-level-private-state-provider@4.0.4 \
  @midnight-ntwrk/midnight-js-node-zk-config-provider@4.0.4 \
  @midnight-ntwrk/midnight-js-types@4.0.4 \
  @midnight-ntwrk/midnight-js-utils@4.0.4 \
  @midnight-ntwrk/wallet-sdk-facade@3.0.0 \
  @midnight-ntwrk/wallet-sdk-hd@3.0.0 \
  fp-ts pino yargs

npm install -D typescript tsx @types/node @types/yargs vitest
```

Commit, then write `cli/src/commons.ts`:

```typescript
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

export const CONFIG = {
  proofServer: process.env.PROOF_SERVER ?? 'http://localhost:6300',
  indexerUri:  process.env.INDEXER_URI  ?? 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWs:   process.env.INDEXER_WS   ?? 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  zkConfigPath: process.env.ZK_CONFIG_PATH ?? '../contract/src/managed/safepassage',
};

export const providers = (privateStateStoreName: string) => ({
  privateStateProvider: levelPrivateStateProvider({ privateStateStoreName }),
  proofProvider:        httpClientProofProvider(CONFIG.proofServer),
  publicDataProvider:   indexerPublicDataProvider(CONFIG.indexerUri, CONFIG.indexerWs),
  zkConfigProvider:     new NodeZkConfigProvider(CONFIG.zkConfigPath),
});
```

> **Verify the testnet indexer URI** against current Midnight docs at the
> moment you run this — the hostname has changed multiple times.

### Task 2.2 — Five CLI scripts (one commit each)

`cli/src/scripts/deploy.ts`:

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '@safepassage/contract/managed/safepassage/contract';
import { adminWitnesses } from '@safepassage/contract/src/witnesses.js';
import { providers } from '../commons.js';
import { writeFileSync } from 'fs';

async function main() {
  const result = await deployContract(providers('safepassage-admin'), {
    contract: new Contract(adminWitnesses),
    privateStateId: 'safepassage-admin',
    initialPrivateState: {},
  });
  console.log(`Deployed: ${result.deployTxData.public.contractAddress}`);
  writeFileSync('../deployment/deploy-output.json', JSON.stringify(result.deployTxData.public, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
```

`cli/src/scripts/fund-pool.ts`, `register-code.ts`, `claim.ts`,
`query-ledger.ts` — pattern-match against example-zkloan's CLI scripts.
**Each script gets its own commit.**

### Task 2.3 — End-to-end CLI dry-run on testnet

```bash
docker run --rm -d -p 6300:6300 --name midnight-proof midnightntwrk/proof-server:8.0.3
cd cli
npx tsx src/cli.ts deploy
npx tsx src/cli.ts fund-pool 1000
npx tsx src/cli.ts register-code "PADV-DEMO-001" TRANSPORT 50
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25   # success
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25   # MUST fail: nullifier replay
npx tsx src/cli.ts query-ledger
```

Record the 90s walkthrough on QuickTime:

```bash
# QuickTime Player → File → New Screen Recording → record terminal at 1080p
# Save as demo/safepassage-cli-fallback.mov
# This is your INSURANCE per Hour-30 kill switch.
```

Commit (recording is gitignored, but log the act):

```bash
git commit --allow-empty -m "demo: CLI fallback walkthrough recorded (demo/safepassage-cli-fallback.mov, hosted externally)"
```

---

## Phase 3 — Cinematic Frontend (Hour 14 → Hour 32)

**Sleep checkpoint: Hour 10–16 (6h).** Frontend starts Sat ~5:45am ET fresh.

### Task 3.1 — Scaffold Vite

```bash
cd ~/Desktop/SafePassage
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install three @react-three/fiber @react-three/drei gsap @gsap/react framer-motion lucide-react
npm install @midnight-ntwrk/dapp-connector-api@4.0.1
npm install -D tailwindcss postcss autoprefixer @types/three @playwright/test
npx tailwindcss init -p
```

Tailwind config (`frontend/tailwind.config.ts`):

```typescript
import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        bg: '#050505',
        accent: '#A4F4FD',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

`frontend/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
@tailwind base; @tailwind components; @tailwind utilities;
body { background:#050505; color:#fff; font-family:'Inter',sans-serif; }
.liquid-glass {
  position: relative;
  background: rgba(255,255,255,0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 9999px;
}
.liquid-glass::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}
```

Commit and move on.

### Task 3.2 — HeroScene + ShieldOrb

`frontend/src/three/ShieldOrb.tsx`:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ShieldOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.15; });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial color="#A4F4FD" metalness={0.85} roughness={0.2} wireframe />
    </mesh>
  );
}
```

`frontend/src/three/ParticleField.tsx` — straightforward 2000-point cloud
in `#A4F4FD` at 0.6 opacity. Standard r3f pattern.

`frontend/src/components/HeroScene.tsx`:

```tsx
import { Canvas } from '@react-three/fiber';
import { ShieldOrb } from '../three/ShieldOrb';
import { ParticleField } from '../three/ParticleField';

export function HeroScene() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <ShieldOrb />
        <ParticleField />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-32 text-center">
        <h1 className="max-w-3xl text-6xl leading-tight">
          Privacy that{' '}
          <span className="font-display italic text-accent">moves money</span>{' '}
          without showing it moved.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Emergency disbursements that route to verified services. No personal
          wallet. No transaction history tied to identity. Mathematically
          auditable for the state. Invisible to bad actors.
        </p>
      </div>
    </section>
  );
}
```

**Hour-18 kill switch:** if GSAP ScrollTrigger + R3F camera handoff isn't
stable by 18:00, execute the **pre-committed downgrade plan**:

1. Delete `ParticleField` import and JSX from `HeroScene`. Add a CSS radial
   gradient + SVG noise behind the Canvas instead.
2. Replace ScrollTrigger camera moves with Framer Motion `useScroll` +
   `useTransform` on a `motion.div` wrapping the Canvas — apply
   `scale` and `translateY` to the wrapper, not the camera.
3. Keep ShieldOrb's auto-rotation. Move on.

This saves 6–8h and looks 80% as good in a 2-min pitch video.

### Task 3.3–3.6 — Navbar, HowItWorks, LiveDemo, TrustSection, Footer

Standard commits, follow the original Ultraplan structure.

**Critical no-personas enforcement in `LiveDemo.tsx`:**

```tsx
<input
  name="code"
  placeholder="PADV-XXXX-###"   // NEVER "e.g. Tanya's code"
/>
<select name="category">
  <option value="TRANSPORT">Transport</option>
  <option value="HOUSING">Housing</option>
  <option value="LEGAL">Legal aid</option>
  <option value="PRESCRIPTION">Prescription</option>
</select>
<input name="amount" placeholder="25" type="number" />
```

The split-screen demo title overlay reads **"Money moved. Identity stayed."**
— never includes a persona name. Indexer hashes shown on the public-ledger
side are real but link to a fresh demo wallet that has no identifying
history.

### Task 3.7 — Playwright E2E

```typescript
import { test, expect } from '@playwright/test';
test('claim flow renders without errors', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText(/Privacy that/i)).toBeVisible();
  await page.click('text=Try Demo');
  await expect(page.getByText(/Claim code/i)).toBeVisible();
  await page.fill('input[name="code"]', 'PADV-DEMO-001');
  await page.selectOption('select[name="category"]', 'TRANSPORT');
  await page.fill('input[name="amount"]', '25');
});
```

---

## Phase 4 — Demo Polish + Pitch Video + Missing-Items Sweep (Hour 32 → Hour 38)

### Task 4.1 — README.md

Must include, in order:

1. **Hero:** mainnet contract address + explorer link + tagline "Money moved.
   Identity stayed." + DeFi Track + Top 2 Overall badges.
2. **Why this exists** (3 sentences): the survivor problem; why on-chain
   privacy is the answer; why Midnight specifically.
3. **Founder bio paragraph** with SafeHaven Wells Fargo 2nd-place precedent.
   This is your strongest single trust signal — top of README, not buried.
4. **Architecture** diagram + Midnight stack pin table.
5. **Why Midnight, not Aleo / Aztec / FHE** (1 paragraph). Build Club will
   ask. Answer it before they have to.
6. **Threat model link** → `docs/threat-model.md`.
7. **Sookra methodology** badge + link to `research/sookra-methodology-v3.3.pdf`.
8. **DUST sponsoring** section linking to `docs/dust-sponsoring.md` (relayer
   architecture sketch — unimplemented but designed).
9. **Verify yourself** section: `curl` against the indexer to inspect pool
   balance and nullifier set size without trusting the demo.
10. **Roadmap:** SafeReturn line. Mobile-native v2 dependency on Lace Mobile.
11. **Validator receipts:** Pillar 1 citations + outreach evidence in
    `research/outreach/`.
12. **Regulatory framing:** FVPSA Title IV-A + private foundation
    co-funding (plural — not Allstate Purple Purse by name).
13. **License:** Apache-2.0.

### Task 4.2 — Docs sweep

Create:

- `docs/threat-model.md` (1 page minimum). Adversary capabilities, what
  leaks, what's protected, statistical-inference attacks, front-running
  resistance.
- `docs/dust-sponsoring.md` (1 page). Sponsored-relayer architecture
  sketch — shelter or pooled service pays DUST on behalf of survivor.
  Unimplemented in 48h, **designed**.
- `docs/pitch-script-2min.md` (Q24 verbatim — voiceover only, no on-screen
  personas).
- `docs/cli-demo-script.md` (Q26 verbatim).
- `docs/murder-board-qa.md` (Q4 top 10 — DUST sponsoring, mobile gap,
  oracle problem, statistical inference, front-running, admin key
  centralization, indexer latency, KYC of service providers,
  destination-privacy honest framing, regulatory ceiling).
- `docs/validator-receipts.md` (USENIX Security 2023 + Cornell Tech CETA
  Diana Freed + NNEDV Safety Net Erica Olsen citations, formatted).
- `research/outreach/` — copies of the cold outreach emails to NNEDV /
  PADV, whether answered or not. **Send these on build day; even unanswered
  threads are evidence-of-attempt.**
- `LICENSE` — Apache-2.0 boilerplate.

### Task 4.3 — Record 2-min pitch video

```bash
# 1. Rehearse docs/pitch-script-2min.md three times
# 2. OBS or QuickTime, 1080p, ≤120 seconds
# 3. Voiceover MAY say "Imagine Tanya, 11 minutes in a bathroom..."
#    Video MUST NOT show that name on screen anywhere.
# 4. Export as demo/safepassage-pitch-2min.mov
# 5. Upload unlisted to YouTube; URL goes in Devpost.
```

**Hour-36 kill switch:** if the cinematic pitch video isn't recorded by
Hour 36, fall back to recording a voiceover over an OBS desktop capture of
the CLI walkthrough. **Do not lose Devpost over a video.**

### Task 4.4 — Sookra Council pressure test

```bash
# Inside Claude Code:
/sookra-council
```

Address any pillar scoring < 7. Commit fixes.

---

## Phase 5 — Mainnet Deploy + Devpost (Hour 38 → Hour 46)

**Sleep checkpoint: Hour 34–40 power nap (4–6h).** Wake Sun ~6am ET.

### Task 5.1 — Mainnet deploy

```bash
# Switch Lace to mainnet, ensure ~5 NIGHT in the demo wallet
# Update cli/src/commons.ts indexer URI to mainnet
docker run --rm -d -p 6300:6300 --name midnight-proof midnightntwrk/proof-server:8.0.3
cd cli
npx tsx src/cli.ts deploy            # → deployment/deploy-output.json
npx tsx src/cli.ts fund-pool 10
npx tsx src/cli.ts register-code "MAINNET-LIVE-001" TRANSPORT 50

# Commit the mainnet deploy output (whitelisted in .gitignore for this one file)
git add -f deployment/deploy-output.json
git commit -m "deploy: SafePassage live on Midnight mainnet"
```

**Hour-42 kill switch:** if mainnet deploy fails for reasons outside your
control (DUST acquisition, node connectivity), submit with the testnet
deployment and add a README note. Notify MLH organizer via Discord.

### Task 5.2 — README polish + mainnet link

Add contract address + explorer URL + screenshot of the deploy confirmation
to the README hero. Commit.

### Task 5.3 — Devpost submission

`https://mlh.link/MidnightDevpost`:

- Title: `SafePassage — Privacy-Preserving Emergency Disbursement on Midnight`
- Tagline: `Money moved. Identity stayed.`
- Built With: Midnight, Compact, Three.js, React, TypeScript
- Tracks: DeFi Track + Top 2 Overall
- Beginner-eligible: No
- Links: public GitHub repo, unlisted YouTube pitch video, mainnet contract
  explorer URL.

### Task 5.4 — Final cleanup + Discord post

Post in Midnight Discord `#mlh-hackers`. Final commit `🚢 submission ready`.

---

## Kill switches (consolidated, final)

| Hour | Trigger | Pivot |
|---|---|---|
| 2  | Proof server won't boot, OR `compact compile --version` ≠ 0.30.0, OR no funded CEX for NIGHT | Abort SafePassage → Gaming Track |
| 4  | `safepassage.compact` won't compile after first witness+ledger pass | Strip to claim circuit only — drop revoke, setServiceRoute, caps |
| 10 | CLI claim flow doesn't execute end-to-end on testnet | Cancel cinematic frontend, ship CLI-only demo |
| 18 | GSAP ScrollTrigger camera not stable in R3F | Execute pre-committed Three.js downgrade plan |
| 30 | Frontend broken | Pre-recorded CLI fallback + static landing |
| 36 | Pitch video not recorded | Voiceover-only over OBS desktop capture of CLI |
| 42 | Mainnet deploy fails | Submit with testnet + README note + Discord notify |

---

## Minimum-viable-submission floor

If all upside fails by Hour 44, this still ships and still wins a Devpost
slot:

1. Working CLI on testnet (Phase 2).
2. Static one-page landing (Phase 3.1 baseline; no 3D).
3. 90s screen-recorded CLI demo (`demo/safepassage-cli-fallback.mov`).
4. Devpost form filled. Mainnet attempted, not required.

**Cinematic frontend and mainnet deploy are upside, not preconditions.**

---

## Build-Club cold-read checklist (Phase 4 sweep)

Every item below must exist in the repo before Devpost submission:

- [ ] `LICENSE` (Apache-2.0)
- [ ] `docs/threat-model.md` — 1 page minimum
- [ ] `docs/dust-sponsoring.md` — relayer sketch
- [ ] README founder bio paragraph (top, includes SafeHaven Wells Fargo)
- [ ] README "Why Midnight, not Aleo/Aztec/FHE" paragraph
- [ ] README "Verify yourself" curl-against-indexer block
- [ ] `research/outreach/` directory with sent-emails evidence
- [ ] Mainnet contract address + explorer link in README hero
- [ ] Pitch video link in README + Devpost
- [ ] Sookra Council pressure test ≥ 7 on every pillar

---

## Compact patterns crib sheet

Cheat sheet ground-truthed from `/tmp/example-zkloan/contract/src/zkloan-credit-scorer.compact` (live as of 2026-05-15).

```compact
// File header
pragma language_version 0.22;
import CompactStandardLibrary;

// Storable ledger types
ledger admin: ZswapCoinPublicKey;
ledger balance: Uint<64>;
ledger members: Set<Bytes<32>>;
ledger mapping: Map<Bytes<32>, Uint<16>>;
ledger nested: Map<Bytes<32>, Map<Uint<16>, MyStruct>>;

// Constructor — runs once at deploy
constructor() {
    admin = ownPublicKey();
}

// Admin gate
assert(ownPublicKey() == admin, "only admin");

// Witness declarations
witness mySecret(): Bytes<32>;
witness multi(): [TypeA, TypeB, Uint<16>];   // tuple-returning witness

// Hashing
const h1 = persistentHash<Bytes<32>>(someBytes);             // single value
const h2 = persistentHash<Vector<2, Bytes<32>>>([a, b]);     // multi-value
const t1 = transientHash<Bytes<32>>(value);                  // in-circuit only

// Map / Set ops
if (!members.member(x)) { members.insert(x); }
const v = mapping.lookup(key);                  // requires .member() guard
nested.lookup(k1).insert(k2, value);
mapping.remove(key);

// Defaulted insert into nested map
if (!nested.member(k1)) {
    nested.insert(k1, default<Map<Uint<16>, MyStruct>>);
}

// Disclose witness-derived values for public state
loans.insert(disclose(pubKey), disclose(loanRecord));

// Return convention
return [];
```

---

## File structure (final)

```
SafePassage/
├── README.md
├── LICENSE                          # Apache-2.0
├── .gitignore
├── .nvmrc
├── research/                        # PDFs out of root
│   ├── *.pdf
│   ├── SafePassage_Section_9.md
│   ├── SafePassage_Source10_ContributorHub.md
│   └── outreach/                    # cold emails to NNEDV/PADV (Pillar 1)
├── docs/
│   ├── architecture-decisions.md    # rationale log
│   ├── build-plan.md                # this file
│   ├── threat-model.md
│   ├── dust-sponsoring.md
│   ├── pitch-script-2min.md
│   ├── cli-demo-script.md
│   ├── murder-board-qa.md
│   ├── validator-receipts.md
│   └── demo-storyboard.md
├── contract/
│   ├── src/
│   │   ├── safepassage.compact
│   │   ├── witnesses.ts
│   │   └── managed/                 # gitignored
│   ├── tests/safepassage.test.ts
│   └── package.json
├── cli/
│   ├── src/{cli,commons,api,helpers}.ts
│   ├── src/scripts/{deploy,fund-pool,register-code,claim,query-ledger}.ts
│   ├── src/mock-services/{lyft,shelter-issuer}.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/{Navbar,HeroScene,HowItWorks,LiveDemo,TrustSection,BuildClubCTA,Footer}.tsx
│   │   ├── three/{ShieldOrb,ParticleField}.tsx
│   │   └── hooks/{useMidnight,useIndexer}.ts
│   ├── tests/claim-flow.spec.ts
│   ├── tailwind.config.ts
│   └── package.json
├── demo/                            # *.mov gitignored
└── deployment/
    └── deploy-output.json           # whitelisted at Phase 5
```

---

## End-of-build verification

1. `npx tsx cli/src/cli.ts query-ledger` returns mainnet pool balance +
   nullifier set with **no identifying info**.
2. `npx tsx cli/src/cli.ts claim PADV-DEMO-001 TRANSPORT 25` succeeds first
   time; fails second with `claim: nullifier already used`.
3. `cd frontend && npm run build && npm run preview` renders cleanly;
   Playwright E2E passes; LiveDemo connects Lace + submits against mainnet.
4. `demo/safepassage-pitch-2min.mov` is ≤120s, opens with the mandatory
   MLH line, closes with the Build Club ask.
5. `/sookra-council` returns ≥ 7 on every pillar.
6. Devpost submission is live; GitHub repo public; mainnet contract address
   verifiable on Midnight explorer.

---

## Hand-off — what's already done in this remote session

- Repo reorganized into the structure above (research/, docs/, empty
  workspace dirs).
- `.gitignore`, `.nvmrc`, `docs/architecture-decisions.md`, this
  `docs/build-plan.md` — all on `claude/safepassage-hackathon-HsbSl`.
- 5 commits pushed to `origin/claude/safepassage-hackathon-HsbSl`.

**Your next move on Mac:**

```bash
cd ~/Desktop/SafePassage   # or wherever your local clone lives
git fetch origin
git checkout claude/safepassage-hackathon-HsbSl
git pull origin claude/safepassage-hackathon-HsbSl
open docs/build-plan.md    # this file — open it in VS Code

# Then run the pre-flight checklist above.
# If everything green, proceed to Phase 1.
```
