'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { HomepageSection, LegalPolicies, CmsFontKey } from '@/lib/types';
import { getCmsFontClass, stripCmsMarkers } from '@/lib/cmsFonts';
import { RichCmsText, RichPolicyBody } from '@/components/shared/RichCmsText';
import { CmsRichField, CmsFontPicker } from '@/components/admin/CmsRichField';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  FileText,
  ShieldCheck,
  Scale,
  Smartphone,
  CheckCircle2,
  Star,
  RotateCcw,
  LayoutTemplate,
  Link2,
  Type,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  isCloudinaryUrl,
} from '@/lib/uploadClient';

interface SectionMeta {
  name: string;
  supportsImage: boolean;
  supportsButton: boolean;
  hint: string;
}

const SECTION_META: Record<string, SectionMeta> = {
  'sec-hero': {
    name: 'Hero Banner',
    supportsImage: true,
    supportsButton: true,
    hint: 'Primary headline, lead paragraph, studio video poster image, caption & primary CTA.',
  },
  'sec-about': {
    name: 'Academy Philosophy',
    supportsImage: true,
    supportsButton: false,
    hint: 'Eyebrow pill, philosophy headline, editorial narrative, and studio showcase image.',
  },
  'sec-instructor': {
    name: 'Lead Mentor Spotlight',
    supportsImage: true,
    supportsButton: true,
    hint: 'Mentor bio, portrait photograph, eyebrow label, and optional spotlight CTA.',
  },
  'sec-courses': {
    name: 'Signature Courses Showcase',
    supportsImage: false,
    supportsButton: true,
    hint: 'Courses section heading, eyebrow label, enrollment overview copy, and primary action CTA.',
  },
  'sec-process': {
    name: '4-Stage Curriculum Roadmap',
    supportsImage: false,
    supportsButton: false,
    hint: 'Roadmap eyebrow pill, headline, and curriculum overview paragraph.',
  },
  'sec-featured': {
    name: 'Featured Lessons Showcase',
    supportsImage: false,
    supportsButton: true,
    hint: 'Section heading, demo lessons intro copy, and full library CTA button.',
  },
  'sec-why': {
    name: 'Platform Benefits',
    supportsImage: false,
    supportsButton: false,
    hint: 'Benefits eyebrow label, headline, and conservatory value statement.',
  },
  'sec-testimonials': {
    name: 'Student Reviews Showcase',
    supportsImage: false,
    supportsButton: false,
    hint: 'Testimonials heading, eyebrow pill, and community intro paragraph.',
  },
  'sec-merch': {
    name: 'Atelier Merchandise Store',
    supportsImage: false,
    supportsButton: true,
    hint: 'Storefront heading, gear intro copy, and catalog link button.',
  },
  'sec-cta': {
    name: 'Final Enrollment CTA',
    supportsImage: false,
    supportsButton: true,
    hint: 'Bottom conversion card eyebrow, display headline, body text, and enrollment CTA.',
  },
};

const getSectionMeta = (id: string): SectionMeta =>
  SECTION_META[id] || {
    name: id,
    supportsImage: true,
    supportsButton: true,
    hint: 'Customize heading, copy, typography, media, and action link for this homepage block.',
  };

