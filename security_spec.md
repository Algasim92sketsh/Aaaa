# Security Specification & Test Scenarios

## 1. Data Invariants
- **User Document Ownership**: `/users/{userId}` can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
- **UID Integrity**: The `uid` in the document body must strictly match `request.auth.uid` on both create and update.
- **Length Boundaries**:
  - `displayName`: string, length between 1 and 50 chars.
  - `avatarFilter`: string, length between 1 and 50 chars.
  - `avatarUrl`: string, length <= 65536 chars.
  - `deviceAlias`: string, length <= 60 chars.
  - `email`: string, length <= 128 chars.
  - `createdAt`: string, length <= 50 chars.
  - `updatedAt`: string, length <= 50 chars.
- **Strict Key Constraints**: No unauthorized ghost fields or arbitrary keys allowed.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Write**: An unauthenticated user attempts to create `/users/user123`. (Rejected: Not signed in)
2. **Identity Spoofing**: User `alice` attempts to create `/users/bob` with `uid: "bob"`. (Rejected: Path ID and UID mismatch)
3. **Ghost Field Injection**: User attempts to add `isAdmin: true` or `role: "admin"` to their user profile. (Rejected: Invalid keys)
4. **Oversized Display Name**: User attempts to set a 200-character `displayName`. (Rejected: Exceeds 50 characters)
5. **Empty Display Name**: User attempts to set `""` (empty string) as `displayName`. (Rejected: minLength 1 violated)
6. **Cross-User Profile Tampering**: User `alice` attempts to update `/users/bob`. (Rejected: Not the owner)
7. **Cross-User Reading**: User `alice` attempts to read `/users/bob`. (Rejected: Not the owner)
8. **Resource Exhaustion**: User attempts to inject a 5MB base64 avatar into `avatarUrl`. (Rejected: Exceeds 65536 chars)
9. **Invalid UID Type**: User sends `uid: 12345` (integer instead of string). (Rejected: Type mismatch)
10. **Immutable Field Mutated**: User attempts to change `createdAt` on an existing document. (Rejected: Key modification boundary)
11. **Path Traversal / Special Char Injection in User ID**: Attacker attempts to target `/users/../../system`. (Rejected: `isValidId` regex failure)
12. **Null/Empty Payload**: User sends empty document `{}` missing required fields `displayName`, `uid`, etc. (Rejected: Missing required keys)
