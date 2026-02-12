import { motion, type Variants } from 'framer-motion';
import { MousePointerClick, PenLine, Download } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: typeof MousePointerClick;
  iconColor: string;
  iconBg: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Pick a template',
    description:
      'Choose from our growing library of professional templates. ATS-optimized, modern, creative, technical — every industry covered.',
    icon: MousePointerClick,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    number: '02',
    title: 'Fill in your details',
    description:
      'Type or import your existing resume. Drag sections to reorder. Check your ATS score in real time.',
    icon: PenLine,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    number: '03',
    title: 'Download and apply',
    description:
      "Export as PDF or Word. ATS-parseable and ready to send. No watermarks. No paywall. It's yours.",
    icon: Download,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
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

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        {/* Header — eyebrow + smaller heading for variety */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          How it works
        </p>
        <h2 className="mt-3 text-center font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Up and running in 3 steps.
        </h2>

        {/* Steps with connecting line */}
        <div className="relative mt-16">
          {/* Connecting dashed line on desktop */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[3.5rem] hidden h-px border-t-2 border-dashed border-gray-200 md:block" />

          <motion.div
            className="relative grid grid-cols-1 gap-6 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="group relative rounded-2xl border-[0.8px] border-gray-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md"
                  variants={stepVariants}
                >
                  {/* Step number badge */}
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconBg}`}>
                    <span className={`text-lg font-bold ${step.iconColor}`}>{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="mt-5 flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${step.iconColor}`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
