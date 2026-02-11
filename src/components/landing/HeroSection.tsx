import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Shield, CheckCircle, ChevronDown } from 'lucide-react';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function BrowserMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [6, -6]);
  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);
  const glowX = useTransform(smoothX, [0, 1], [0, 100]);
  const glowY = useTransform(smoothY, [0, 1], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div style={{ perspective: 1000 }} className="group">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{
          scale: 1.02,
          boxShadow:
            '0 30px 80px -12px rgba(59,130,246,0.35), 0 0 50px -8px rgba(59,130,246,0.2)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative rounded-xl border border-white/10 bg-slate-800/80 shadow-2xl backdrop-blur-sm overflow-hidden"
      >
        {/* Animated glow that follows cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(500px circle at ${x}% ${y}%, rgba(59,130,246,0.18), transparent 60%)`,
            ),
          }}
        />

        {/* Browser chrome bar */}
        <div className="flex h-9 items-center gap-1.5 bg-slate-700/60 px-4">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
          <div className="ml-4 h-4 flex-1 max-w-56 rounded bg-white/10" />
        </div>

        {/* Real editor screenshot */}
        <img
          src="/editor-preview.gif"
          alt="Resumello editor — sidebar, form fields, and live resume preview"
          className="block w-full"
          loading="eager"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const trustItems = [
  { icon: Shield, text: '7-day money-back guarantee' },
  { icon: CheckCircle, text: 'No auto-renewals' },
  { icon: CheckCircle, text: 'Cancel monthly anytime' },
] as const;

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="grain-dark relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
    >
      <div className="mx-auto flex min-h-screen items-center py-24">
        <div className="flex w-full items-center">
          {/* Left column - Text content (constrained width) */}
          <div className="w-full shrink-0 px-6 text-center lg:w-[42%] lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-12 lg:text-left">
            {/* Pill badge */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
                No subscriptions. No trial traps.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Build your resume once.
              <br />
              Pay once.{' '}
              <span className="text-blue-400">Own it forever.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl lg:mx-0"
            >
              ATS-optimized templates for every industry — and growing. Real PDF
              and Word export. Built-in ATS scoring. One payment. That's it.
            </motion.p>

            {/* Early bird banner */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
                Early bird: $29 instead of $49 —{' '}
                <span className="tabular-nums font-semibold">147</span> of 200
                spots remaining
              </div>
            </motion.div>

            {/* CTA buttons — dual CTA pattern from competitor research */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <button
                onClick={() => scrollTo('pricing')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 active:translate-y-0.5"
              >
                Get Lifetime Access — $29
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollTo('templates')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 px-6 py-4 text-base font-medium text-gray-300 transition-all duration-200 hover:border-white/40 hover:text-white"
              >
                Browse Templates
              </button>
            </motion.div>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-3 text-sm text-gray-400 text-center lg:text-left"
            >
              or{' '}
              <button
                onClick={() => scrollTo('pricing')}
                className="cursor-pointer underline decoration-gray-500/40 underline-offset-2 transition-colors hover:text-gray-300 hover:decoration-gray-400/60"
              >
                $12.99/month
              </button>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400 lg:justify-start"
            >
              {trustItems.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  {item.text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right column - Browser mockup, breaks out to edge */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden min-w-0 flex-1 pr-6 lg:block"
          >
            <BrowserMockup />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6 text-gray-500" />
      </motion.div>
    </section>
  );
}
