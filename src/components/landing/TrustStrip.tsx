import { motion, type Variants } from 'framer-motion';
import { ShieldCheck, CreditCard, RefreshCcw, FileCheck } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, text: 'Pay Once, Own Forever' },
  { icon: CreditCard, text: 'One-Time Payment' },
  { icon: RefreshCcw, text: '7-Day Money Back' },
  { icon: FileCheck, text: '18+ ATS Templates' },
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export default function TrustStrip() {
  return (
    <section className="border-b border-stone-100 bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mx-auto max-w-5xl px-6 py-5"
      >
        {/* Horizontal strip with inline dividers */}
        <div className="flex flex-wrap items-center justify-center gap-x-0 gap-y-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.text}
              variants={itemVariants}
              className="flex items-center"
            >
              {/* Divider (not on first item) */}
              {i > 0 && (
                <div className="mx-5 hidden h-4 w-px bg-gray-200 sm:block" />
              )}
              <div className="flex items-center gap-2 px-2">
                <badge.icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">{badge.text}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
