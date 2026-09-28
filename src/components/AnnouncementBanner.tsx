import React, { useState } from 'react';
import { Megaphone, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(
    (a) => a.active && !dismissedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[0];

  const urgencyStyles = {
    info: 'bg-indigo-900 text-indigo-50 border-indigo-700',
    warning: 'bg-amber-900 text-amber-50 border-amber-700',
    alert: 'bg-rose-900 text-rose-50 border-rose-700',
  };

  const urgencyIcons = {
    info: <Info className="w-4 h-4 text-indigo-300 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />,
    alert: <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />,
  };

  return (
    <div
      className={`px-4 py-2.5 border-b text-xs sm:text-sm transition-all duration-300 flex items-center justify-between gap-3 ${
        urgencyStyles[current.urgency] || urgencyStyles.info
      }`}
    >
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1 min-w-0">
        <span className="p-1 bg-white/10 rounded-full shrink-0">
          <Megaphone className="w-3.5 h-3.5" />
        </span>
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded bg-white/20">
            {current.urgency}
          </span>
          <span className="font-medium truncate">{current.title}:</span>
          <span className="opacity-90 truncate hidden md:inline">{current.message}</span>
        </div>
      </div>

      <button
        onClick={() => setDismissedIds((prev) => [...prev, current.id])}
        className="p-1 hover:bg-white/10 rounded transition text-white/80 hover:text-white shrink-0"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
