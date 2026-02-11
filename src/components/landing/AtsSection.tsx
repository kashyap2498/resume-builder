import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const bulletItems = [
  'Keyword matching against job descriptions',
  'Formatting checks for ATS compatibility',
  'Content quality — action verbs, quantified achievements',
  'Section completeness with improvement suggestions',
];

interface ScoreBar {
  label: string;
  score: string;
  percent: number;
  color: string;
}

const scoreBars: ScoreBar[] = [
  { label: 'Keywords', score: '36/40', percent: 90, color: 'bg-emerald-400' },
  { label: 'Formatting', score: '18/20', percent: 90, color: 'bg-emerald-400' },
  { label: 'Content', score: '17/20', percent: 85, color: 'bg-blue-400' },
  { label: 'Sections', score: '9/10', percent: 90, color: 'bg-blue-400' },
  { label: 'Readability', score: '7/10', percent: 70, color: 'bg-amber-400' },
];

// SVG circle dimensions
const CIRCLE_SIZE = 160;
const CIRCLE_RADIUS = 68;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const SCORE_PERCENT = 0.87;
const STROKE_DASHOFFSET = CIRCLE_CIRCUMFERENCE * (1 - SCORE_PERCENT);

function AtsScoreCard() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
      {/* Score circle */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
          <svg
            width={CIRCLE_SIZE}
            height={CIRCLE_SIZE}
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
            className="-rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={8}
              className="text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={STROKE_DASHOFFSET}
              className="text-emerald-400"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-white">87</span>
              <span className="text-lg text-gray-400">/100</span>
            </div>
          </div>
        </div>

        {/* Badge */}
        <span className="mt-3 inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
          Great
        </span>
      </div>

      {/* Score breakdown bars */}
      <div className="mt-8 space-y-4">
        {scoreBars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center text-sm">
              <span className="text-gray-300">{bar.label}</span>
              <span className="ml-auto text-gray-400">{bar.score}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className={`h-full rounded-full ${bar.color}`}
                style={{ width: `${bar.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AtsSection() {
  return (
    <section
      id="ats"
      className="grain-dark relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Left column — text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Why ATS matters
          </p>

          {/* Headline */}
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            75% of resumes are rejected before a human sees them.
          </h2>

          {/* Body */}
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-300">
            <p>
              Applicant Tracking Systems scan your resume before any recruiter
              does. If the format is wrong — columns, graphics, images, fancy
              layouts — your resume goes straight to the rejection pile.
            </p>
            <p>
              You never hear back. You assume the company wasn't interested.
            </p>
            <p className="font-semibold text-white">They never saw you.</p>
          </div>

          {/* Feature bullets */}
          <div className="mt-8">
            <p className="text-gray-300">
              Resumello's ATS scorer analyzes your resume in real time:
            </p>
            <ul className="mt-4 space-y-3">
              {bulletItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-gray-200"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <p className="mt-8 text-lg font-semibold text-white">
            Don't let software reject you.
          </p>
          <button
            onClick={() => scrollTo('pricing')}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 active:translate-y-0.5"
          >
            Get Resumello — $29
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Right column — ATS score mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="mt-12 lg:mt-0"
        >
          <AtsScoreCard />
        </motion.div>
      </div>
    </section>
  );
}
