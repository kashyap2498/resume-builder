import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

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

  const rotateX = useTransform(smoothY, [0, 1], [4, -4]);
  const rotateY = useTransform(smoothX, [0, 1], [-4, 4]);
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
    <div style={{ perspective: 1200 }} className="group">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{
          scale: 1.01,
          boxShadow:
            '0 30px 80px -12px rgba(59,130,246,0.3), 0 0 50px -8px rgba(59,130,246,0.15)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative rounded-xl border border-white/10 bg-slate-800/80 shadow-2xl shadow-black/40 backdrop-blur-sm overflow-hidden"
      >
        {/* Animated glow that follows cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(500px circle at ${x}% ${y}%, rgba(59,130,246,0.15), transparent 60%)`,
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

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="grain-dark relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950"
    >
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Centered text content */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill badge — product-focused, not pricing (research: 0/9 premium sites show pricing in hero) */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-400">
              18+ ATS-optimized templates — and growing
            </span>
          </motion.div>

          {/* Headline — 64px target, -0.02em tracking, 1.05 line-height (Linear/Notion/Raycast pattern) */}
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[64px]"
          >
            Build your resume once.
            <br />
            Pay once.{' '}
            <span className="text-blue-400">Own it forever.</span>
          </motion.h1>

          {/* Subheadline — 20px, muted, max 2 lines (Dub/Notion pattern) */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-400 sm:text-xl"
          >
            ATS-optimized templates, real PDF & Word export, and built-in
            ATS scoring. One payment. No subscriptions.
          </motion.p>

          {/* CTA row — no price in CTA (research: premium CTAs say "Get started", never "$29") */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <button
              onClick={() => scrollTo('pricing')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 active:translate-y-0.5"
            >
              Get Resumello
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo('templates')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-base font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:text-white"
            >
              Browse Templates
            </button>
          </motion.div>
        </div>

        {/* Product mockup — full width, below text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-16 max-w-4xl sm:mt-20"
        >
          <BrowserMockup />
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6 text-gray-500" />
      </motion.div>
    </section>
  );
}
