import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ShieldOrb } from '../three/ShieldOrb';
import { ParticleField } from '../three/ParticleField';

export function HeroScene() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-bg">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, 5]} intensity={0.6} color="#A4F4FD" />
          <ParticleField />
          <ShieldOrb />
          <Environment preset="night" />
        </Canvas>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl text-5xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-white"
        >
          Privacy that{' '}
          <em className="font-display italic text-accent not-italic-children">moves money</em>{' '}
          without showing it moved.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
          className="mt-8 max-w-2xl text-base md:text-lg text-white/65 leading-relaxed"
        >
          Emergency disbursements that route to verified services. No personal wallet.
          No transaction history tied to identity. Mathematically auditable for the state.
          Invisible to bad actors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#live-demo"
            className="bg-white text-bg text-sm font-medium rounded-full px-6 py-3 hover:bg-white/90 transition-colors"
          >
            Try the live demo
          </a>
          <a
            href="#how-it-works"
            className="liquid-glass text-white text-sm font-medium rounded-full px-6 py-3 hover:bg-white/5 transition-colors"
          >
            How it works
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />
    </section>
  );
}
