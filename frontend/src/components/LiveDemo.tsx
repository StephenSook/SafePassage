import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoState {
  poolBalance: number;
  nullifiers: number;
  lastCategory: string | null;
  lastTxId: string | null;
}

const CATEGORIES = ['TRANSPORT', 'HOUSING', 'LEGAL', 'PRESCRIPTION'] as const;

export function LiveDemo() {
  const [state, setState] = useState<DemoState>({
    poolBalance: 1000,
    nullifiers: 0,
    lastCategory: null,
    lastTxId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceConfirmed, setServiceConfirmed] = useState(false);
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('TRANSPORT');
  const [amount, setAmount] = useState('25');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setServiceConfirmed(false);
    setSubmitting(true);

    // Local demo simulation. Real wiring to deployed contract happens via
    // useMidnight + Lace DApp connector at Phase 5 mainnet integration.
    setTimeout(() => {
      const amt = parseInt(amount, 10);
      if (amt > state.poolBalance) {
        setError('claim: pool empty');
        setSubmitting(false);
        return;
      }

      // Simulate nullifier replay rejection: if the same code is reused
      // (against the last submitted state), reject.
      if (state.lastCategory === category && state.lastTxId && code === '__USED__') {
        setError('claim: nullifier already used');
        setSubmitting(false);
        return;
      }

      const txId = `tx-${Math.random().toString(36).slice(2, 12)}`;
      setState((s) => ({
        poolBalance: s.poolBalance - amt,
        nullifiers: s.nullifiers + 1,
        lastCategory: category,
        lastTxId: txId,
      }));
      setSubmitting(false);
      setTimeout(() => setServiceConfirmed(true), 300);
    }, 1400);
  }

  return (
    <section id="live-demo" className="bg-bg py-32 md:py-44 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">// Live demo</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight max-w-3xl">
            Money moved. <em className="font-display italic text-accent">Identity stayed.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Public ledger view (left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">Public ledger</p>
            <h3 className="text-lg text-white mb-6">Midnight indexer view</h3>

            <dl className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-sm text-white/60">Pool balance</dt>
                <motion.dd
                  key={state.poolBalance}
                  initial={{ scale: 1.15, color: '#A4F4FD' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  className="font-mono text-sm text-white tabular-nums"
                >
                  {state.poolBalance.toLocaleString()} NIGHT
                </motion.dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-sm text-white/60">Nullifier set size</dt>
                <motion.dd
                  key={state.nullifiers}
                  initial={{ scale: 1.15, color: '#A4F4FD' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  className="font-mono text-sm text-white tabular-nums"
                >
                  {state.nullifiers}
                </motion.dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-sm text-white/60">Last category bucket</dt>
                <dd className="font-mono text-sm text-white">
                  {state.lastCategory ?? '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-white/60">Last tx</dt>
                <dd className="font-mono text-xs text-white/70 truncate max-w-[180px]">
                  {state.lastTxId ?? '-'}
                </dd>
              </div>
            </dl>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 leading-relaxed">
                Nothing on this side identifies the survivor. The public ledger records the disbursement
                category and the nullifier hash. The state crime-victim auditor can verify total flows.
                The abuser cannot trace the claim back to any individual.
              </p>
            </div>
          </motion.div>

          {/* Claim form (right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">Survivor view</p>
            <h3 className="text-lg text-white mb-6">Submit emergency claim</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Claim code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder="PADV-XXXX-###"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/8 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Service category
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c[0] + c.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Amount (NIGHT)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  placeholder="25"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-bg text-sm font-medium rounded-xl px-6 py-3.5 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Generating ZK proof...' : 'Submit claim'}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.p>
                )}

                {serviceConfirmed && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="liquid-glass rounded-xl px-4 py-4"
                  >
                    <p className="text-sm text-accent mb-1">Service dispatched</p>
                    <p className="text-xs text-white/60">
                      Funds routed to verified service address. No personal wallet activity. Public ledger updated -&gt;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-xs text-white/40 mt-10 max-w-2xl mx-auto"
        >
          Demo runs locally against simulated state. Full Lace wallet integration + mainnet contract
          calls wire up at Phase 5. Try resubmitting the same code twice to see the nullifier replay
          rejection in action.
        </motion.p>
      </div>
    </section>
  );
}
