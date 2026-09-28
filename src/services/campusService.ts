import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, isUserAdmin, OperationType } from '../lib/firebase';
import { Announcement, CampusItem, Claim, ClaimStatus, ItemMessage, UserProfile } from '../types';

// USER SERVICE
export async function syncUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  const isAdmin = isUserAdmin(user.email);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Campus Student',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        campusId: '',
        department: 'General Studies',
        dormOrBuilding: 'Campus Residence',
        phone: '',
        bio: 'Student at CampusLoop. Let us share and return items responsibly!',
        trustScore: 100,
        role: isAdmin ? 'admin' : 'student',
        isVerified: true,
        isBanned: false,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const existing = snap.data() as UserProfile;
      // If admin email, ensure admin role
      if (isAdmin && existing.role !== 'admin') {
        await updateDoc(userRef, { role: 'admin', updatedAt: now });
        existing.role = 'admin';
      }
      return existing;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  try {
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(userRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    throw error;
  }
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...snap.data(), uid: snap.id } as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  );
}

// ITEMS SERVICE
export function subscribeToItems(callback: (items: CampusItem[]) => void) {
  const itemsRef = collection(db, 'items');
  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const items: CampusItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as CampusItem));
      // Sort client-side by date descending
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'items');
    }
  );
}

export async function createCampusItem(itemData: Omit<CampusItem, 'id' | 'createdAt' | 'updatedAt' | 'flagsCount' | 'isFlagged'>) {
  const itemsRef = collection(db, 'items');
  const now = new Date().toISOString();
  try {
    const payload = {
      ...itemData,
      flagsCount: 0,
      isFlagged: false,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(itemsRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'items');
    throw error;
  }
}

export async function updateCampusItem(itemId: string, data: Partial<CampusItem>) {
  const itemRef = doc(db, 'items', itemId);
  try {
    await updateDoc(itemRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `items/${itemId}`);
    throw error;
  }
}

export async function deleteCampusItem(itemId: string) {
  const itemRef = doc(db, 'items', itemId);
  try {
    await deleteDoc(itemRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `items/${itemId}`);
    throw error;
  }
}

export async function flagCampusItem(itemId: string, currentFlags = 0) {
  const itemRef = doc(db, 'items', itemId);
  try {
    await updateDoc(itemRef, {
      flagsCount: currentFlags + 1,
      isFlagged: currentFlags + 1 >= 3,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `items/${itemId}`);
    throw error;
  }
}

// CLAIMS & BORROW REQUESTS SERVICE
export function subscribeToUserClaims(uid: string, callback: (claims: Claim[]) => void) {
  const claimsRef = collection(db, 'claims');
  // Listen for claims where current user is claimant OR item owner
  const qClaimant = query(claimsRef, where('claimantId', '==', uid));
  const qOwner = query(claimsRef, where('ownerId', '==', uid));

  let claimantList: Claim[] = [];
  let ownerList: Claim[] = [];

  const updateCombined = () => {
    const map = new Map<string, Claim>();
    [...claimantList, ...ownerList].forEach((c) => map.set(c.id, c));
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    callback(combined);
  };

  const unsubClaimant = onSnapshot(
    qClaimant,
    (snap) => {
      claimantList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Claim));
      updateCombined();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'claims');
    }
  );

  const unsubOwner = onSnapshot(
    qOwner,
    (snap) => {
      ownerList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Claim));
      updateCombined();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'claims');
    }
  );

  return () => {
    unsubClaimant();
    unsubOwner();
  };
}

export function subscribeToItemClaims(itemId: string, callback: (claims: Claim[]) => void) {
  const claimsRef = collection(db, 'claims');
  const q = query(claimsRef, where('itemId', '==', itemId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Claim));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `claims/itemId=${itemId}`);
    }
  );
}

export async function submitClaim(claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const claimsRef = collection(db, 'claims');
  const now = new Date().toISOString();
  try {
    const payload = {
      ...claimData,
      status: 'pending' as ClaimStatus,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(claimsRef, payload);

    // Also update item status to pending if it was open
    await updateCampusItem(claimData.itemId, {
      status: 'pending',
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'claims');
    throw error;
  }
}

export async function updateClaimStatus(
  claimId: string,
  itemId: string,
  itemType: string,
  newStatus: ClaimStatus,
  claimantId: string,
  claimantName: string,
  adminNote?: string
) {
  const claimRef = doc(db, 'claims', claimId);
  try {
    await updateDoc(claimRef, {
      status: newStatus,
      adminNote: adminNote || '',
      updatedAt: new Date().toISOString(),
    });

    // Update the associated item
    if (newStatus === 'approved') {
      if (itemType === 'lost' || itemType === 'found') {
        await updateCampusItem(itemId, {
          status: 'claimed',
        });
      } else if (itemType === 'lend' || itemType === 'borrow_request') {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Default 1-week return window
        await updateCampusItem(itemId, {
          status: 'borrowed',
          currentBorrowerId: claimantId,
          currentBorrowerName: claimantName,
          dueDate: dueDate.toISOString(),
        });
      }
    } else if (newStatus === 'returned') {
      await updateCampusItem(itemId, {
        status: itemType === 'lend' ? 'open' : 'returned',
        currentBorrowerId: null,
        currentBorrowerName: null,
        dueDate: null,
      });

      // Increase trust score for successful return!
      try {
        const userRef = doc(db, 'users', claimantId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentScore = userSnap.data()?.trustScore || 100;
          await updateDoc(userRef, {
            trustScore: currentScore + 15,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Could not update claimant trust score:', e);
      }
    } else if (newStatus === 'rejected') {
      // Revert item back to open if no other approved claim
      await updateCampusItem(itemId, {
        status: 'open',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `claims/${claimId}`);
    throw error;
  }
}

// IN-APP ITEM MESSAGES
export function subscribeToItemMessages(itemId: string, callback: (messages: ItemMessage[]) => void) {
  const messagesRef = collection(db, 'items', itemId, 'messages');
  return onSnapshot(
    messagesRef,
    (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItemMessage));
      msgs.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      callback(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `items/${itemId}/messages`);
    }
  );
}

export async function sendItemMessage(itemId: string, message: Omit<ItemMessage, 'id' | 'createdAt'>) {
  const messagesRef = collection(db, 'items', itemId, 'messages');
  const now = new Date().toISOString();
  try {
    await addDoc(messagesRef, {
      ...message,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `items/${itemId}/messages`);
    throw error;
  }
}

// ANNOUNCEMENTS SERVICE (Admin & Public read)
export function subscribeToAnnouncements(callback: (announcements: Announcement[]) => void) {
  const annRef = collection(db, 'announcements');
  return onSnapshot(
    annRef,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    }
  );
}

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>) {
  const annRef = collection(db, 'announcements');
  const now = new Date().toISOString();
  try {
    await addDoc(annRef, {
      ...data,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'announcements');
    throw error;
  }
}

export async function deleteAnnouncement(id: string) {
  const annRef = doc(db, 'announcements', id);
  try {
    await deleteDoc(annRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    throw error;
  }
}

// ADMIN STATS & USER MANAGEMENT
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  try {
    const snap = await getDocs(usersRef);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    throw error;
  }
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      isBanned,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
}

export async function verifyUserCampusStatus(userId: string, isVerified: boolean) {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      isVerified,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
}
