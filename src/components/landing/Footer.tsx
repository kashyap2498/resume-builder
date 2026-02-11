import { FileText } from 'lucide-react';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const footerNav = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', action: () => scrollTo('features') },
      { label: 'Templates', action: () => scrollTo('templates') },
      { label: 'Pricing', action: () => scrollTo('pricing') },
      { label: 'FAQ', action: () => scrollTo('faq') },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Terms of Service', action: () => { window.location.href = '/terms'; } },
      { label: 'Privacy Policy', action: () => { window.location.href = '/privacy'; } },
      { label: 'Contact', action: () => { window.location.href = 'mailto:hello@resumello.app'; } },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="grain-dark relative overflow-hidden bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-bold text-white">Resumello</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              The resume builder that doesn't charge you monthly.
              Built by one developer, not a corporation.
            </p>
          </div>

          {/* Nav columns */}
          {footerNav.map((section) => (
            <div key={section.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="cursor-pointer text-sm text-gray-500 transition-colors hover:text-gray-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-slate-800" />

        {/* Bottom row */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-gray-600">
            &copy; 2026 Resumello. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Build once. Own forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
