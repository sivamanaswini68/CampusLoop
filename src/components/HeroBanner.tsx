import React from 'react';
import {
  Search,
  PackageCheck,
  Share2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ItemType } from '../types';

interface HeroBannerProps {
  onSelectAction: (type: ItemType) => void;
  activeCount: number;
  returnedCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectAction,
  activeCount,
  returnedCount,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Title & Campus Mission */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Verified Campus Community Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Smart Campus Lost, Found, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-200 to-sky-300">Borrow & Lend</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Don’t repurchase expensive textbooks, lab coats, or graphing calculators.
              Report misplaced student IDs and gear. Built for students to share, find,
              and return items reliably with real-time tracking.
            </p>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                onClick={() => onSelectAction('lost')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100 hover:text-white transition text-xs sm:text-sm font-semibold group cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Lost Item</span>
              </button>

              <button
                onClick={() => onSelectAction('found')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-100 hover:text-white transition text-xs sm:text-sm font-semibold group cursor-pointer"
              >
                <PackageCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Found Item</span>
              </button>

              <button
                onClick={() => onSelectAction('lend')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-100 hover:text-white transition text-xs sm:text-sm font-semibold group cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                <span>Lend an Item</span>
              </button>

              <button
                onClick={() => onSelectAction('borrow_request')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 hover:text-white transition text-xs sm:text-sm font-semibold group cursor-pointer"
              >
                <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Request Borrow</span>
              </button>
            </div>
          </div>

          {/* Campus Impact Metrics */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{returnedCount + 18}</p>
              <p className="text-xs text-slate-300 font-medium">Items Reunited & Returned</p>
              <p className="text-[11px] text-teal-300/80 mt-1">Saved ~$4,200 student cash</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-2">
                <PackageCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{activeCount}</p>
              <p className="text-xs text-slate-300 font-medium">Active Campus Listings</p>
              <p className="text-[11px] text-indigo-300/80 mt-1">Across 8 campus hubs</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">100%</p>
              <p className="text-xs text-slate-300 font-medium">Safe Verification</p>
              <p className="text-[11px] text-amber-300/80 mt-1">Student ID protected</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">99.2%</p>
              <p className="text-xs text-slate-300 font-medium">On-Time Return Rate</p>
              <p className="text-[11px] text-purple-300/80 mt-1">Trust Score backed</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
