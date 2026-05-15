import { motion } from 'framer-motion';

const LINKS = [
  { label: 'Why Privacy', href: '#why-privacy' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Live Demo', href: '#live-demo' },
  { label: 'Build Club', href: '#build-club' },
];

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
    >
      <a href="#hero" className="font-display italic text-2xl text-white tracking-tight">
        SafePassage
      </a>

      <div className="liquid-glass hidden md:flex items-center gap-1 rounded-full px-2 py-2">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-white/80 hover:text-white px-4 py-1.5 rounded-full transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="#live-demo"
        className="bg-white text-bg text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
      >
        Try Demo
      </a>
    </motion.nav>
  );
}
