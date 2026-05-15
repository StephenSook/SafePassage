import { motion } from 'framer-motion';

export function BuildClubCTA() {
  return (
    <section id="build-club" className="bg-bg py-32 md:py-44 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9 }}
          className="liquid-glass rounded-[2rem] p-10 md:p-16 noise-overlay"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-8">// Part 2 of a 3-part founder thesis</p>

          <h2 className="text-3xl md:text-5xl text-white tracking-tight leading-tight mb-8 max-w-3xl">
            Privacy infrastructure for vulnerable populations is a{' '}
            <em className="font-display italic text-accent">multi-billion-dollar</em> gap we are just starting to fill.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 max-w-3xl">
            <div>
              <p className="font-display italic text-3xl text-accent mb-2">SafeHaven</p>
              <p className="text-sm text-white/50 leading-relaxed">
                AI domestic-financial-abuse detection. 2nd place, Wells Fargo Global Career Accelerator 2026.
              </p>
            </div>
            <div>
              <p className="font-display italic text-3xl text-white mb-2">SafePassage</p>
              <p className="text-sm text-white/65 leading-relaxed">
                Privacy-preserving emergency disbursement. MLH Midnight Hackathon, May 2026. Stephen Sookra (frontend, design, pitch) &amp; Vinh Le (backend). <span className="text-accent">(This project.)</span>
              </p>
            </div>
            <div>
              <p className="font-display italic text-3xl text-white/50 mb-2">SafeReturn</p>
              <p className="text-sm text-white/40 leading-relaxed">
                Post-exit financial recovery. Roadmap.
              </p>
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed max-w-2xl mb-10">
            Year 1 underwritten by FVPSA Title IV-A discretionary funding plus private foundation
            co-funding. Allstate Foundation, Avon Foundation, and Mary Kay Ash Foundation each have
            historical precedent funding DV-tech infrastructure. Sustained by yield-on-pooled-capital
            and B2B SaaS to state coalitions post-Build-Club.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/StephenSook/SafePassage/tree/claude/safepassage-hackathon-HsbSl"
              className="bg-white text-bg text-sm font-medium rounded-full px-6 py-3 hover:bg-white/90 transition-colors"
            >
              Read the architecture
            </a>
            <a
              href="mailto:stephensookra@gmail.com"
              className="liquid-glass text-white text-sm font-medium rounded-full px-6 py-3 hover:bg-white/5 transition-colors"
            >
              Build Club, let&apos;s talk
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
