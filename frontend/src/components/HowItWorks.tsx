import { motion } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'Shelter issues a one-time code',
    body: 'An advocate generates a shelter code, registers its commitment on Midnight, and shares the raw code with the survivor via a secure channel. The chain never sees the raw code, only its hash.',
  },
  {
    n: '02',
    title: 'Survivor proves eligibility privately',
    body: 'Inside a desktop Lace install, the survivor enters the code and selects a service category. A zero-knowledge proof generates locally on the Midnight proof server. No personal wallet is touched.',
  },
  {
    n: '03',
    title: 'Funds route directly to verified service',
    body: 'The contract verifies commitment + category + amount + nullifier-uniqueness, then routes payment to the verified service address (transport, shelter, legal aid, prescription). The ledger records the disbursement category only.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg py-32 md:py-44 px-6 noise-overlay">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16 md:mb-20"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">// How it works</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight max-w-3xl">
            Three steps. <em className="font-display italic text-white/70">Zero footprint.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
              className="liquid-glass rounded-3xl p-8 min-h-[320px] flex flex-col"
            >
              <span className="font-display italic text-5xl text-accent mb-6">{step.n}</span>
              <h3 className="text-2xl text-white tracking-tight mb-4">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed mt-auto">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
