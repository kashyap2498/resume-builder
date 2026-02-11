import { type ComponentType } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  BarChart3,
  Download,
  Upload,
  GripVertical,
  Cloud,
  History,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Feature {
  icon: ComponentType<LucideProps>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  /** Tailwind grid span classes for bento layout */
  span: string;
  /** Optional accent bar color */
  accent: string;
}

const features: Feature[] = [
  {
    icon: BarChart3,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'ATS Score Checker',
    description:
      'See exactly how your resume scores against applicant tracking systems. Keyword matching, formatting checks, and content quality — all in real time.',
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
    accent: 'bg-blue-600',
  },
  {
    icon: Download,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'PDF + Word Export',
    description:
      'Download in both formats. Real text-based PDFs — not images — so ATS systems can actually read them.',
    span: 'lg:col-span-1',
    accent: 'bg-emerald-500',
  },
  {
    icon: Upload,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Import Existing Resume',
    description:
      "Upload a PDF or Word doc. We'll parse it automatically so you don't start from scratch.",
    span: 'lg:col-span-1',
    accent: 'bg-purple-500',
  },
  {
    icon: GripVertical,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Drag-and-Drop Sections',
    description:
      'Reorder, rename, show or hide any section. 16 built-in section types plus custom sections.',
    span: 'lg:col-span-1',
    accent: 'bg-amber-500',
  },
  {
    icon: Cloud,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    title: 'Cloud Sync',
    description:
      'Your resumes are saved securely. Switch devices, clear your browser — your work is always there.',
    span: 'lg:col-span-1',
    accent: 'bg-sky-500',
  },
  {
    icon: History,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    title: 'Version History',
    description:
      "Save named snapshots. 'Marketing v2' and 'Engineering v3' — switch between them instantly.",
    span: 'sm:col-span-2 lg:col-span-1',
    accent: 'bg-indigo-500',
  },
  {
    icon: Briefcase,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    title: 'Job Tracker',
    description:
      'Track where you applied, when, and what happened. Everything organized alongside your resumes.',
    span: 'lg:col-span-1',
    accent: 'bg-orange-500',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    title: 'AI Coming Soon',
    description:
      'AI-powered suggestions arriving in V2. Included in your lifetime purchase at no extra cost.',
    span: 'sm:col-span-2 lg:col-span-2',
    accent: 'bg-pink-500',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function FeatureGrid() {
  return (
    <section id="features" className="grain relative overflow-hidden bg-white">
      {/* Organic gradient blobs — breaks the flat AI look */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-50 to-purple-50/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-emerald-50/50 to-sky-50/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        {/* Header — larger, accent color for emphasis */}
        <h2 className="mx-auto max-w-3xl text-center font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Everything you need.{' '}
          <span className="text-blue-600">Nothing you don't.</span>
        </h2>
        <p className="mt-6 text-center text-lg text-gray-500">
          No bloat. No upsells. Every feature is included in every plan.
        </p>

        {/* Bento Grid */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isHero = feature.span.includes('row-span-2');
            return (
              <motion.div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-stone-50/50 p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-lg ${feature.span} ${isHero ? 'flex flex-col justify-between' : ''}`}
                variants={itemVariants}
              >
                {/* Accent bar at top */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className={`mt-4 font-semibold text-gray-900 ${isHero ? 'text-lg' : 'text-base'}`}>
                    {feature.title}
                  </h3>
                  <p className={`mt-2 leading-relaxed text-gray-500 ${isHero ? 'text-base' : 'text-sm'}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Hero card extra emphasis */}
                {isHero && (
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Real-time scoring as you type
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
