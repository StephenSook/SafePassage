export function Footer() {
  return (
    <footer className="bg-bg border-t border-white/10 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-display italic text-2xl text-white">SafePassage</p>
          <p className="text-xs text-white/40 mt-1">
            Built solo at the MLH Midnight Hackathon, May 15-17 2026.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-white/50">
          <a
            href="https://github.com/StephenSook/SafePassage"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/StephenSook/SafePassage/blob/claude/safepassage-hackathon-HsbSl/docs/threat-model.md"
            className="hover:text-white transition-colors"
          >
            Threat model
          </a>
          <a
            href="https://github.com/StephenSook/SafePassage/blob/claude/safepassage-hackathon-HsbSl/LICENSE"
            className="hover:text-white transition-colors"
          >
            Apache-2.0
          </a>
          <span className="text-white/30">|</span>
          <span>Sookra Methodology</span>
        </div>
      </div>
    </footer>
  );
}
