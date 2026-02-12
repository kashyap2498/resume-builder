import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'Is there really no subscription?',
    answer:
      'The lifetime plan is a one-time payment. We never charge you again. No auto-renewals. No "your plan expired" emails. No fine print. Check your bank statement in a year \u2014 you\u2019ll see nothing from us. We also offer a $12.99 month pass if you only need it short-term \u2014 no recurring billing, just single-month access you can repurchase if you want.',
  },
  {
    question: 'What if I don\u2019t like it?',
    answer:
      'Full refund within 7 days. No questions asked. No "tell us why you\u2019re leaving" forms. No guilt trips. Just email us and get your money back. We\u2019d rather refund you than have an unhappy customer.',
  },
  {
    question: 'Why is there no free trial?',
    answer:
      'Because we don\u2019t do the "free trial that secretly charges you" thing. You know exactly what you\u2019re paying before you pay it. And with our 7-day money-back guarantee, you can try it risk-free. That\u2019s better than any free trial.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Your resume data is synced securely to the cloud with your account. We use industry-standard encryption. We don\u2019t sell your data. We don\u2019t run ads. We don\u2019t share your information with third parties. Your resume is yours.',
  },
  {
    question: 'Can I use it on multiple devices?',
    answer:
      'Yes. Sign in from any browser on any device \u2014 your resumes sync automatically. Desktop, laptop, tablet, phone. Start on one, finish on another.',
  },
  {
    question: 'Do the templates actually pass ATS systems?',
    answer:
      'Every template generates real, parseable text \u2014 not images or graphics. ATS systems read them like a Word document. We also include a built-in ATS scorer so you can check before you submit. This is what separates Resumello from design tools where resumes get auto-rejected.',
  },
  {
    question: 'Can I import my existing resume?',
    answer:
      'Yes. Upload a PDF or Word document and we\u2019ll parse it into the editor automatically. Your work history, education, skills \u2014 all extracted and ready to edit.',
  },
  {
    question: 'Why is this so much cheaper than other resume builders?',
    answer:
      'No investors to repay. No sales team to fund. No recurring billing infrastructure to maintain. No dark patterns to engineer. We built a good product and priced it fairly. That\u2019s the whole story.',
  },
  {
    question: 'What about the AI features?',
    answer:
      'AI-powered suggestions are coming in V2 and will be included in your lifetime purchase at no extra cost. You\u2019ll be able to bring your own API key or use built-in credits \u2014 pay only for what you use with zero markup from us.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-stone-50">
      <motion.div
        className="mx-auto max-w-3xl px-6 py-20 sm:py-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Questions? Answered.
        </h2>
        <p className="mt-3 text-center text-gray-500">
          Everything you need to know before you buy.
        </p>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl border bg-white transition-all duration-200 ${
                openIndex === index
                  ? 'border-blue-200 shadow-sm'
                  : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-base leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
