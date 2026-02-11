// =============================================================================
// Resumello Landing Page — Assembles all sections
// =============================================================================

import { useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustStrip from '@/components/landing/TrustStrip';
import AntiSubscription from '@/components/landing/AntiSubscription';
import TemplateShowcase from '@/components/landing/TemplateShowcase';
import FeatureGrid from '@/components/landing/FeatureGrid';
import AtsSection from '@/components/landing/AtsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingSection from '@/components/landing/PricingSection';
import FounderStory from '@/components/landing/FounderStory';
import FaqSection from '@/components/landing/FaqSection';
import FinalCta from '@/components/landing/FinalCta';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  // Set page title and meta tags for SEO
  useEffect(() => {
    document.title = 'Resumello — Build Your Resume Once. Pay Once. Own It Forever.';

    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Standard meta
    setMeta(
      'description',
      'ATS-optimized resume templates. PDF and Word export. Built-in ATS scoring. One-time payment. No subscriptions. No trial traps. No paywall at download.',
    );

    // Open Graph
    setMeta('og:title', 'Resumello — The Resume Builder That Doesn\'t Charge You Monthly', true);
    setMeta('og:description', '18 professional templates. ATS scoring. PDF + Word export. Pay once. Forever.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://resumello.app', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Resumello — Build Your Resume Once. Pay Once. Own It Forever.');
    setMeta('twitter:description', 'ATS-optimized templates. One-time payment. No subscriptions.');

    // Structured data
    const existingLd = document.querySelector('script[type="application/ld+json"][data-resumello]');
    if (!existingLd) {
      const ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.setAttribute('data-resumello', 'true');
      ldScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Resumello',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          {
            '@type': 'Offer',
            price: '29.00',
            priceCurrency: 'USD',
            description: 'Early bird lifetime access — one-time payment',
          },
          {
            '@type': 'Offer',
            price: '49.00',
            priceCurrency: 'USD',
            description: 'Lifetime access — one-time payment',
          },
          {
            '@type': 'Offer',
            price: '12.99',
            priceCurrency: 'USD',
            description: 'Monthly subscription',
          },
        ],
        description:
          'Professional resume builder with 18 ATS-optimized templates, built-in ATS scoring, and PDF/Word export.',
        url: 'https://resumello.app',
      });
      document.head.appendChild(ldScript);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky navigation */}
      <Navbar />

      {/* Main content */}
      <main id="main-content">
        {/* 1. Hero — dark gradient, hook + price + CTA */}
        <HeroSection />

        {/* 2. Trust badges strip */}
        <TrustStrip />

        {/* 3. Anti-subscription — validate their frustration */}
        <AntiSubscription />

        {/* 4. Template showcase — interactive gallery */}
        <TemplateShowcase />

        {/* 5. Feature grid — 8 features */}
        <FeatureGrid />

        {/* 6. ATS deep-dive — education + urgency */}
        <AtsSection />

        {/* 7. How it works — 3 simple steps */}
        <HowItWorks />

        {/* 8. Pricing — monthly vs lifetime + competitor comparison */}
        <PricingSection />

        {/* 9. Founder story — trust through authenticity */}
        <FounderStory />

        {/* 10. FAQ — destroy objections */}
        <FaqSection />

        {/* 11. Final CTA — last push */}
        <FinalCta />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
