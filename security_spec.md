# Security Specification & Red Team Audit

## 1. Data Invariants
1. **Owner Isolation for Private PII (`users/{userId}`)**: A user's email and preferences may only be read, created, or updated by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`). Listing `/users` is strictly forbidden.
2. **Identity Integrity (`squadProgress/{userId}`)**: A signed-in verified user may only create or modify their own `squadProgress/{userId}` document (`uid == request.auth.uid`), never another member's progress.
3. **No PII Leakage**: `squadProgress/{userId}` strictly forbids `email`, `phone`, or `address` fields via `hasOnly` key allowlisting.
4. **Temporal & Immutable Integrity**: `createdAt` and `uid` are immutable after creation; `createdAt` and `updatedAt` must equal `request.time`.
5. **Bounded Payloads**: All strings (`uid`, `displayName`, `photoURL`, `email`) and maps (`routine`, `syllabus`) and integer bounds (`daysDone`, `chapsDone`, `xp`, `streak`) are strictly bounded.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read on `/users/u1` or `/squadProgress/u1`.
2. Unverified email (`email_verified: false`) attempting to write `/squadProgress/u1`.
3. User `u1` attempting `list` on `/users`.
4. User `u1` attempting `get` on `/users/u2` (PII theft).
5. User `u1` attempting to create `/squadProgress/u1` with `uid: "u2"` (Identity spoofing).
6. User `u1` attempting to update `/squadProgress/u2` (Tampering with teammate's progress).
7. User `u1` attempting shadow field injection `{ ..., isAdmin: true, email: "leak@x.com" }` on `/squadProgress/u1`.
8. User `u1` attempting to modify `createdAt` or `uid` on update of `/squadProgress/u1`.
9. User `u1` attempting to forge client timestamp (`updatedAt: "2020-01-01T00:00:00Z"`) instead of `request.time`.
10. User `u1` attempting resource poisoning with a 2KB `displayName` or `userId` > 128 chars.
11. User `u1` attempting out-of-range integer injection (`daysDone: 9999`, `xp: -50`, `streak: 9999`).
12. User `u1` attempting to create `/users/u1` with invalid `theme: "rainbow"`.
