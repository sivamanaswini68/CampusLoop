# Security Specification: CampusLoop Firestore Rules

## 1. Data Invariants

1. **User Identity Invariant**: A user can only write/modify their own `/users/{userId}` profile document where `userId == request.auth.uid`. A student cannot elevate their own role to 'admin' nor alter their `isVerified` or `isBanned` flags.
2. **Item Ownership Invariant**: An item can only be created with `userId == request.auth.uid`. Only the item owner or an admin can edit item details, delete, or mark status transitions (such as approving claims, marking returned, or closing).
3. **Item Status Locking**: Once an item is deleted or marked 'closed', standard students cannot mutate it back without admin intervention.
4. **Claim Integrity Invariant**: A claim on an item must have `claimantId == request.auth.uid`. The claimant cannot approve their own claim; only the item's `ownerId` or an admin can approve/reject the claim.
5. **Message Participant Invariant**: An inquiry message under `/items/{itemId}/messages/{messageId}` can only be created if `senderId == request.auth.uid`.
6. **Admin Isolation Invariant**: The `/admins` collection can only be read/managed by verified admins. The hardcoded bootstrap admin `sivamanaswini68@gmail.com` is granted administrative access.
7. **Announcement Protection Invariant**: Only admins can create, modify, or delete campus announcements. All users can read active announcements.
8. **Field Size & DoS Protection**: Every string property is protected by strict size constraints (e.g., titles <= 120 chars, descriptions <= 2000 chars, IDs <= 128 chars).

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Self-Promotion Exploit**: User submits `{ role: "admin", isVerified: true }` to `/users/{userId}` to gain unearned admin privileges.
2. **Ghost Identity Item Write**: User creates an item at `/items/item123` with `userId: "victim_student_456"`.
3. **Claim Self-Approval**: Claimant submits `{ status: "approved" }` on their own pending claim to bypass the lender/finder's review.
4. **Unauthorized Item Deletion**: Student B issues a `delete` on an item owned by Student A.
5. **Megabyte String Overflow**: User submits a 10MB payload in `title` or `description` attempting a Denial of Wallet / Firestore quota exhaustion.
6. **Email Spoofing Attack**: An unverified account attempting to write to `/admins` using a forged unverified email header.
7. **Terminal State Regression**: A user attempts to reopen a closed or completed claim without permission.
8. **Orphan Message Injection**: A non-participant posting messages to a private claim or spoofing `senderId`.
9. **Malicious Announcement Creation**: Normal student creating an alert banner across the campus app.
10. **Lend Overwrite Hijack**: A student claiming an already borrowed item or reassigning `currentBorrowerId` directly without owner approval.
11. **Shadow Field Injection**: Adding an unvetted `_isAdminBypass: true` field into an item document update.
12. **Blind Collection Scrape**: Unauthorized unauthenticated client attempting full collection reads on `/users` or private communications.

---

## 3. Test Runner Invariant Checks
All 12 attack vectors above must evaluate to `PERMISSION_DENIED` under `firestore.rules`.
