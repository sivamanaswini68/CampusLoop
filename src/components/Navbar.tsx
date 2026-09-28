import React from 'react';
import {
  RotateCcw,
  PlusCircle,
  User,
  Shield,
  Search,
  LogIn,
  LogOut,
  Bell,
  Sparkles,
  Inbox
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenPostModal: () => void;
  onOpenMyHub: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pendingRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenPostModal,
  onOpenMyHub,
  onOpenAdmin,
  onLogout,
  searchTerm,
  setSearchTerm,
  pendingRequestsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Campus<span className="text-indigo-600">Loop</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  Campus Net
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Lost, Found, Borrow & Lend
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search lost IDs, calculators, lab coats, jackets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl transition duration-150 outline-none text-slate-800 placeholder-slate-400 shadow-inner/5"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Post Item Button */}
            <button
              onClick={onOpenPostModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition shadow-sm hover:shadow shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Post Item</span>
            </button>

            {/* My Hub Button */}
            {user && (
              <button
                onClick={onOpenMyHub}
                className="relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition border border-slate-200/80"
                title="My Postings & Borrowings"
              >
                <Inbox className="w-4 h-4" />
                <span className="hidden md:inline">My Hub</span>
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Dashboard Button if admin */}
            {user?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition border border-purple-200"
                title="Admin Dashboard"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 hover:bg-slate-100 rounded-xl transition group text-left"
                  title="View / Edit Profile"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500"
                  />
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[100px]">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] font-medium text-emerald-600 leading-tight">
                      ⭐ {user.trustScore} Trust
                    </p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border border-indigo-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items, categories, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
