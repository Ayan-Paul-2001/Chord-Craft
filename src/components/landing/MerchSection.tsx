'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowRight, Check, Sparkles } from 'lucide-react';
import { HomepageSection, Product } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const MerchSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { products, addToCart } = useStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const sectionTitle = data?.title?.trim() || 'Chord & Craft Merchandise';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const sectionEyebrow = !rawSubtitle || isLongSubtitle ? 'Atelier Store' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const sectionBody =
    data?.content?.trim() ||
    'Signature beveled pick packs, heritage leather straps, Harmonic Guitar Academy hoodies, & hardcover notation workbooks.';
  const ctaText = data?.buttonText?.trim() || 'Browse Full Catalog';
  const ctaLink = data?.buttonLink?.trim() || '/merchandise';
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');

  const featuredMerch = products.slice(0, 3);

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  return (
    <section id="merchandise" className="py-16 sm:py-24 lg:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-5 sm:gap-6 text-center md:text-left">
          <div className="space-y-4 max-w-2xl mx-auto md:mx-0">
            <div className="eyebrow-pill mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <RichCmsText text={sectionEyebrow} />
              </span>
            </div>
            <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1]`}>
              <RichCmsText text={sectionTitle} />
            </h2>
            {leadSubtitle && (
              <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed">
                <RichCmsText text={leadSubtitle} />
              </p>
            )}
            <p className={`${bodyFontClass} text-zinc-400 text-sm sm:text-base leading-relaxed`}>
              <RichCmsText text={sectionBody} />
            </p>
          </div>

          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl luxury-btn-ghost text-amber-300 font-bold text-xs tracking-wide self-center md:self-auto"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {featuredMerch.map((product) => {
            const isAdded = !!addedIds[product.id];
            return (
              <div
                key={product.id}
                className="rounded-2xl sm:rounded-3xl luxury-card overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-950">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12]/70 via-transparent to-transparent" />
                    <div className="absolute top-3.5 right-3.5 bg-[#0b0a0e]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-300 border border-white/[0.1]">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-2 sm:space-y-2.5">
                    <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                      {product.description}
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-bold text-amber-300 tabular-nums pt-1 sm:pt-2">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 pt-0 flex items-center gap-2.5 sm:gap-3">
                  <Link
                    href={`/merchandise/${product.id}`}
                    className="flex-1 py-2 sm:py-2.5 rounded-xl luxury-btn-ghost text-zinc-200 text-center font-semibold text-[11.5px] sm:text-xs"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(product)}
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11.5px] sm:text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-950/50'
                        : 'luxury-btn-primary'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    <span>{isAdded ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
