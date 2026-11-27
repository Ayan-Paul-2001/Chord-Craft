'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { SocialIcon } from '@/components/shared/SocialIcon';
import { DEFAULT_SOCIAL_LINKS } from '@/lib/mockData';

export const PublicFooter: React.FC = () => {
  const { platformSettings, adminName } = useStore();

  const academyEmail = platformSettings?.academyEmail || 'support@chordandcraft.com';
  const academyPhone = platformSettings?.academyPhone || '+880 1711-000000';
  const academyAddress = platformSettings?.address || 'Banani, Dhaka-1213, Bangladesh';

  const socialLinks = (platformSettings?.socialLinks || DEFAULT_SOCIAL_LINKS).filter(
    (item) => item.isEnabled && item.url && item.url.trim().length > 0
  );

  return (
    <footer className="relative bg-[#08080a] text-zinc-400 pt-12 sm:pt-16 pb-10 sm:pb-12 font-sans overflow-hidden">
      {/* Subtle champagne hairline top accent */}
      <div className="section-hairline absolute top-0 left-0 right-0" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[360px] sm:w-[720px] h-[180px] sm:h-[220px] bg-amber-500/[0.04] rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-5 gap-y-7 sm:gap-10 lg:gap-12 pb-8 sm:pb-14 border-b border-white/[0.07]">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-5 space-y-3.5 sm:space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <BrandIcon className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="brand-wordmark text-xl sm:text-2xl tracking-wide text-white leading-none block">
                  Chord <span className="text-amber-400 italic">&amp;</span> Craft
                </span>
                <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.22em] text-zinc-400 uppercase font-sans mt-1">
                  Harmonic Guitar Academy
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md font-light">
              A contemporary guitar conservatory at Harmonic Guitar Academy, mentored by {adminName}. Elevate your tone, touch, and musicality through HD YouTube masterclasses, studio backing tracks, and printable PDF tabs.
            </p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap pt-0.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl luxury-btn-ghost flex items-center justify-center text-zinc-400 hover:text-amber-300"
                    title={link.label || link.platform}
                    aria-label={link.label || link.platform}
                  >
                    <SocialIcon platform={link.platform} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Conservatory Navigation — Left Column on Mobile (2-up with Portal & Legal) */}
          <div className="col-span-1 lg:col-span-2 space-y-2.5 sm:space-y-4">
            <h4 className="text-zinc-200 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase">
              Conservatory
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[12.5px] sm:text-sm">
              <li>
                <Link href="/#about" className="hover:text-amber-300 transition">
                  Philosophy
                </Link>
              </li>
              <li>
                <Link href="/#instructor" className="hover:text-amber-300 transition">
                  Lead Mentor
                </Link>
              </li>
              <li>
                <Link href="/#curriculum" className="hover:text-amber-300 transition">
                  4-Stage Roadmap
                </Link>
              </li>
              <li>
                <Link href="/#lessons" className="hover:text-amber-300 transition">
                  Demo Lessons
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-amber-300 transition inline-flex items-center gap-1">
                  <span>Courses</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/merchandise" className="hover:text-amber-300 transition inline-flex items-center gap-1">
                  <span>Merchandise</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Portal & Legal Links — Right Column on Mobile (2-up with Conservatory) */}
          <div className="col-span-1 lg:col-span-2 space-y-2.5 sm:space-y-4">
            <h4 className="text-zinc-200 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase">
              Portal &amp; Legal
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[12.5px] sm:text-sm">
              <li>
                <Link href="/signup" className="hover:text-amber-300 transition">
                  Enroll as Student
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/bkash-faq" className="hover:text-amber-300 transition">
                  bKash Payment FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-300 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-amber-300 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Contact Card */}
          <div className="col-span-2 lg:col-span-3">
            <div className="p-4 sm:p-5 rounded-2xl luxury-glass space-y-3 sm:space-y-4">
              <h4 className="text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase">
                Studio Contact
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300 leading-relaxed">{academyAddress}</span>
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span className="text-zinc-300 font-mono tabular-nums">{academyPhone}</span>
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span className="text-zinc-300 break-all">{academyEmail}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-7 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left text-xs text-zinc-500 gap-3 sm:gap-4">
          <p>© {new Date().getFullYear()} Chord &amp; Craft — Harmonic Guitar Academy. All rights reserved.</p>
          <p className="font-mono text-[11px] tracking-wider uppercase text-zinc-500">
            Crafted for Precision • Tone • Musicality
          </p>
        </div>
      </div>
    </footer>
  );
};
