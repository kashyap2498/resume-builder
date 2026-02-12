import { type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Code2, Heart, Zap, Layout } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface StatItem {
  icon: ComponentType<LucideProps>;
  iconColor: string;
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: Code2,
    iconColor: 'text-blue-600/60',
    value: '1',
    label: 'Solo developer',
  },
  {
    icon: Layout,
    iconColor: 'text-blue-600/60',
    value: '18+',
    label: 'Templates included',
  },
  {
    icon: Zap,
    iconColor: 'text-blue-600/60',
    value: 'Weekly',
    label: 'Updates shipped',
  },
  {
    icon: Heart,
    iconColor: 'text-blue-600/60',
    value: '$0',
    label: 'VC funding taken',
  },
];

const leftVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const rightVariants = {
  hidden: { opacity: 0, x: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.1 },
  },
};

export default function FounderStory() {
  return (
    <section className="grain relative overflow-hidden bg-white border-y border-stone-100">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="lg:grid lg:grid-cols-5 lg:items-center lg:gap-16">
          {/* Left column - Story */}
          <motion.div
            className="lg:col-span-3"
            variants={leftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600/70">
              Why I built this
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Built by a person, not a corporation.
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-gray-600">
              <p>
                I needed a resume builder. Every option was either a subscription
                trap that charged me monthly for something I'd use twice a year,
                or a free tool so limited it wasn't worth the effort.
              </p>
              <p>
                So I built one for myself, my wife, and my cousin. We needed
                something professional, something that actually passed ATS
                systems, and something we could pay for once and never think
                about again.
              </p>
              <p>
                Resumello is that tool. It's not backed by venture capital.
                There's no growth team engineering dark patterns to maximize your
                monthly spend. It's just a good product at a fair price.
              </p>
            </div>
            <div className="mt-6">
              <p className="font-semibold text-gray-900">
                — Kashyap, maker of Resumello
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Software engineer. Built this because I was tired of getting ripped off.
              </p>
            </div>
          </motion.div>

          {/* Right column - Stats grid */}
          <motion.div
            className="mt-12 lg:col-span-2 lg:mt-0"
            variants={rightVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-stone-100 bg-stone-50 p-5 text-center"
                  >
                    <Icon className={`mx-auto h-6 w-6 ${stat.iconColor}`} />
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
