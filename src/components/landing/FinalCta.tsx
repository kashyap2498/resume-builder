import { motion } from 'framer-motion';
import { ArrowRight, Shield, CheckCircle } from 'lucide-react';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' as const },
};

export default function FinalCta() {
  return (
    <section className="grain-dark relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0 }}
          className="text-sm font-semibold uppercase tracking-wider text-blue-400"
        >
          Stop overpaying for resume builders
        </motion.p>

        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Your next job deserves a real resume builder.
        </motion.h2>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-300"
        >
          Professional templates. ATS scoring. PDF + Word export. Cloud sync.
          One payment. Forever.
        </motion.p>

        {/* Early bird urgency */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300"
        >
          Early bird: $29 instead of $49 —{' '}
          <span className="tabular-nums font-semibold">147</span> of 200 spots
          remaining
        </motion.div>

        {/* CTA */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={() => scrollTo('pricing')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0.5"
          >
            Get Lifetime Access — $29
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Trust row */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400"
        >
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-400" />
            7-day money-back guarantee
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            No subscription
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            No tricks
          </span>
        </motion.div>
      </div>
    </section>
  );
}
