import { motion } from 'framer-motion';

export function TrustSection() {
  return (
    <section id="trust" className="bg-bg py-32 md:py-44 px-6 noise-overlay">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">// Compliance, not stealth</p>
          <h2 className="text-4xl md:text-6xl text-white tracking-tight">
            Auditable for the state.{' '}
            <em className="font-display italic text-accent">Invisible to the abuser.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <h3 className="text-xl text-white mb-3">For state auditors</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              FVPSA Title IV-A and VOCA grant administrators require compliance reporting on
              emergency-aid flows. SafePassage records category-bucket totals + nullifier set size
              on the public ledger - sufficient for audit, insufficient for re-identification.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <h3 className="text-xl text-white mb-3">For the abuser surveilling the chain</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              The chain reveals that a state crime-victim fund paid a medical transport network.
              It does not reveal which survivor claimed, when she planned to leave, where she went,
              or whether she even moved at all. Selective disclosure denies the abuser the signal.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <p className="text-sm text-white/50 leading-relaxed">
            Threat model grounded in USENIX Security 2023 (financial-app UI-bound adversaries),
            Cornell Tech Clinic to End Tech Abuse (Diana Freed), and NNEDV Safety Net Project.
            Full citations and adversary tiers in{' '}
            <a
              href="https://github.com/StephenSook/SafePassage/blob/claude/safepassage-hackathon-HsbSl/docs/threat-model.md"
              className="text-accent hover:underline"
            >
              docs/threat-model.md
            </a>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
