"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from 'react';
import { Layout, Globe } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/shared/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { useSession, signOut, isAdmin } from '@/shared/lib/auth-client';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
};

// Animated hamburger icon — pure CSS transitions
const MenuToggle = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
  <button
    className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
    onClick={toggle}
    aria-expanded={isOpen}
    aria-label={isOpen ? useTranslations('Navbar')("closeMenu") : useTranslations('Navbar')("openMenu")}
  >
    <div className="w-[22px] h-[22px] relative">
      <span
        className={cn(
          "absolute left-[3px] right-[3px] h-[1.5px] rounded-full bg-current text-white transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          isOpen ? "top-[10px] rotate-45" : "top-[6px] rotate-0"
        )}
      />
      <span
        className={cn(
          "absolute left-[3px] right-[3px] h-[1.5px] rounded-full bg-current text-white top-[10px] transition-all duration-200",
          isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        )}
      />
      <span
        className={cn(
          "absolute left-[3px] right-[3px] h-[1.5px] rounded-full bg-current text-white transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          isOpen ? "top-[10px] -rotate-45" : "top-[14px] rotate-0"
        )}
      />
    </div>
  </button>
);

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Entrance animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setLangMenuOpen(false);
    if (langMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [langMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Logo hover animation
  const handleLogoEnter = useCallback(() => {
    if (!logoRef.current) return;
    const icon = logoRef.current.querySelector('.logo-icon');
    gsap.to(icon, {
      rotation: 360,
      scale: 1.1,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);

  const handleLogoLeave = useCallback(() => {
    if (!logoRef.current) return;
    const icon = logoRef.current.querySelector('.logo-icon');
    gsap.to(icon, {
      rotation: 0,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const switchLocale = (newLocale: string) => {
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale as (typeof routing.locales)[number] });
    });
  };

  const navLinks = [
    { name: t('showcase'), href: '#showcase' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('gallery'), href: '/gallery', isRoute: true },
    { name: t('marketplace'), href: '/marketplace', isRoute: true },
    { name: t('apiDocs'), href: '/api-docs', isRoute: true },
  ];

  return (
    <>
      {/* Navbar */}
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 md:px-8",
          scrolled
            ? "py-3 bg-black/40 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_1px_40px_rgba(0,0,0,0.5)]"
            : "py-5 bg-transparent backdrop-blur-md",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        )}
        style={{
          WebkitBackdropFilter: scrolled ? 'blur(40px) saturate(150%)' : 'blur(12px)',
          transitionProperty: 'all',
          transitionDuration: mounted ? '0.6s' : '0s',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
          >
            <div ref={logoRef}>
              <div className="logo-icon w-9 h-9 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-transform duration-300">
                <Layout className="text-black w-5 h-5" />
              </div>
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight uppercase">
              LTX-<span className="text-[#eab308]">VIDEO</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center space-x-12">
            {navLinks.map((link, i) => {
              const className = cn(
                "relative text-[13px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#eab308] transition-all duration-300 group",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2.5"
              );
              const style = { transitionDelay: mounted ? `${0.4 + i * 0.08}s` : '0s' };
              const inner = (
                <>
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#eab308] to-[#facc15] group-hover:w-full transition-all duration-300" />
                </>
              );
              return link.isRoute ? (
                <Link key={link.name} href={link.href} className={className} style={style}>
                  {inner}
                </Link>
              ) : (
                <a key={link.name} href={link.href} className={className} style={style}>
                  {inner}
                </a>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Language Switcher */}
            <div
              className={cn(
                "relative transition-all duration-400",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2.5"
              )}
              style={{ transitionDelay: mounted ? '0.7s' : '0s' }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangMenuOpen(!langMenuOpen);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border",
                  langMenuOpen
                    ? "text-[#eab308] border-[#eab308]/20 bg-[#eab308]/[0.06]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/[0.04]"
                )}
                aria-label={t("switchLanguage")}
                aria-expanded={langMenuOpen}
              >
                <Globe className={cn("w-3.5 h-3.5 transition-transform duration-300", langMenuOpen && "rotate-180")} />
                <span>{LOCALE_LABELS[locale]}</span>
              </button>

              <div
                className={cn(
                  "absolute top-full right-0 mt-2 py-1.5 rounded-lg bg-neutral-900/95 backdrop-blur-2xl border border-white/[0.06] shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-[100px] overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] origin-top",
                  langMenuOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
              >
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={(e) => {
                      e.stopPropagation();
                      switchLocale(loc);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-[12px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer flex items-center gap-3",
                      loc === locale
                        ? "text-[#eab308] bg-[#eab308]/[0.06]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                      loc === locale ? "bg-[#eab308]" : "bg-slate-700"
                    )} />
                    {loc === 'en' ? 'English' : 'Français'}
                  </button>
                ))}
              </div>
            </div>

            {session ? (
              <>
                {isAdmin(session.user) && (
                  <Link
                    href="/admin"
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase text-[#eab308] border border-[#eab308]/20 bg-[#eab308]/[0.05] hover:bg-[#eab308]/[0.1] transition-all",
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2.5"
                    )}
                    style={{ transitionDelay: mounted ? '0.72s' : '0s' }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={cn(
                    "px-6 py-3 rounded-lg btn-ghost text-[12px] active:scale-95 transition-all inline-block",
                    mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2.5 scale-90"
                  )}
                  style={{ transitionDelay: mounted ? '0.75s' : '0s' }}
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className={cn(
                    "px-8 py-3 rounded-lg btn-gold text-[12px] shadow-[0_0_20px_rgba(234,179,8,0.15)] active:scale-95 transition-all inline-block cursor-pointer",
                    mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2.5 scale-90"
                  )}
                  style={{ transitionDelay: mounted ? '0.8s' : '0s' }}
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-widest text-white/70 hover:text-[#eab308] transition-all duration-300",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2.5"
                  )}
                  style={{ transitionDelay: mounted ? '0.75s' : '0s' }}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "px-8 py-3 rounded-lg btn-gold text-[12px] shadow-[0_0_20px_rgba(234,179,8,0.15)] active:scale-95 transition-all inline-block",
                    mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2.5 scale-90"
                  )}
                  style={{
                    transitionDelay: mounted ? '0.8s' : '0s',
                    transitionDuration: '0.5s',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <span className="relative z-10">{t('getStarted')}</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <MenuToggle isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      </nav>

      {/* Mobile menu — fullscreen overlay */}
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu panel */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 overflow-y-auto transition-all duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2.5 pointer-events-none"
        )}
        style={{ maxHeight: '100dvh' }}
      >
        {/* Menu header with logo + close */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-white/[0.04] bg-[#050505]">
          <Link
            href="/"
            className="flex items-center space-x-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Layout className="text-black w-5 h-5" />
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight uppercase">
              LTX-<span className="text-[#eab308]">VIDEO</span>
            </span>
          </Link>
          <MenuToggle isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(false)} />
        </div>

        {/* Menu content */}
        <div className="bg-[#050505] min-h-[calc(100dvh-73px)] relative">
          <div className="px-6 sm:px-8 pt-8 pb-6">
            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link, i) => {
                const className = cn(
                  "flex items-center justify-between py-4 px-3 -mx-3 rounded-xl text-lg sm:text-xl font-bold uppercase tracking-widest text-white/90 hover:text-[#eab308] hover:bg-white/[0.02] transition-all active:text-[#eab308] active:bg-white/[0.04] group",
                  mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-[30px]"
                );
                const style = {
                  transitionDelay: mobileMenuOpen ? `${0.1 + i * 0.06}s` : `${i * 0.03}s`,
                  transitionDuration: mobileMenuOpen ? '0.4s' : '0.2s',
                  transitionProperty: 'all' as const,
                  filter: mobileMenuOpen ? 'blur(0px)' : 'blur(8px)',
                };
                const inner = (
                  <>
                    <span className="flex items-center gap-4">
                      <span className="w-1 h-1 rounded-full bg-[#eab308]/40 group-hover:bg-[#eab308] group-active:bg-[#eab308] transition-colors" />
                      {link.name}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className="text-slate-600 group-hover:text-[#eab308] group-active:text-[#eab308] transition-all group-hover:translate-x-1"
                    >
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                );
                return link.isRoute ? (
                  <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={className} style={style}>
                    {inner}
                  </Link>
                ) : (
                  <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={className} style={style}>
                    {inner}
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px my-6 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {/* Language switcher */}
            <div
              className={cn(
                "transition-all",
                mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-[30px]"
              )}
              style={{
                transitionDelay: mobileMenuOpen ? '0.34s' : '0s',
                transitionDuration: mobileMenuOpen ? '0.4s' : '0.2s',
                filter: mobileMenuOpen ? 'blur(0px)' : 'blur(8px)',
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3 px-1">
                {t('language')}
              </p>
              <div className="flex gap-3">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={cn(
                      "flex-1 py-3.5 rounded-xl text-center text-[13px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border",
                      loc === locale
                        ? "text-[#eab308] border-[#eab308]/30 bg-[#eab308]/[0.06] shadow-[0_0_20px_rgba(234,179,8,0.08)]"
                        : "text-slate-500 border-white/[0.04] bg-white/[0.02] hover:text-white active:bg-white/[0.06]"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      {loc === 'en' ? 'English' : 'Français'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px my-6 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {/* Action buttons */}
            <div
              className={cn(
                "space-y-3 transition-all",
                mobileMenuOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"
              )}
              style={{
                transitionDelay: mobileMenuOpen ? '0.4s' : '0s',
                transitionDuration: mobileMenuOpen ? '0.4s' : '0.15s',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {session ? (
                <>
                  {isAdmin(session.user) && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-4 mb-3 rounded-xl text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#eab308] border border-[#eab308]/20 bg-[#eab308]/[0.05]"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 rounded-xl text-center text-[13px] font-bold uppercase tracking-widest text-white/70 border border-white/[0.04] bg-white/[0.02] hover:text-white active:bg-white/[0.06] transition-all">
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      router.refresh();
                    }}
                    className="block w-full py-4 rounded-xl btn-gold text-[13px] text-center shadow-[0_0_30px_rgba(234,179,8,0.15)] cursor-pointer"
                  >
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 rounded-xl text-center text-[13px] font-bold uppercase tracking-widest text-white/70 border border-white/[0.04] bg-white/[0.02] hover:text-white active:bg-white/[0.06] transition-all">
                    {t('login')}
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 rounded-xl btn-gold text-[13px] text-center shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                    <span className="relative z-10">{t('getStarted')}</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Bottom decorative glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#eab308]/[0.02] blur-[120px] pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
