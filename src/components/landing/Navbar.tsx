import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', id: 'features' },
  { label: 'Templates', id: 'templates' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
] as const;

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((id: string) => {
    scrollTo(id);
    setMobileOpen(false);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText
              className={`h-6 w-6 transition-colors duration-300 ${
                scrolled ? 'text-blue-600' : 'text-white'
              }`}
            />
            <span
              className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              Resumello
            </span>
          </button>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`cursor-pointer text-sm font-medium transition-colors duration-300 hover:opacity-80 ${
                  scrolled ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/login')}
              className={`cursor-pointer text-sm font-medium transition-colors duration-300 hover:opacity-80 ${
                scrolled ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500"
            >
              Get Resumello
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`cursor-pointer md:hidden transition-colors duration-300 ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`overflow-hidden md:hidden ${
              scrolled ? 'bg-white/95 backdrop-blur-lg' : 'bg-slate-900/95 backdrop-blur-lg'
            }`}
          >
            <div className="mx-auto max-w-6xl space-y-1 px-6 pb-6 pt-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`block w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                    scrolled
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                className={`block w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => handleNavClick('pricing')}
                className="mt-3 w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500"
              >
                Get Resumello
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
