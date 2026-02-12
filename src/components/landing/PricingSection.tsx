import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';

const monthlyFeatures = [
  'All templates (18+ and growing)',
  'PDF + Word export',
  'ATS scoring',
  'Cloud sync',
  'Cancel anytime',
];

const lifetimeFeatures = [
  'All templates (18+ and growing)',
  'PDF + Word export',
  'Full ATS scoring + job description matching',
  'Cloud sync across devices',
  'Version history',
  'Job application tracker',
  'All future updates forever',
  'AI features when released (V2)',
  '7-day money-back guarantee',
];

interface Competitor {
  name: string;
  year1: string;
  year2: string;
}

const competitors: Competitor[] = [
  { name: 'Resume.io', year1: '~$390', year2: '~$780' },
  { name: 'EnhanCV', year1: '~$160', year2: '~$320' },
  { name: 'Novoresume', year1: '~$140', year2: '~$280' },
  { name: 'Canva Pro', year1: '~$120', year2: '~$240' },
  { name: 'Kickresume', year1: '~$84', year2: '~$168' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function PricingSection() {
  const { openCheckout } = useCheckout();

  return (
    <section id="pricing" className="bg-stone-50 bg-dot-grid">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {/* Header */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Pricing
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Simple pricing. No surprises.
        </h2>
        <p className="mt-4 text-center text-gray-500">
          One resume builder. Two ways to pay. Every feature included in both.
        </p>

        {/* Early bird banner */}
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p>
            <span className="font-medium text-gray-600">
              Early bird pricing:{' '}
            </span>
            <span className="font-bold text-gray-900">
              $29 for lifetime access
            </span>
            <span className="text-gray-400">
              {' '}
              — 147 of 200 spots remaining
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Price increases to $49 when early bird ends
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Month pass card — intentionally plain to anchor value toward lifetime */}
          <motion.div
            className="rounded-2xl border border-gray-200 bg-white p-8 opacity-90"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <p className="text-lg font-semibold text-gray-700">Month Pass</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-700">$12.99</span>
              <span className="text-base text-gray-400">/month</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Perfect if you only need it for a month or two.
            </p>
            <ul className="mt-6 space-y-3">
              {monthlyFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <Check className="h-4 w-4 shrink-0 text-gray-300" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openCheckout('monthly')}
              className="mt-8 w-full rounded-xl border border-gray-200 py-3 text-center font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Get Month Pass
            </button>
            <p className="mt-4 text-center text-xs text-gray-400">
              3 month passes = $38.97 — or get lifetime for $29
            </p>
          </motion.div>

          {/* Lifetime card */}
          <motion.div
            className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-600/10"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.15 }}
          >
            {/* Best value badge */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              BEST VALUE
            </span>
            <p className="text-lg font-semibold text-gray-900">Lifetime</p>
            <div className="mt-4 flex items-baseline">
              <span className="mr-2 text-2xl text-gray-400 line-through">
                $49
              </span>
              <span className="text-5xl font-bold text-gray-900">$29</span>
              <span className="ml-1 text-base text-gray-500">one-time</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Pay once. Use forever. All future updates included.
            </p>
            <ul className="mt-6 space-y-3">
              {lifetimeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openCheckout('lifetime')}
              className="mt-8 w-full cursor-pointer rounded-xl bg-blue-600 py-3.5 text-center text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:translate-y-0.5"
            >
              Get Lifetime Access — $29
            </button>
          </motion.div>
        </div>

        {/* Comparison anchor */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm font-medium text-gray-700">
            What other resume builders charge:
          </p>
          <div className="mx-auto max-w-lg text-sm">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-x-6 pb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              <span className="text-right" />
              <span className="text-center">1 year</span>
              <span className="text-center">2 years</span>
            </div>
            {/* Competitor rows */}
            <div className="space-y-1">
              {competitors.map((c, i) => (
                <div key={c.name} className={`grid grid-cols-3 gap-x-6 rounded-lg px-3 py-1.5 ${i % 2 === 0 ? 'bg-stone-100/60' : ''}`}>
                  <span className="text-right text-gray-500">{c.name}</span>
                  <span className="text-center font-medium text-gray-900">
                    {c.year1}
                  </span>
                  <span className="text-center font-medium text-gray-900">
                    {c.year2}
                  </span>
                </div>
              ))}
            </div>
            {/* Divider */}
            <div className="my-3 border-t border-gray-200" />
            {/* Resumello row — highlighted */}
            <div className="grid grid-cols-3 gap-x-6 rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-right font-bold text-blue-600">
                Resumello
              </span>
              <span className="text-center font-bold text-blue-600">$29</span>
              <span className="text-center font-bold text-blue-600">$29</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            That's less than 2 months of what other builders charge per year.
          </p>
        </div>
      </div>
    </section>
  );
}
