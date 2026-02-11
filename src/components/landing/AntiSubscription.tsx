import { motion, type Variants } from 'framer-motion';
import { X, Check, Download, CreditCard, FileX } from 'lucide-react';

interface ComparisonCard {
  title: string;
  icon: typeof Download;
  iconColor: string;
  iconBg: string;
  topAccent: string;
  problem: string;
  solution: string;
}

const cards: ComparisonCard[] = [
  {
    title: 'The Download Trap',
    icon: Download,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    topAccent: 'bg-blue-400',
    problem:
      'You spend 2 hours building your resume. You click Download. Paywall.',
    solution:
      'Resumello: Download the moment you\'re done. PDF or Word. No surprises.',
  },
  {
    title: 'The Subscription Trap',
    icon: CreditCard,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    topAccent: 'bg-amber-400',
    problem:
      '$2.95 trial becomes $30/month. No warning. No cancel button. Check your bank statement.',
    solution:
      'Resumello: $29 once. No auto-renewals. Ever. Check your bank in a year. Nothing from us.',
  },
  {
    title: 'The ATS Trap',
    icon: FileX,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    topAccent: 'bg-purple-400',
    problem:
      'Beautiful templates that ATS software can\'t read. Your resume gets auto-rejected. You never hear back.',
    solution:
      'Resumello: Every template is ATS-tested. Real text-based PDFs that systems can parse.',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function AntiSubscription() {
  return (
    <section id="anti-subscription" className="grain relative overflow-hidden bg-gradient-to-b from-white to-stone-50/80">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* Header — varied treatment */}
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Tired of resume builders that{' '}
          <span className="text-red-500/80">waste your time</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
          We built Resumello because we were tired of it too.
        </p>

        {/* Comparison Cards */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-950/5 transition-shadow duration-300 hover:shadow-md"
                variants={cardVariants}
              >
                {/* Unique top accent line per card */}
                <div className={`absolute inset-x-0 top-0 h-1 ${card.topAccent}`} />

                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {card.title}
                  </h3>
                </div>

                {/* Problem */}
                <div className="mt-6 rounded-xl bg-red-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {card.problem}
                    </p>
                  </div>
                </div>

                {/* Solution */}
                <div className="mt-4 rounded-xl bg-emerald-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-900">
                      {card.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
