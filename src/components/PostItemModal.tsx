import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  MapPin,
  Calendar,
  Gift,
  HelpCircle,
  PackageCheck,
  Share2,
  Search,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';
import { ItemCategory, ItemType, UserProfile } from '../types';
import { createCampusItem } from '../services/campusService';

interface PostItemModalProps {
  initialType?: ItemType;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostItemModal: React.FC<PostItemModalProps> = ({
  initialType = 'lost',
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [location, setLocation] = useState('Main Library');
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Specific fields
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [reward, setReward] = useState('');
  const [borrowDurationDays, setBorrowDurationDays] = useState(7);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campusLocations = [
    'Main Library',
    'Student Union / Dining Hall',
    'Science Quad & Lecture Halls',
    'Engineering & Makerspace',
    'Chemistry Annex & Labs',
    'Campus Recreation & Gym',
    'North Quad Dorms',
    'South Quad Dorms',
    'Campus Coffee Shop',
    'Other Location...',
  ];

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file is too large. Please upload an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required title and description fields.');
      return;
    }

    const resolvedLocation = location === 'Other Location...' ? customLocation.trim() || 'Campus Ground' : location;

    try {
      setIsSubmitting(true);
      setError(null);

      await createCampusItem({
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: resolvedLocation,
        date,
        imageUrl: imageUrl.trim() || undefined,
        status: 'open',
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        userEmail: currentUser.email,
        userPhotoURL: currentUser.photoURL,
        userCampusId: currentUser.campusId || '',
        securityQuestion: type === 'found' ? securityQuestion.trim() : undefined,
        pickupLocation: type === 'found' ? pickupLocation.trim() : undefined,
        reward: type === 'lost' ? reward.trim() : undefined,
        borrowDurationDays: type === 'lend' ? Number(borrowDurationDays) : undefined,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create item:', err);
      setError('Failed to publish listing. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-base text-slate-900">Post to CampusLoop</h3>
            <p className="text-xs text-slate-500">Report lost/found items or share gear with peers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-3 bg-slate-100/80 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              type === 'lost'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Lost Item</span>
          </button>

          <button
            type="button"
            onClick={() => setType('found')}
            className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              type === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Found Item</span>
          </button>

          <button
            type="button"
            onClick={() => setType('lend')}
            className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              type === 'lend'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Offer to Lend</span>
          </button>

          <button
            type="button"
            onClick={() => setType('borrow_request')}
            className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              type === 'borrow_request'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Request Borrow</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'lost'
                  ? 'e.g. Black Herschel Backpack with Laptop'
                  : type === 'found'
                  ? 'e.g. Set of Dorm Keys with Green Car Carabiner'
                  : type === 'lend'
                  ? 'e.g. TI-84 Plus CE Graphing Calculator'
                  : 'e.g. Chemistry Lab Safety Goggles for Thursday'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="electronics">Electronics (Phones, Laptops, Calculators)</option>
                <option value="books">Books, Notes & Textbooks</option>
                <option value="clothing">Clothing, Jackets & Backpacks</option>
                <option value="id_cards">Student IDs, Keys & Wallets</option>
                <option value="accessories">Bottles, Glasses & Accessories</option>
                <option value="sports">Sports, Gym & Rec Equipment</option>
                <option value="lab_equipment">Lab Equipment & Tools</option>
                <option value="other">Other Campus Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Campus Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campus Location *
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              {campusLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {location === 'Other Location...' && (
              <input
                type="text"
                required
                placeholder="Type specific building, room or field..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide details such as color, brand, condition, and pickup arrangements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition leading-relaxed resize-none"
            />
          </div>

          {/* Conditional inputs */}
          {type === 'found' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Security Question for Verification (Optional but Recommended)
                </label>
                <input
                  type="text"
                  placeholder="e.g. What is the keychain mascot or lockscreen wallpaper?"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Current Storage / Handover Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turned into Library Front Desk / With finder"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {type === 'lost' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Optional Finder Reward (Gratitude / Treat)
              </label>
              <input
                type="text"
                placeholder="e.g. $15 Campus Coffee Voucher / Box of Donuts"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg outline-none focus:border-rose-500"
              />
            </div>
          )}

          {type === 'lend' && (
            <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-xs font-bold text-violet-900 mb-1">
                Max Borrow Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={borrowDurationDays}
                onChange={(e) => setBorrowDurationDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-violet-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Photo upload / link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Item Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 border border-slate-300">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-400">or paste image link:</span>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {imagePreview && (
              <div className="mt-2.5 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Item Listing</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
