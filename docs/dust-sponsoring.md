# DUST Sponsoring - Relayer Architecture Sketch

**Status:** Designed, not implemented in v1. Build Club reviewers will ask "if the survivor has $0 and Midnight requires DUST to submit a transaction, how does she pay the network fee without an abuser-visible funding event?" This document answers that question.

## The problem

Midnight transactions require operational DUST. A survivor escaping financial abuse has $0 of her own. If she has to acquire NIGHT to generate DUST, the act of acquiring crypto creates the very footprint SafePassage exists to prevent. Her wallet receives an inbound transfer. Her bank or Cash App shows the conversion. Her abuser sees it.

## v1 mitigation (advocate-mediated desktop flow)

For v1, the protocol assumes the survivor claim is submitted from a Lace install controlled by a shelter advocate during intake. The advocate wallet pays DUST. The survivor never holds the wallet that submits the claim. The contract witness inputs (codeDigest, issuerSalt) are supplied by the advocate Lace install after the survivor provides the raw code in person or via a secure channel (Signal, encrypted SMS).

## v2 design (sponsored-transaction relayer)

For the next protocol version, SafePassage will operate a relayer service that submits sponsored transactions on behalf of survivors.

### Architecture

```
[Survivor device]
    | enters code over HTTPS to shelter-operated relayer
    v
[Relayer service]
    | constructs transaction with shelter relayer wallet as signer
    | pays DUST from relayer pre-funded NIGHT balance
    | submits to Midnight network
    v
[Midnight chain]
    | nullifier consumed, pool decremented, route payment emitted
    v
[Service provider receives payment]
```

### Key design properties

- **Survivor never holds DUST.** No funding event in her wallet.
- **Relayer is permissioned per shelter.** Each shelter operates one relayer. Admin key sets shelter:relayer permissions on-chain.
- **Relayer cannot drain the pool.** It can only submit valid claims with valid witnesses. The contract gates all spending on the nullifier-set + commitment-set state. Relayer compromise = relayer spam attack on Midnight network, not a SafePassage compromise.
- **DUST flow funded by grant capital.** Shelter annual operating budget includes a NIGHT line-item to pre-fund the relayer (similar to how shelters pre-fund prepaid phones today).

### Attack vectors and mitigations

| Attack | Mitigation |
|---|---|
| Relayer compromise -> submit fake claims | Witness inputs (codeDigest, issuerSalt) signed by admin at registration. Relayer cannot fabricate without admin key. |
| Relayer censorship of legitimate claim | Multiple relayer fallbacks per shelter. Admin key rotates relayer permissions monthly. |
| Network-level deanonymization at relayer endpoint | Relayer served via Tor hidden service. TLS terminated inside shelter network. |
| Coerced disclosure to abuser | Out of scope at protocol layer. Mitigation is policy + advocate training. |

### Why this is not in v1

- 48h hackathon scope: protocol primitive first, relayer service second.
- Relayer service is operational infrastructure, not protocol design.
- Build Club mentorship is the right venue to design + deploy it alongside an initial shelter partner.
