export type ItemType = 'lost' | 'found' | 'lend' | 'borrow_request';

export type ItemCategory =
  | 'electronics'
  | 'books'
  | 'clothing'
  | 'id_cards'
  | 'keys'
  | 'accessories'
  | 'sports'
  | 'lab_equipment'
  | 'other';

export type ItemStatus = 'open' | 'pending' | 'claimed' | 'borrowed' | 'returned' | 'closed';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  campusId?: string;
  department?: string;
  dormOrBuilding?: string;
  phone?: string;
  bio?: string;
  trustScore: number;
  role: 'student' | 'admin';
  isVerified?: boolean;
  isBanned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampusItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: string;
  imageUrl?: string;
  status: ItemStatus;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  userPhotoURL?: string;
  userCampusId?: string;
  securityQuestion?: string;
  reward?: string;
  pickupLocation?: string;
  borrowDurationDays?: number;
  currentBorrowerId?: string | null;
  currentBorrowerName?: string | null;
  dueDate?: string | null;
  flagsCount?: number;
  isFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  ownerId: string;
  ownerName: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhotoURL?: string;
  claimantDepartment?: string;
  proofOrReason: string;
  borrowDates?: string;
  status: ClaimStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemMessage {
  id: string;
  itemId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  recipientId: string;
  text: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  urgency: 'info' | 'warning' | 'alert';
  authorId: string;
  authorName: string;
  active: boolean;
  createdAt: string;
}
