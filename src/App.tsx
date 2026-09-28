import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Search,
  Filter,
  PackageCheck,
  HelpCircle,
  Share2,
  Inbox,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  Info,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { auth, isUserAdmin, logoutUser } from './lib/firebase';
import {
  createAnnouncement,
  createCampusItem,
  subscribeToAnnouncements,
  subscribeToItems,
  subscribeToUserClaims,
  subscribeToUserProfile,
  syncUserProfile
} from './services/campusService';
import { Announcement, CampusItem, Claim, ItemCategory, ItemType, UserProfile } from './types';
import { INITIAL_ANNOUNCEMENT, INITIAL_CAMPUS_ITEMS } from './utils/seedData';

import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { HeroBanner } from './components/HeroBanner';
import { ItemCard } from './components/ItemCard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { PostItemModal } from './components/PostItemModal';
import { ClaimModal } from './components/ClaimModal';
import { MyHubModal } from './components/MyHubModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<CampusItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | ItemType>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ItemCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedItem, setSelectedItem] = useState<CampusItem | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalInitialType, setPostModalInitialType] = useState<ItemType>('lost');
  const [claimModalItem, setClaimModalItem] = useState<CampusItem | null>(null);
  const [myHubOpen, setMyHubOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Subscribe to Firebase Auth and User Profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          setCurrentUser(profile);
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        // If not logged in via Firebase Auth, check if previously logged in via demo
        setCurrentUser((prev) => (prev?.uid.startsWith('demo_') || prev?.uid.startsWith('admin_') ? prev : null));
      }
    });

    return () => unsubAuth();
  }, []);

  // Listen to profile updates if logged in
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubProfile = subscribeToUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setCurrentUser(profile);
      }
    });
    return () => unsubProfile();
  }, [currentUser?.uid]);

  // Real-time listener for Items
  useEffect(() => {
    const unsubItems = subscribeToItems((fetchedItems) => {
      setItems(fetchedItems);
      setLoading(false);

      // Seed initial items if completely empty
      if (fetchedItems.length === 0) {
        seedInitialItems();
      }
    });

    return () => unsubItems();
  }, []);

  // Real-time listener for Announcements
  useEffect(() => {
    const unsubAnn = subscribeToAnnouncements((fetchedAnn) => {
      setAnnouncements(fetchedAnn);
      if (fetchedAnn.length === 0) {
        createAnnouncement(INITIAL_ANNOUNCEMENT).catch(console.error);
      }
    });
    return () => unsubAnn();
  }, []);

  // Real-time listener for user claims & borrow requests
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserClaims([]);
      return;
    }
    const unsubClaims = subscribeToUserClaims(currentUser.uid, (claims) => {
      setUserClaims(claims);
    });
    return () => unsubClaims();
  }, [currentUser?.uid]);

  const seedInitialItems = async () => {
    try {
      for (const item of INITIAL_CAMPUS_ITEMS) {
        await createCampusItem(item);
      }
    } catch (err) {
      console.warn('Seed items note:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserClaims([]);
    } catch (err) {
      console.error('Logout error:', err);
      setCurrentUser(null);
    }
  };

  const handleOpenPostItem = (type: ItemType = 'lost') => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setPostModalInitialType(type);
    setPostModalOpen(true);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // Type tab
    if (activeTypeTab !== 'all' && item.type !== activeTypeTab) return false;
    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    // Location
    if (selectedLocation !== 'all' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    // Status
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchCat) return false;
    }
    return true;
  });

  const pendingIncomingCount = userClaims.filter(
    (c) => c.ownerId === currentUser?.uid && c.status === 'pending'
  ).length;

  const returnedCount = items.filter((i) => i.status === 'returned' || i.status === 'claimed').length;
  const activeCount = items.filter((i) => i.status === 'open' || i.status === 'pending' || i.status === 'borrowed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Real-time Announcements Banner */}
      <AnnouncementBanner announcements={announcements} />

      {/* Main Top Navigation */}
      <Navbar
        user={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenPostModal={() => handleOpenPostItem('lost')}
        onOpenMyHub={() => setMyHubOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        pendingRequestsCount={pendingIncomingCount}
      />

      {/* Hero Banner with Campus stats & Quick Actions */}
      <HeroBanner
        onSelectAction={handleOpenPostItem}
        activeCount={activeCount}
        returnedCount={returnedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs (All, Lost, Found, Lend, Borrow Requests) */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
                activeTypeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>All Campus Listings</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeTypeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTypeTab('lost')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
                activeTypeTab === 'lost'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Lost Items</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeTypeTab === 'lost' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'}`}>
                {items.filter((i) => i.type === 'lost').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTypeTab('found')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
                activeTypeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Found Items</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeTypeTab === 'found' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                {items.filter((i) => i.type === 'found').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTypeTab('lend')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
                activeTypeTab === 'lend'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Available to Borrow</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeTypeTab === 'lend' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'}`}>
                {items.filter((i) => i.type === 'lend').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTypeTab('borrow_request')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
                activeTypeTab === 'borrow_request'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Borrow Requests</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeTypeTab === 'borrow_request' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                {items.filter((i) => i.type === 'borrow_request').length}
              </span>
            </button>

          </div>
        </div>

        {/* Filter bar: Category, Campus Zone, Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 pr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {/* Category Select */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="pl-3 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books & Notes</option>
                <option value="clothing">Clothing & Bags</option>
                <option value="id_cards">IDs & Keys</option>
                <option value="accessories">Accessories</option>
                <option value="sports">Sports & Rec</option>
                <option value="lab_equipment">Lab Equipment</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Campus Zone Select */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-3 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Campus Locations</option>
                <option value="Library">Main Library</option>
                <option value="Union">Student Union / Dining</option>
                <option value="Science">Science Quad & Labs</option>
                <option value="Engineering">Engineering Hall</option>
                <option value="Chemistry">Chemistry Annex</option>
                <option value="Dorms">Dorms & Residences</option>
                <option value="Gym">Recreation & Gym</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Select */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Active / Available</option>
                <option value="pending">Under Review / Pending</option>
                <option value="claimed">Claimed</option>
                <option value="borrowed">Currently Borrowed</option>
                <option value="returned">Returned</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick results count / Reset */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredItems.length}</strong> items
            </span>
            {(selectedCategory !== 'all' || selectedLocation !== 'all' || selectedStatus !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200 p-4 space-y-4">
                <div className="bg-slate-200 rounded-xl h-44 w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs px-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No items match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Try adjusting your search terms or filters, or be the first to post a lost item or gear offer.
            </p>
            <button
              onClick={() => handleOpenPostItem('lost')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a New Listing</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              CL
            </div>
            <span className="font-bold text-slate-800">CampusLoop</span>
            <span>— Smart Lost, Found, Borrow & Lend Platform for Students</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Student Verification Protected</span>
            <span>•</span>
            <span>Trust Score Monitored</span>
            <span>•</span>
            <span>Campus Community First</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          currentUser={currentUser}
          onClose={() => setSelectedItem(null)}
          onOpenClaim={(item) => {
            setSelectedItem(null);
            setClaimModalItem(item);
          }}
          onOpenAuth={() => setAuthOpen(true)}
        />
      )}

      {postModalOpen && currentUser && (
        <PostItemModal
          initialType={postModalInitialType}
          currentUser={currentUser}
          onClose={() => setPostModalOpen(false)}
          onSuccess={() => {
            setPostModalOpen(false);
          }}
        />
      )}

      {claimModalItem && currentUser && (
        <ClaimModal
          item={claimModalItem}
          currentUser={currentUser}
          onClose={() => setClaimModalItem(null)}
          onSuccess={() => {
            setClaimModalItem(null);
            setMyHubOpen(true);
          }}
        />
      )}

      {myHubOpen && currentUser && (
        <MyHubModal
          currentUser={currentUser}
          myItems={items.filter((i) => i.userId === currentUser.uid)}
          claims={userClaims}
          onClose={() => setMyHubOpen(false)}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      )}

      {profileOpen && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setProfileOpen(false)}
          onUpdate={(updated) => {
            setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
          }}
        />
      )}

      {adminOpen && currentUser && (
        <AdminDashboardModal
          currentUser={currentUser}
          items={items}
          announcements={announcements}
          onClose={() => setAdminOpen(false)}
        />
      )}

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

    </div>
  );
}