export default function AdminCmsPage() {
  const {
    cmsSections,
    updateCmsSection,
    toggleCmsSection,
    moveCmsSection,
    legalPolicies,
    updateLegalPolicy,
    reviews,
    deleteReview,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'homepage' | 'reviews' | 'policies'>('homepage');
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<keyof LegalPolicies>('privacyPolicy');
  const [policyPreviewMode, setPolicyPreviewMode] = useState<'write' | 'preview'>('write');

  const sortedSections = useMemo(
    () => [...cmsSections].sort((a, b) => a.order - b.order),
    [cmsSections]
  );

  const enabledCount = sortedSections.filter((s) => s.enabled).length;

  // Selected CMS Section Editor states (split-pane live editor)
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sortedSections[0]?.id || 'sec-hero'
  );
  const selectedSection =
    sortedSections.find((s) => s.id === selectedSectionId) || sortedSections[0] || null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [titleFont, setTitleFont] = useState<CmsFontKey>('default');
  const [bodyFont, setBodyFont] = useState<CmsFontKey>('default');
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [sectionSaved, setSectionSaved] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);

  // Sync editor inputs whenever selected section changes or DB finishes hydrating
  useEffect(() => {
    if (selectedSection) {
      setTitle(selectedSection.title || '');
      setSubtitle(selectedSection.subtitle || '');
      setContent(selectedSection.content || '');
      setImageUrl(selectedSection.imageUrl || '');
      setButtonText(selectedSection.buttonText || '');
      setButtonLink(selectedSection.buttonLink || '');
      setTitleFont(selectedSection.titleFont || 'default');
      setBodyFont(selectedSection.bodyFont || 'default');
      setUploadError('');
      setSectionSaved(false);
    }
  }, [
    selectedSection?.id,
    selectedSection?.title,
    selectedSection?.subtitle,
    selectedSection?.content,
    selectedSection?.imageUrl,
    selectedSection?.buttonText,
    selectedSection?.buttonLink,
    selectedSection?.titleFont,
    selectedSection?.bodyFont,
  ]);

  const hasUnsavedSectionChanges = selectedSection
    ? title !== (selectedSection.title || '') ||
      subtitle !== (selectedSection.subtitle || '') ||
      content !== (selectedSection.content || '') ||
      imageUrl !== (selectedSection.imageUrl || '') ||
      buttonText !== (selectedSection.buttonText || '') ||
      buttonLink !== (selectedSection.buttonLink || '') ||
      titleFont !== (selectedSection.titleFont || 'default') ||
      bodyFont !== (selectedSection.bodyFont || 'default')
    : false;

  const handleSelectSection = (sec: HomepageSection) => {
    setSelectedSectionId(sec.id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        editorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleResetSectionForm = () => {
    if (!selectedSection) return;
    setTitle(selectedSection.title || '');
    setSubtitle(selectedSection.subtitle || '');
    setContent(selectedSection.content || '');
    setImageUrl(selectedSection.imageUrl || '');
    setButtonText(selectedSection.buttonText || '');
    setButtonLink(selectedSection.buttonLink || '');
    setTitleFont(selectedSection.titleFont || 'default');
    setBodyFont(selectedSection.bodyFont || 'default');
    setUploadError('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const res = await uploadImageToCloudinary(file, 'chord_and_craft/cms');
      if (res.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload section image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    setIsDeletingImage(true);
    setUploadError('');

    try {
      if (isCloudinaryUrl(imageUrl)) {
        await deleteImageFromCloudinary(imageUrl);
      }
      setImageUrl('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to delete section image from Cloudinary.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    setIsSavingSection(true);
    setSectionSaved(false);
    try {
      await updateCmsSection(selectedSection.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        titleFont,
        bodyFont,
      });
      setSectionSaved(true);
      setTimeout(() => setSectionSaved(false), 3000);
    } finally {
      setIsSavingSection(false);
    }
  };

  // Policy CMS Form states
  const currentPolicy = legalPolicies?.[selectedPolicyKey] || {
    title: '',
    subtitle: '',
    lastUpdated: 'November 2026',
    content: '',
    titleFont: 'default' as CmsFontKey,
    bodyFont: 'default' as CmsFontKey,
  };

  const [policyTitle, setPolicyTitle] = useState(currentPolicy.title);
  const [policySubtitle, setPolicySubtitle] = useState(currentPolicy.subtitle);
  const [policyLastUpdated, setPolicyLastUpdated] = useState(currentPolicy.lastUpdated);
  const [policyContent, setPolicyContent] = useState(currentPolicy.content);
  const [policyTitleFont, setPolicyTitleFont] = useState<CmsFontKey>(
    currentPolicy.titleFont || 'default'
  );
  const [policyBodyFont, setPolicyBodyFont] = useState<CmsFontKey>(
    currentPolicy.bodyFont || 'default'
  );
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);

  useEffect(() => {
    if (legalPolicies?.[selectedPolicyKey]) {
      const p = legalPolicies[selectedPolicyKey];
      setPolicyTitle(p.title);
      setPolicySubtitle(p.subtitle);
      setPolicyLastUpdated(p.lastUpdated);
      setPolicyContent(p.content);
      setPolicyTitleFont(p.titleFont || 'default');
      setPolicyBodyFont(p.bodyFont || 'default');
      setPolicySaved(false);
    }
  }, [selectedPolicyKey, legalPolicies]);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setPolicySaved(false);
    try {
      await updateLegalPolicy(selectedPolicyKey, {
        title: policyTitle.trim(),
        subtitle: policySubtitle.trim(),
        lastUpdated: policyLastUpdated.trim(),
        content: policyContent,
        titleFont: policyTitleFont,
        bodyFont: policyBodyFont,
      });
      setPolicySaved(true);
      setTimeout(() => setPolicySaved(false), 3000);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const policyPublicUrls: { [key in keyof LegalPolicies]: string } = {
    privacyPolicy: '/privacy-policy',
    termsOfService: '/terms-of-service',
    bkashFaq: '/bkash-faq',
  };

  const selectedMeta = selectedSection ? getSectionMeta(selectedSection.id) : null;
  const previewTitleFontClass = getCmsFontClass(titleFont, 'font-display');
  const previewBodyFontClass = getCmsFontClass(bodyFont, '');

  return (
    <div className="space-y-8 font-sans">
      <DashboardHeader
        title="Content Management System (CMS)"
        subtitle="Customize live landing page sections, typography, rich text formatting, and legal policy pages."
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-7 max-w-[1440px] mx-auto">
        {/* Top Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#0b0b10] border border-white/[0.08] w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('homepage')}
              className={`flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'homepage'
                  ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 shrink-0" />
              <span>Homepage Sections ({sortedSections.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Student Reviews ({reviews?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('policies')}
              className={`flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'policies'
                  ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Legal Policies &amp; FAQ</span>
            </button>
          </div>

          {activeTab === 'homepage' && (
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono tabular-nums w-fit">
              {enabledCount} / {sortedSections.length} Visible Live
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SPLIT-PANE HOMEPAGE CMS STUDIO                                     */}
        {/* ========================================================================= */}
        {activeTab === 'homepage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-portal-enter">
            {/* LEFT COLUMN: Ordered Homepage Sections List */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-3xl portal-surface space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div>
                  <h2 className="portal-heading text-2xl text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Page Architecture</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select any section to edit, style typography, toggle visibility, or reorder.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {sortedSections.map((sec, index) => {
                  const meta = getSectionMeta(sec.id);
                  const isSelected = selectedSection?.id === sec.id;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => handleSelectSection(sec)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/[0.1] border-amber-400/55 shadow-[0_0_24px_-10px_rgba(245,158,11,0.35)]'
                          : sec.enabled
                          ? 'bg-[#0b0b10]/90 border-white/[0.07] hover:border-white/[0.18]'
                          : 'bg-[#0b0b10]/40 border-white/[0.04] opacity-65 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Order Arrows */}
                        <div
                          className="flex flex-col gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => moveCmsSection(sec.id, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-md bg-white/[0.04] hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 disabled:opacity-25 transition cursor-pointer"
                            title="Move Up"
                            aria-label={`Move ${meta.name} up`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCmsSection(sec.id, 'down')}
                            disabled={index === sortedSections.length - 1}
                            className="p-1 rounded-md bg-white/[0.04] hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 disabled:opacity-25 transition cursor-pointer"
                            title="Move Down"
                            aria-label={`Move ${meta.name} down`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Section Number Pill */}
                        <span
                          className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                            isSelected
                              ? 'bg-amber-400 text-zinc-950'
                              : 'bg-white/[0.05] text-amber-300/90 border border-white/[0.07]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Section Info */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-amber-200' : 'text-white'
                            }`}
                          >
                            {meta.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {stripCmsMarkers(sec.title)}
                          </p>
                        </div>
                      </div>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCmsSection(sec.id);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                          sec.enabled
                            ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-zinc-200'
                        }`}
                        title={sec.enabled ? 'Click to hide from homepage' : 'Click to show on homepage'}
                      >
                        {sec.enabled ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {sec.enabled ? 'Visible' : 'Hidden'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Live Section Editor Studio */}
            <div ref={editorPanelRef} className="lg:col-span-7 lg:sticky lg:top-24">
              {selectedSection && selectedMeta ? (
                <div className="p-4 sm:p-6 lg:p-8 rounded-3xl portal-surface space-y-5 sm:space-y-6">
                  {/* Editor Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="eyebrow-pill">
                          <Sparkles className="w-3 h-3" />
                          <span>
                            Section #{sortedSections.findIndex((s) => s.id === selectedSection.id) + 1} • {selectedSection.id}
                          </span>
                        </span>
                        {hasUnsavedSectionChanges && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-[10px] font-mono font-semibold">
                            Unsaved Edits
                          </span>
                        )}
                      </div>
                      <h2 className="portal-heading text-2xl sm:text-3xl text-white">
                        {selectedMeta.name}
                      </h2>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {selectedMeta.hint}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCmsSection(selectedSection.id)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border shrink-0 ${
                        selectedSection.enabled
                          ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-400 border-white/[0.09]'
                      }`}
                    >
                      {selectedSection.enabled ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      <span>{selectedSection.enabled ? 'Visible Live' : 'Hidden'}</span>
                    </button>
                  </div>

                  {/* Live Visual Mini-Preview Card (renders real fonts & bold/italic/underline) */}
                  <div className="p-5 rounded-2xl bg-[#09090d] border border-white/[0.07] space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                      <span>Live Copy &amp; Typography Preview</span>
                      <span className="text-amber-400/90">Homepage Appearance</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 space-y-2.5 min-w-0">
                        {subtitle && (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-[11px] max-w-full ${
                              selectedSection.id === 'sec-hero'
                                ? `${previewBodyFontClass}`
                                : 'font-mono uppercase tracking-wider'
                            }`}
                          >
                            <RichCmsText text={subtitle} />
                          </span>
                        )}
                        <h3
                          className={`${previewTitleFontClass} text-2xl sm:text-[1.75rem] font-semibold text-white leading-tight`}
                        >
                          <RichCmsText text={title || 'Section Title Preview'} />
                        </h3>
                        <p
                          className={`${previewBodyFontClass} text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3`}
                        >
                          <RichCmsText text={content || 'Section body copy will render here.'} />
                        </p>
                        {selectedMeta.supportsButton && buttonText && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/35 text-amber-200 text-[11px] font-semibold">
                              <span>{buttonText}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedMeta.supportsImage && imageUrl && (
                        <img
                          src={imageUrl}
                          alt={stripCmsMarkers(title) || selectedMeta.name}
                          className="w-full sm:w-28 h-24 rounded-xl object-cover border border-white/[0.1] shrink-0 bg-zinc-900"
                        />
                      )}
                    </div>
                  </div>

                  {/* Section Edit Form */}
                  <form onSubmit={handleSaveSection} className="space-y-5">
                    {/* Typography Font Selectors */}
                    <div className="p-4 rounded-2xl bg-[#0b0b10] border border-white/[0.07] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-amber-400" />
                          <span>Section Typography</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Tip: Highlight text inside any field to apply Bold, Italic, Underline, Gold, or inline Fonts
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <CmsFontPicker
                          label="Headline Font"
                          value={titleFont}
                          onChange={setTitleFont}
                        />
                        <CmsFontPicker
                          label="Body & Subtitle Font"
                          value={bodyFont}
                          onChange={setBodyFont}
                        />
                      </div>
                    </div>

                    <CmsRichField
                      id="cms-section-title"
                      label={
                        <>
                          <Type className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            Section Headline / Title <span className="text-amber-400">*</span>
                          </span>
                        </>
                      }
                      value={title}
                      onChange={setTitle}
                      placeholder="Enter section headline..."
                      required
                      inputClassName="font-medium"
                    />

                    <CmsRichField
                      id="cms-section-subtitle"
                      label={
                        selectedSection.id === 'sec-hero'
                          ? 'Hero Lead Subtitle'
                          : 'Eyebrow Badge / Subtitle'
                      }
                      value={subtitle}
                      onChange={setSubtitle}
                      placeholder="Short eyebrow label or lead subtitle..."
                    />

                    <CmsRichField
                      id="cms-section-content"
                      label={
                        <>
                          {selectedSection.id === 'sec-hero'
                            ? 'Showcase Card Caption / Body Copy'
                            : 'Section Content Body'}{' '}
                          <span className="text-amber-400">*</span>
                        </>
                      }
                      value={content}
                      onChange={setContent}
                      multiline
                      rows={4}
                      placeholder="Write compelling conservatory copy for this section..."
                      required
                    />

                    {/* Button Copy & Link (when supported by this section) */}
                    {selectedMeta.supportsButton && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-2">
                          <label
                            htmlFor="cms-btn-text"
                            className="block text-xs font-medium text-zinc-200"
                          >
                            CTA Button Label
                          </label>
                          <input
                            id="cms-btn-text"
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="e.g. Explore Curriculum"
                            className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="cms-btn-link"
                            className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                          >
                            <Link2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>CTA Button Link</span>
                          </label>
                          <input
                            id="cms-btn-link"
                            type="text"
                            value={buttonLink}
                            onChange={(e) => setButtonLink(e.target.value)}
                            placeholder="e.g. #curriculum or /signup"
                            className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Section Image Upload (for image-enabled sections) */}
                    {selectedMeta.supportsImage && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-zinc-200">
                            Section Visual Image (Cloudinary)
                          </label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isUploadingImage}
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg luxury-btn-ghost text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Image</span>
                                </>
                              )}
                            </button>

                            {imageUrl && (
                              <button
                                type="button"
                                disabled={isDeletingImage || isUploadingImage}
                                onClick={handleRemoveImage}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {isDeletingImage ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>{isDeletingImage ? 'Removing...' : 'Remove'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Section Preview"
                              className="w-12 h-12 rounded-xl object-cover border border-amber-400/30 shrink-0 bg-zinc-900"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#09090d] border border-white/[0.09] flex items-center justify-center text-zinc-600 shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                            className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-xs"
                          />
                        </div>

                        {uploadError && (
                          <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs">
                        {sectionSaved ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1.5 animate-fade-in">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Saved &amp; live on homepage!</span>
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono text-[11px]">
                            Changes sync directly to MongoDB
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
                        {hasUnsavedSectionChanges && (
                          <button
                            type="button"
                            onClick={handleResetSectionForm}
                            className="h-11 px-4 rounded-xl luxury-btn-ghost text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={isSavingSection}
                          className="flex-1 sm:flex-initial h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isSavingSection ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : sectionSaved ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Published Live</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save &amp; Publish Section</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENT REVIEWS MANAGEMENT                                         */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-portal-enter">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.08] border border-amber-400/25 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Student Reviews Showcase:</span> All student feedback and star ratings submitted from the student portal appear live in the animated marquee on the landing page.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs tabular-nums">
                  {reviews?.length || 0} Reviews
                </span>
                <Link
                  href="/admin/reviews"
                  className="px-3.5 py-1.5 rounded-xl luxury-btn-ghost text-amber-300 font-semibold text-xs"
                >
                  Full Moderation →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl portal-surface flex flex-col justify-between space-y-5 relative"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="text-xs font-mono font-bold text-zinc-400 ml-1.5 tabular-nums">
                          {rev.rating}.0 / 5.0
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the review by "${rev.name}"?`)) {
                            deleteReview(rev.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-display text-lg text-zinc-200 italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                        {rev.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </h4>
                      <p className="text-[11px] text-amber-300 font-mono truncate">{rev.level}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{rev.studentEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LEGAL POLICIES & FAQ CMS (MONGODB PERSISTED + RICH TEXT + PREVIEW) */}
        {/* ========================================================================= */}
        {activeTab === 'policies' && (
          <div className="space-y-6 animate-portal-enter">
            {/* Policy Selector Bar (Clean — Live Preview replaces Open Live Page) */}
            <div className="flex flex-wrap items-center gap-2 p-4 sm:p-5 rounded-2xl portal-surface">
              {(
                [
                  { key: 'privacyPolicy', label: 'Privacy Policy', icon: ShieldCheck },
                  { key: 'termsOfService', label: 'Terms of Service', icon: Scale },
                  { key: 'bkashFaq', label: 'bKash Payment FAQ', icon: Smartphone },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = selectedPolicyKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedPolicyKey(item.key)}
                    className={`h-10 px-4 rounded-xl font-semibold text-xs transition flex items-center gap-2 cursor-pointer border ${
                      active
                        ? 'bg-amber-500/18 text-amber-200 border-amber-400/40'
                        : 'bg-[#09090d] text-zinc-400 hover:text-white border-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Policy Editor Card */}
            <form onSubmit={handleSavePolicy} className="p-4 sm:p-6 lg:p-8 rounded-3xl portal-surface space-y-5 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
                <div>
                  <h3 className="portal-heading text-2xl sm:text-3xl text-white flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>{stripCmsMarkers(policyTitle || currentPolicy.title)}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Updates persist to MongoDB and publish immediately to {policyPublicUrls[selectedPolicyKey]}.
                  </p>
                </div>

                {/* Write / Live Preview Toggle */}
                <div className="flex p-1 rounded-xl bg-[#09090d] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPolicyPreviewMode('write')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      policyPreviewMode === 'write'
                        ? 'bg-amber-500/18 text-amber-200'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Edit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicyPreviewMode('preview')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      policyPreviewMode === 'preview'
                        ? 'bg-amber-500/18 text-amber-200'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>

              {policyPreviewMode === 'write' ? (
                <div className="space-y-5">
                  {/* Policy Typography Controls */}
                  <div className="p-4 rounded-2xl bg-[#0b0b10] border border-white/[0.07] space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-amber-400" />
                        <span>Page Typography</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Use the toolbar on any field for Bold, Italic, Underline, Gold, or inline Fonts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CmsFontPicker
                        label="Headings Font"
                        value={policyTitleFont}
                        onChange={setPolicyTitleFont}
                      />
                      <CmsFontPicker
                        label="Body Copy Font"
                        value={policyBodyFont}
                        onChange={setPolicyBodyFont}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                    <CmsRichField
                      label={
                        <>
                          Page Main Title <span className="text-amber-400">*</span>
                        </>
                      }
                      value={policyTitle}
                      onChange={setPolicyTitle}
                      required
                      inputClassName="font-semibold"
                    />

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-200">
                        Last Updated Display (e.g. November 2026)
                      </label>
                      <input
                        type="text"
                        value={policyLastUpdated}
                        onChange={(e) => setPolicyLastUpdated(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <CmsRichField
                    label="Page Subtitle / Overview"
                    value={policySubtitle}
                    onChange={setPolicySubtitle}
                    placeholder="Concise policy summary..."
                  />

                  <CmsRichField
                    label={
                      <>
                        Policy Body Content <span className="text-amber-400">*</span>
                      </>
                    }
                    value={policyContent}
                    onChange={setPolicyContent}
                    multiline
                    rows={15}
                    required
                    enableMarkdownBlocks
                    helperText="Supports ### Headings, - Bullets, Bold, Italic, Underline, Gold & Fonts"
                    inputClassName="font-mono text-xs text-zinc-200"
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#09090d] border border-white/[0.08] space-y-6">
                  <div className="border-b border-white/[0.07] pb-5 space-y-2">
                    <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider">
                      Last Updated: {policyLastUpdated}
                    </span>
                    <h4
                      className={`${getCmsFontClass(
                        policyTitleFont,
                        'font-display'
                      )} text-3xl sm:text-4xl font-semibold text-white`}
                    >
                      <RichCmsText text={policyTitle} />
                    </h4>
                    <p
                      className={`${getCmsFontClass(
                        policyBodyFont,
                        ''
                      )} text-sm sm:text-base text-zinc-400`}
                    >
                      <RichCmsText text={policySubtitle} />
                    </p>
                  </div>

                  <RichPolicyBody
                    content={policyContent}
                    titleFont={policyTitleFont}
                    bodyFont={policyBodyFont}
                    variant="preview"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div>
                  {policySaved && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Policy synced to MongoDB &amp; published live!</span>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSavingPolicy}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingPolicy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Publish Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
