import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  HelpCircle,
  PackageCheck,
  Share2,
  Search,
  Sparkles,
  Gift,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { CampusItem, ItemCategory, ItemType } from '../types';

interface ItemCardProps {
  item: CampusItem;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const typeConfig: Record<ItemType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    lost: {
      label: 'Lost Item',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    found: {
      label: 'Found Item',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    lend: {
      label: 'Available to Borrow',
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      icon: <Share2 className="w-3.5 h-3.5" />,
    },
    borrow_request: {
      label: 'Borrow Request',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Search className="w-3.5 h-3.5" />,
    },
  };

  const statusConfig = {
    open: { label: 'Active', bg: 'bg-emerald-100 text-emerald-800' },
    pending: { label: 'Under Review', bg: 'bg-amber-100 text-amber-800' },
    claimed: { label: 'Claimed', bg: 'bg-blue-100 text-blue-800' },
    borrowed: { label: 'Borrowed', bg: 'bg-purple-100 text-purple-800' },
    returned: { label: 'Returned', bg: 'bg-slate-100 text-slate-700' },
    closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-500' },
  };

  const categoryLabels: Record<ItemCategory, string> = {
    electronics: 'Electronics',
    books: 'Books & Notes',
    clothing: 'Clothing & Gear',
    id_cards: 'IDs & Cards',
    keys: 'Keys & Badges',
    accessories: 'Accessories',
    sports: 'Sports & Rec',
    lab_equipment: 'Lab Equipment',
    other: 'Other Item',
  };

  const fallbackCategoryImages: Record<ItemCategory, string> = {
    electronics: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    id_cards: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    accessories: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    lab_equipment: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    other: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
  };

  const currentType = typeConfig[item.type] || typeConfig.lost;
  const currentStatus = statusConfig[item.status] || statusConfig.open;
  const displayImage = item.imageUrl || fallbackCategoryImages[item.category] || fallbackCategoryImages.other;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Top Image Preview & Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackCategoryImages[item.category] || fallbackCategoryImages.other;
          }}
        />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-xs border ${currentType.bg} ${currentType.text} ${currentType.border}`}
          >
            {currentType.icon}
            <span>{currentType.label}</span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs ${currentStatus.bg}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* Reward or Security Question tag */}
        {item.reward && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
              <Gift className="w-3 h-3" />
              <span>Reward: {item.reward}</span>
            </span>
          </div>
        )}

        {item.type === 'found' && item.securityQuestion && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Protected Claim</span>
            </span>
          </div>
        )}

        {item.type === 'lend' && item.borrowDurationDays && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-900/85 text-violet-100 backdrop-blur-xs">
              <Clock className="w-3 h-3" />
              <span>Up to {item.borrowDurationDays} days</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded-md">
              {categoryLabels[item.category] || item.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              {item.date || 'Recent'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            {item.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {/* Campus Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{item.location}</span>
          </div>
        </div>

        {/* Footer: Poster Info & CTA preview */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={item.userPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.userId}`}
              alt={item.userDisplayName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
              {item.userDisplayName}
            </span>
          </div>

          <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
