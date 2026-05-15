# SafePassage Pitch Script - 2 Minutes

**Required MLH opening line.** Required Build Club close. Use Q24-locked technically-defensible language for destination privacy (no overclaims).

## Full script (read verbatim)

### 0:00 - 0:15 (Hook + harm)

"Hey, I'm Stephen, and this is my demo for the Midnight Hackathon.

Meet someone with eleven minutes alone each day. For an intimate partner violence survivor, every financial tool she touches leaves a digital trail her abuser monitors. The moment she prepares to leave, he knows."

### 0:15 - 0:30 (The gap)

"Existing systems fail because they assume financial access is the goal. She doesn't need a wallet. She needs unobserved readiness. She needs a Lyft to a shelter or a rent deposit without any personal on-chain footprint her abuser can find."

### 0:30 - 1:30 (Live demo)

"Let me show you SafePassage.

I open the app, enter a one-time code securely issued by my shelter, select transportation, and request twenty-five dollars.

There is no personal wallet connected. Watch the public ledger."

[Screen shows Midnight explorer]

"The ledger sees a blinded claim and a categorical payout to a verified service provider. No name. No personal balance. No transaction history tied to her identity.

Now look back at the app."

[App updates: Lyft Dispatched]

"The Lyft arrives at a verified shelter address. The abuser watching the blockchain sees a state fund pay a medical transport network, but money moved without her money ever appearing to move."

### 1:30 - 2:00 (Inevitability + Build Club close)

"This is only possible on Midnight. Witness state hides her request. ZK circuits verify her eligibility without revealing her data. The ledger prevents any AI or observer from modeling the frequency of transfers to a domestic violence shelter.

SafePassage isn't a charity project. It is B2B compliance infrastructure for state coalitions, automating federal grant audits while protecting survivors.

We are capturing a multi-billion-dollar flow of emergency aid. This is part two of a three-part founder thesis on financial-abuse defense. With an invitation to the Build Club, we are ready to make this the interoperable standard for vulnerable-population disbursements.

Thank you."

## Q24 technical accuracy notes

These three sentences are TRUE under the v1 architecture (sendUnshielded to verified service addresses; survivor wallet never used):

1. "Blinded claim to a verified service provider, no link back to her identity."
2. "Abuser watching the blockchain sees a state fund pay a medical transport network."
3. "Money moved without her money ever appearing to move."

These would be LIES under v1 and must NEVER be said:

- "The abuser sees nothing." (Wrong - he sees a transaction; he just can't trace it to her.)
- "No destination on chain." (Wrong - sendUnshielded reveals the verified service address.)
- "No transaction history." (Wrong - the contract DOES have public history; it just isn't tied to her identity.)

## Closing variations (use one)

- "Build Club, let's talk."
- "Build Club, please email me."
- "Build Club, I'm ready when you are."

## Rehearsal checklist

- [ ] Practice three times start to finish
- [ ] Confirm runtime <= 120 seconds
- [ ] Confirm no persona names appear on screen during recording
- [ ] Confirm Lace demo wallet (fresh seed) used, not personal wallet
- [ ] Confirm mainnet contract address visible at end-card
