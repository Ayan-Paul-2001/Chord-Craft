'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, ArrowLeft, Calendar, FileText, Lock, Eye, Server, RefreshCw } from 'lucide-react';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText, RichPolicyBody } from '@/components/shared/RichCmsText';

export default function PrivacyPolicyPage() {
  const { legalPolicies } = useStore();
  const policy = legalPolicies?.privacyPolicy;

  const title = policy?.title || 'Privacy Policy';
  const subtitle = policy?.subtitle || 'How Chord & Craft protects your personal learning data, account credentials, & privacy.';
  const lastUpdated = policy?.lastUpdated || 'March 2026';
  const content = policy?.content || '';
  const titleFontClass = getCmsFontClass(policy?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(policy?.bodyFont, '');

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-7 sm:space-y-10 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="space-y-4 border-b border-zinc-800/80 pb-6 sm:pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Official Academy Legal Policy</span>
          </div>
          <h1 className={`${titleFontClass} text-3xl sm:text-5xl font-semibold text-white tracking-tight`}>
            <RichCmsText text={title} />
          </h1>
          <p className={`${bodyFontClass} text-sm sm:text-base text-zinc-400`}>
            <RichCmsText text={subtitle} />
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Last Updated: <strong className="text-zinc-300 font-semibold">{lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* Structured Content Sections */}
      <RichPolicyBody
        content={content}
        titleFont={policy?.titleFont}
        bodyFont={policy?.bodyFont}
      />

      {/* Support Contact Box */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3 shadow-inner">
        <h3 className="text-base font-bold text-white font-mono">Have questions about your data privacy?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Our administrative compliance team is available to assist you with data requests or inquiries.
        </p>
        <a
          href="mailto:support@chordandcraft.com"
          className="inline-block max-w-full break-all px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md shadow-amber-950/40"
        >
          Contact Privacy Desk (support@chordandcraft.com)
        </a>
      </div>
    </div>
  );
}
