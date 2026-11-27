'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { formatCurrency } from '@/lib/utils';
import { Coupon } from '@/lib/types';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Check,
  Percent,
  Save,
  Info,
  X,
  Copy,
  Pencil,
  Smartphone,
} from 'lucide-react';

export default function AdminBillingsPage() {
  const {
    deliveryFees,
    coupons,
    platformSettings,
    updatePlatformSettings,
    updateDeliveryFees,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useStore();

  // --- Section 1: bKash Number & Delivery Fees State ---
  const [bKashNumber, setBKashNumber] = useState<string>(platformSettings?.bKashNumber || '01711-000000');
  const [insideDhaka, setInsideDhaka] = useState<number>(deliveryFees?.insideDhaka ?? 80);
  const [outsideDhaka, setOutsideDhaka] = useState<number>(deliveryFees?.outsideDhaka ?? 150);
  const [isSavingFees, setIsSavingFees] = useState(false);
  const [feesSavedSuccess, setFeesSavedSuccess] = useState(false);

  useEffect(() => {
    if (deliveryFees) {
      setInsideDhaka(deliveryFees.insideDhaka);
      setOutsideDhaka(deliveryFees.outsideDhaka);
    }
  }, [deliveryFees]);

  useEffect(() => {
    if (platformSettings?.bKashNumber) {
      setBKashNumber(platformSettings.bKashNumber);
    }
  }, [platformSettings?.bKashNumber]);

  const handleSaveDeliveryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFees(true);
    setFeesSavedSuccess(false);
    
    // Save bKash receiver number site-wide
    updatePlatformSettings({ bKashNumber: bKashNumber.trim() });
    
    await updateDeliveryFees({
      insideDhaka: Number(insideDhaka) || 0,
      outsideDhaka: Number(outsideDhaka) || 0,
    });
    
    setIsSavingFees(false);
    setFeesSavedSuccess(true);
    setTimeout(() => setFeesSavedSuccess(false), 3500);
  };

  // --- Section 2: Coupons State ---
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(10);
  const [newMinOrderAmount, setNewMinOrderAmount] = useState<string>('500');
  const [newMaxDiscount, setNewMaxDiscount] = useState<string>('500');
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');
  const [newUsageLimit, setNewUsageLimit] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [couponError, setCouponError] = useState('');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    if (!newCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    if (newDiscountValue <= 0) {
      setCouponError('Discount value must be greater than 0.');
      return;
    }

    setIsCreatingCoupon(true);
    const res = await createCoupon({
      code: newCode.trim().toUpperCase(),
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue),
      minOrderAmount: newMinOrderAmount ? Number(newMinOrderAmount) : undefined,
      maxDiscount: newDiscountType === 'percentage' && newMaxDiscount ? Number(newMaxDiscount) : undefined,
      isActive: true,
      expiryDate: newExpiryDate || undefined,
      usageLimit: newUsageLimit ? Number(newUsageLimit) : undefined,
      description: newDescription.trim() || undefined,
    });
    setIsCreatingCoupon(false);

    if (res.success) {
      setShowCreateCouponModal(false);
      setNewCode('');
      setNewDiscountType('percentage');
      setNewDiscountValue(10);
      setNewMinOrderAmount('500');
      setNewMaxDiscount('500');
      setNewExpiryDate('');
      setNewUsageLimit('');
      setNewDescription('');
    } else {
      setCouponError(res.error || 'Failed to create coupon.');
    }
  };

  // Edit Coupon State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscountType, setEditDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [editDiscountValue, setEditDiscountValue] = useState<number>(10);
  const [editMinOrderAmount, setEditMinOrderAmount] = useState<string>('');
  const [editMaxDiscount, setEditMaxDiscount] = useState<string>('');
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editUsageLimit, setEditUsageLimit] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditCode(coupon.code);
    setEditDiscountType(coupon.discountType);
    setEditDiscountValue(coupon.discountValue);
    setEditMinOrderAmount(coupon.minOrderAmount ? String(coupon.minOrderAmount) : '');
    setEditMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : '');
    setEditExpiryDate(coupon.expiryDate || '');
    setEditUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setEditDescription(coupon.description || '');
    setEditIsActive(coupon.isActive);
    setEditError('');
  };

  const handleSaveEditedCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setEditError('');

    if (!editCode.trim()) {
      setEditError('Please enter a coupon code.');
      return;
    }
    if (editDiscountValue <= 0) {
      setEditError('Discount value must be greater than 0.');
      return;
    }

    setIsSavingEdit(true);
    const res = await updateCoupon(editingCoupon.id, {
      code: editCode.trim().toUpperCase(),
      discountType: editDiscountType,
      discountValue: Number(editDiscountValue),
      minOrderAmount: editMinOrderAmount ? Number(editMinOrderAmount) : undefined,
      maxDiscount: editDiscountType === 'percentage' && editMaxDiscount ? Number(editMaxDiscount) : undefined,
      expiryDate: editExpiryDate || undefined,
      usageLimit: editUsageLimit ? Number(editUsageLimit) : undefined,
      description: editDescription.trim() || undefined,
      isActive: editIsActive,
    });
    setIsSavingEdit(false);

    if (res.success) {
      setEditingCoupon(null);
    } else {
      setEditError(res.error || 'Failed to update coupon.');
    }
  };

  const copyCouponCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedCouponId(coupon.id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Billings & Coupons"
        subtitle="Manage bKash receiver settings, delivery zone fees, & promotional coupon codes."
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 max-w-[1440px] mx-auto">
        {/* Navigation jump pills */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#section-delivery-fees"
            className="px-4 py-2.5 rounded-xl luxury-btn-ghost text-xs font-semibold text-zinc-200 hover:text-amber-300 flex items-center gap-2"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>1. bKash &amp; Delivery Fees</span>
          </a>
          <a
            href="#section-coupons"
            className="px-4 py-2.5 rounded-xl luxury-btn-ghost text-xs font-semibold text-zinc-200 hover:text-amber-300 flex items-center gap-2"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Promotional Coupons</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] tabular-nums">
              {coupons.length}
            </span>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: BKASH RECEIVER & DELIVERY FEE MANAGEMENT                        */}
        {/* ========================================================================= */}
        <section
          id="section-delivery-fees"
          className="p-4 sm:p-6 lg:p-8 rounded-3xl portal-surface space-y-5 sm:space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div className="space-y-1.5">
              <div className="eyebrow-pill">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Payment &amp; Delivery Sync</span>
              </div>
              <h2 className="portal-heading text-2xl sm:text-3xl text-white">
                bKash Receiver &amp; Delivery Rates
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                Set academy bKash merchant number and delivery fees. Changes sync live to checkout and FAQ.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Synced to Checkout</span>
            </div>
          </div>

          <form onSubmit={handleSaveDeliveryFees} className="space-y-6">
            {/* Academy bKash Receiver Phone Number */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Academy bKash Merchant / Personal Receiver Number</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium">Checkout Synced</span>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                  bKash Account Number *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={bKashNumber}
                    onChange={(e) => setBKashNumber(e.target.value)}
                    placeholder="e.g. 01711-000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                Students and customers will complete their bKash Send Money / Merchant payments to this exact number during checkout.
              </p>
            </div>

            {/* Delivery Rates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inside Dhaka */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Inside Dhaka Zone
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Metro Delivery</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Delivery Charge (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-500 font-mono text-sm">৳</span>
                    <input
                      type="number"
                      min={0}
                      value={insideDhaka}
                      onChange={(e) => setInsideDhaka(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Applied when students select <span className="text-white font-semibold">Inside Dhaka</span> at checkout.
                </p>
              </div>

              {/* Outside Dhaka */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Outside Dhaka Zone
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Nationwide Courier</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1.5">
                    Delivery Charge (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-500 font-mono text-sm">৳</span>
                    <input
                      type="number"
                      min={0}
                      value={outsideDhaka}
                      onChange={(e) => setOutsideDhaka(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Applied when students select <span className="text-white font-semibold">Outside Dhaka</span> at checkout.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Any changes saved here will be reflected instantly for all students during checkout.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {feesSavedSuccess && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Rates & bKash Synced Live!
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSavingFees}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingFees ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save bKash &amp; Delivery Rates</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: PROMOTIONAL COUPON CODES                                        */}
        {/* ========================================================================= */}
        <section
          id="section-coupons"
          className="p-4 sm:p-6 lg:p-8 rounded-3xl portal-surface space-y-5 sm:space-y-6 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-[11px] font-mono font-semibold uppercase tracking-[0.14em]">
                <Tag className="w-3.5 h-3.5" />
                <span>Discounts &amp; Coupons</span>
              </div>
              <h2 className="portal-heading text-2xl sm:text-3xl text-white">
                Promotional Coupon Codes
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                Offer percentage (%) or fixed amount (৳) discounts on official gear &amp; merchandise.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateCouponModal(true)}
              className="h-11 px-5 rounded-xl luxury-btn-primary font-bold text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Coupon</span>
            </button>
          </div>

          {/* Coupon List */}
          {coupons.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Coupons Created Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Click &quot;Create New Coupon&quot; to offer discounts for masterclass students and fans.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const isPercentage = coupon.discountType === 'percentage';
                const isCopied = copiedCouponId === coupon.id;

                return (
                  <div
                    key={coupon.id}
                    className={`p-5 rounded-2xl border transition space-y-4 flex flex-col justify-between ${
                      coupon.isActive
                        ? 'bg-zinc-950/90 border-zinc-800 hover:border-amber-500/40 shadow-xl'
                        : 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Code Badge & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono font-extrabold text-sm tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCouponCode(coupon)}
                            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                            title="Copy code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            coupon.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Discount Value */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-mono">
                          {isPercentage ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold uppercase font-mono">
                          {isPercentage ? 'Discount' : 'Flat Off'}
                        </span>
                      </div>

                      {/* Description */}
                      {coupon.description && (
                        <p className="text-xs text-zinc-300 leading-relaxed">{coupon.description}</p>
                      )}

                      {/* Conditions */}
                      <div className="space-y-1 text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/80">
                        {coupon.minOrderAmount ? (
                          <div className="flex justify-between">
                            <span>Min Order:</span>
                            <span className="text-zinc-200">৳{coupon.minOrderAmount}</span>
                          </div>
                        ) : null}

                        {isPercentage && coupon.maxDiscount ? (
                          <div className="flex justify-between">
                            <span>Max Cap:</span>
                            <span className="text-zinc-200">৳{coupon.maxDiscount}</span>
                          </div>
                        ) : null}

                        {coupon.expiryDate ? (
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span className="text-amber-400/90">{coupon.expiryDate}</span>
                          </div>
                        ) : null}

                        <div className="flex justify-between items-center">
                          <span>Usages / Limit:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">
                              {coupon.usageCount || 0}
                              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                            </span>
                            {coupon.usageLimit ? (
                              (coupon.usageCount || 0) >= coupon.usageLimit ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                                  Limit Reached
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  ({coupon.usageLimit - (coupon.usageCount || 0)} left)
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                (Unlimited)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            coupon.isActive
                              ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCoupon(coupon)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Edit coupon details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete coupon code "${coupon.code}"?`)) {
                            deleteCoupon(coupon.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* --- CREATE COUPON MODAL --- */}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg luxury-glass gold-border-glow rounded-3xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 pb-5 border-b border-white/[0.08] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5">
                <div className="eyebrow-pill">
                  <Tag className="w-3.5 h-3.5" />
                  <span>New Promotion</span>
                </div>
                <h3 className="portal-heading text-2xl sm:text-3xl text-white">Create Coupon Code</h3>
                <p className="text-xs text-zinc-400">
                  Define discount values, minimum order thresholds, and expiration dates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCouponModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {couponError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                {/* Code */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CHORD10 or CRAFT200"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewDiscountType('percentage')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        newDiscountType === 'percentage'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Percentage (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewDiscountType('fixed')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        newDiscountType === 'fixed'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-sm">৳</span>
                      <span>Fixed Amount (৳)</span>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {newDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount Amount (৳ BDT) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono">
                      {newDiscountType === 'percentage' ? '%' : '৳'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={newDiscountType === 'percentage' ? 100 : undefined}
                      value={newDiscountValue}
                      onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Min Order & Max Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Order Amount (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newMinOrderAmount}
                      onChange={(e) => setNewMinOrderAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {newDiscountType === 'percentage' && (
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Max Discount Cap (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newMaxDiscount}
                        onChange={(e) => setNewMaxDiscount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Expiration Date & Usages Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Usages Number (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newUsageLimit}
                      onChange={(e) => setNewUsageLimit(e.target.value)}
                      placeholder="e.g. 50 (Unlimited)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                      No value means Unlimited uses
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. 10% off for new guitar students"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateCouponModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCoupon}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isCreatingCoupon ? 'Creating...' : 'Create & Activate Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT COUPON MODAL --- */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg luxury-glass gold-border-glow rounded-3xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 pb-5 border-b border-white/[0.08] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5">
                <div className="eyebrow-pill">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Promotion</span>
                </div>
                <h3 className="portal-heading text-2xl sm:text-3xl text-white">
                  Edit Coupon: <span className="text-amber-300 font-mono text-xl">{editingCoupon.code}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Modify discount rate, minimum order conditions, or status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {editError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditedCoupon} className="space-y-4 text-xs">
                {/* Code */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('percentage')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editDiscountType === 'percentage'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Percentage (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditDiscountType('fixed')}
                      className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        editDiscountType === 'fixed'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-sm">৳</span>
                      <span>Fixed Amount (৳)</span>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {editDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount Amount (৳ BDT) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono">
                      {editDiscountType === 'percentage' ? '%' : '৳'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={editDiscountType === 'percentage' ? 100 : undefined}
                      value={editDiscountValue}
                      onChange={(e) => setEditDiscountValue(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Min Order & Max Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Order Amount (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editMinOrderAmount}
                      onChange={(e) => setEditMinOrderAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {editDiscountType === 'percentage' && (
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Max Discount Cap (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editMaxDiscount}
                        onChange={(e) => setEditMaxDiscount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Expiration Date & Usages Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Usages Number (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editUsageLimit}
                      onChange={(e) => setEditUsageLimit(e.target.value)}
                      placeholder="e.g. 50 (Unlimited)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                      No value means Unlimited uses
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Coupon Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="e.g. 10% off for new guitar students"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Status Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/20 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-zinc-300">
                      Coupon is currently active & redeemable
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingCoupon(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Coupon Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
