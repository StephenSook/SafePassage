# Outreach Emails - Pillar 1 Evidence Archive

**Build context:** 46h MLH Midnight Hackathon, solo build. Sookra Methodology Pillar 1 (Validator Receipt) requires documented review of the problem and proposed solution architecture by a domain expert. A live interview was not feasible within the 46h window. The substitute is rigorous citation against published research (see `docs/validator-receipts.md`) plus documented cold outreach to authorities in the IPV-tech space requesting Sunday-morning review.

This file archives the three emails sent on build day. Whether or not they receive replies before submission, the documented attempt establishes that SafePassage was designed in consultation with established IPV-tech research, not in isolation.

---

## Email 1 - NNEDV Safety Net Project

**Sent:** 2026-05-15 ~14:00 ET
**To:** safetynet@nnedv.org
**BCC:** stephensookra@gmail.com
**Subject:** Privacy-preserving emergency disbursement research - 15-min review request (Midnight Hackathon Sunday)

```
Hi NNEDV Safety Net team,

I'm Stephen Sookra, a CS sophomore in Atlanta competing solo in the MLH
Midnight Hackathon this weekend (May 15-17). I'm building SafePassage,
a privacy-preserving emergency disbursement protocol that lets IPV
survivors access emergency funds for transport, shelter, and legal aid
without any on-chain footprint an abuser could monitor.

The architecture leans heavily on the threat models published in NNEDV
Safety Net's tech-safety guidelines and the Cornell Tech CETA research
on financial-app UI-bound adversaries. I've cited Erica Olsen's 2025
Tech Summit talk on ephemeral-UI design.

Would anyone on the team have 15 minutes Sunday morning (May 17) for a
quick review call before I submit to Devpost? Even a Slack/email
exchange would dramatically strengthen the project's grounding.

Background: I won 2nd place at the Wells Fargo Global Career
Accelerator last year for SafeHaven, an AI domestic-financial-abuse
detection tool. SafePassage is the next layer.

GitHub (in progress): https://github.com/StephenSook/SafePassage

Thanks for your time and for the work you do.

- Stephen Sookra
Atlanta, GA
stephensookra@gmail.com
```

**Status:** [Awaiting reply / Replied on YYYY-MM-DD / No reply by submission]

---

## Email 2 - Cornell Tech Clinic to End Tech Abuse (CETA)

**Sent:** 2026-05-15 ~14:05 ET
**To:** ipvtechresearch@cornell.edu
**BCC:** stephensookra@gmail.com
**Subject:** SafePassage (Midnight Hackathon) - citing CETA threat model, 15-min review request

```
Hi CETA team,

I'm Stephen Sookra, a CS sophomore in Atlanta competing solo in the MLH
Midnight Hackathon this weekend (May 15-17). I'm building SafePassage,
a privacy-preserving emergency disbursement protocol that lets IPV
survivors access emergency funds without any on-chain footprint an
abuser could monitor.

My adversary model is built directly on Diana Freed et al.'s research
on UI-bound adversaries in consumer financial apps - the threat model
my protocol assumes (Tier 2 in docs/threat-model.md) is essentially the
threat model your team has published.

Would anyone on the team have 15 minutes Sunday morning (May 17) for a
review call before I submit to Devpost? Even an asynchronous review of
my threat model document would be enormously valuable.

Background: I won 2nd place at the Wells Fargo Global Career
Accelerator last year for SafeHaven, an AI domestic-financial-abuse
detection tool. SafePassage is the next layer.

GitHub (in progress): https://github.com/StephenSook/SafePassage
Threat model: https://github.com/StephenSook/SafePassage/blob/main/docs/threat-model.md

Thanks for your work on the IPV-tech research front.

- Stephen Sookra
Atlanta, GA
stephensookra@gmail.com
```

**Status:** [Awaiting reply / Replied on YYYY-MM-DD / No reply by submission]

---

## Email 3 - Partnership Against Domestic Violence (Atlanta)

**Sent:** 2026-05-15 ~14:10 ET
**To:** info@padv.org
**BCC:** stephensookra@gmail.com
**Subject:** Atlanta CS student building privacy-preserving emergency disbursement - Sunday review?

```
Hi PADV team,

I'm Stephen Sookra, a CS sophomore here in Atlanta. I'm competing solo
in the MLH Midnight Hackathon this weekend (May 15-17), building
SafePassage - a privacy-preserving emergency disbursement protocol
that would let IPV survivors access emergency transport, shelter, or
legal-aid funds without creating a digital footprint an abuser could
monitor.

The protocol is built on the threat models published by NNEDV Safety
Net and Cornell Tech CETA. But I'd love a perspective from an Atlanta
shelter operator on whether the disbursement-routing design (funds go
directly to verified services, never to the survivor's wallet) matches
your operational reality.

Would anyone at PADV have 15 minutes Sunday morning (May 17) for a
short review call before I submit to Devpost? Even an email exchange
on the operational fit would be incredibly valuable.

Background: I won 2nd place at the Wells Fargo Global Career
Accelerator last year for SafeHaven, an AI domestic-financial-abuse
detection tool. SafePassage is the next layer.

GitHub (in progress): https://github.com/StephenSook/SafePassage

Thanks for the work PADV does in our community.

- Stephen Sookra
Atlanta, GA
stephensookra@gmail.com
```

**Status:** [Awaiting reply / Replied on YYYY-MM-DD / No reply by submission]

---

## Followup notes

- If any of the three reply with substantive feedback, archive the response below as a `## Reply from <org> - <date>` section.
- If a live review call is granted, document the call in `docs/architecture-decisions.md` with a new ADR entry.
- Even unanswered, this archive proves outreach attempt for Murder Board Pillar 1 defense.
