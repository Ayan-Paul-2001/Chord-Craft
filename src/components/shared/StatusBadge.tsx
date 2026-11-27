import React from 'react';
import { Lock, CheckCircle2, Clock, AlertCircle, Truck, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'lesson' | 'attendance' | 'order' | 'payment' | 'level' | 'default';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] font-medium'
      : 'px-3 py-1 text-[11px] font-semibold tracking-wide';

  let colorStyle = 'bg-white/[0.05] text-zinc-300 border-white/[0.1]';
  let icon = null;

  const s = status.toLowerCase();

  if (s === 'locked') {
    colorStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/25';
    icon = <Lock className="w-3 h-3 mr-1.5 shrink-0" />;
  } else if (
    s === 'unlocked' ||
    s === 'active' ||
    s === 'approved' ||
    s === 'present' ||
    s === 'verified' ||
    s === 'delivered' ||
    s === 'confirmed'
  ) {
    colorStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    icon = <CheckCircle2 className="w-3 h-3 mr-1.5 shrink-0" />;
  } else if (s === 'completed') {
    colorStyle = 'bg-amber-500/15 text-amber-200 border-amber-400/35';
    icon = <CheckCircle2 className="w-3 h-3 mr-1.5 shrink-0 text-amber-300" />;
  } else if (s === 'in progress' || s === 'processing' || s === 'shipped') {
    colorStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    icon =
      s === 'shipped' ? (
        <Truck className="w-3 h-3 mr-1.5 shrink-0" />
      ) : (
        <Clock className="w-3 h-3 mr-1.5 shrink-0" />
      );
  } else if (s === 'pending' || s === 'pending approval' || s === 'waiting' || s === 'late') {
    colorStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    icon = <Clock className="w-3 h-3 mr-1.5 shrink-0" />;
  } else if (
    s === 'rejected' ||
    s === 'denied' ||
    s === 'absent' ||
    s === 'cancelled' ||
    s === 'inactive' ||
    s === 'failed'
  ) {
    colorStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/25';
    icon = <Ban className="w-3 h-3 mr-1.5 shrink-0" />;
  } else if (s === 'excused') {
    colorStyle = 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    icon = <AlertCircle className="w-3 h-3 mr-1.5 shrink-0" />;
  } else if (s === 'beginner') {
    colorStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 font-mono uppercase text-[10px] tracking-wider';
  } else if (s === 'intermediate') {
    colorStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/25 font-mono uppercase text-[10px] tracking-wider';
  } else if (s === 'advanced') {
    colorStyle = 'bg-violet-500/10 text-violet-300 border-violet-500/25 font-mono uppercase text-[10px] tracking-wider';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${sizeClasses} ${colorStyle}`}
    >
      {icon}
      {status}
    </span>
  );
};
