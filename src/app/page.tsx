'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { InstructorSection } from '@/components/landing/InstructorSection';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { ProcessSection } from '@/components/landing/ProcessSection';
import { FeaturedLessonsSection } from '@/components/landing/FeaturedLessonsSection';
import { WhyUsSection } from '@/components/landing/WhyUsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { MerchSection } from '@/components/landing/MerchSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { HomepageSection } from '@/lib/types';

export default function LandingPage() {
  const { cmsSections } = useStore();

  // Map CMS section IDs to component renders with dynamic section data passed
  const sectionMap: Record<string, (sec: HomepageSection) => React.ReactNode> = {
    'sec-hero': (sec) => <HeroSection key="sec-hero" data={sec} />,
    'sec-about': (sec) => <AboutSection key="sec-about" data={sec} />,
    'sec-instructor': (sec) => <InstructorSection key="sec-instructor" data={sec} />,
    'sec-courses': (sec) => <CoursesSection key="sec-courses" data={sec} />,
    'sec-process': (sec) => <ProcessSection key="sec-process" data={sec} />,
    'sec-featured': (sec) => <FeaturedLessonsSection key="sec-featured" data={sec} />,
    'sec-why': (sec) => <WhyUsSection key="sec-why" data={sec} />,
    'sec-testimonials': (sec) => <TestimonialsSection key="sec-testimonials" data={sec} />,
    'sec-merch': (sec) => <MerchSection key="sec-merch" data={sec} />,
    'sec-cta': (sec) => <CtaSection key="sec-cta" data={sec} />,
  };

  const sortedEnabledSections = [...cmsSections]
    .filter((sec) => sec.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950">
      <main className="flex-1">
        {sortedEnabledSections.map((sec) => (sectionMap[sec.id] ? sectionMap[sec.id](sec) : null))}
      </main>
      <PublicFooter />
    </div>
  );
}
