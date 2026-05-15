# SafePassage CLI Demo Script (Hour-30 Fallback Insurance)

**Purpose:** If the cinematic frontend breaks on Sunday morning, this CLI walkthrough becomes the primary demo. Pre-recorded as `demo/safepassage-cli-fallback.mov`. Worth recording even if the frontend works.

**Why this still wins the DeFi track:** The contract correctness + replay rejection + mathematical verifiability are the actual judging criteria for the DeFi track. The frontend is bonus. A working CLI demo proves the core technology.

## Script (read verbatim while recording)

### Setup (off-screen, before recording)

```bash
docker run --rm -d -p 6300:6300 --name midnight-proof midnightntwrk/proof-server:8.0.3
cd ~/Desktop/SafePassage/cli
```

### 0:00 - 0:10 (Frame the demo)

"This is SafePassage on Midnight mainnet. I'll show you the full claim lifecycle in 90 seconds, then prove that double-claims are mathematically rejected. No frontend, just the protocol."

### 0:10 - 0:30 (Show the funded pool + registered codes)

```bash
npx tsx src/cli.ts query-ledger
```

"The pool holds 1000 tokens. One code is pre-registered for a transport disbursement of up to 50 tokens. Nothing about the survivor is on the ledger. Watch the nullifier set go from zero to one."

### 0:30 - 0:55 (Submit a claim)

```bash
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25
```

"The CLI hashes the shelter code to a digest in TypeScript, generates a ZK proof on the local proof server, submits to mainnet. The contract validates the commitment is registered, the category matches, the amount is under cap, and the nullifier hasn't been used. Pool balance ticks down. Nullifier consumed."

### 0:55 - 1:10 (Show the public ledger state)

```bash
npx tsx src/cli.ts query-ledger
```

"Pool is now 975. Nullifier set has one entry. Nothing identifies the survivor. Category bucket: TRANSPORT. That's it. The state crime-victim auditor can verify total flows by category. The abuser sees one anonymous transaction to a verified medical transport network."

### 1:10 - 1:30 (THE KILL SHOT - replay rejection)

```bash
npx tsx src/cli.ts claim "PADV-DEMO-001" TRANSPORT 25
```

"Same code, second attempt. Watch."

[Expected output: ERROR: 1010 Invalid Transaction (claim: nullifier already used)]

"The nullifier is hash(codeDigest, issuerSalt). It's deterministic for a given code. The second claim recomputes the same nullifier, hits the public ledger's used-set, and fails. This is mathematically enforced by the ZK circuit. No replay attack possible. No off-chain trust required."

### 1:30 - 1:35 (Close)

"Money moved. Identity stayed. SafePassage is live on Midnight mainnet. GitHub link in the README."

## Recording notes

- Use QuickTime or OBS at 1080p.
- Terminal font 16pt minimum so the text is readable at video scale.
- Use a clean terminal theme (dark background, readable colors).
- Resize terminal to ~120 cols wide for comfortable reading.
- Hide your personal username if it appears in the prompt (use `PS1='> '` for the recording session).
- Save to `demo/safepassage-cli-fallback.mov`. File is gitignored (size).
- Upload to YouTube unlisted as backup link.
