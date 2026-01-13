# 🧹 DeerCamp Cleanup & Technical Debt

## ✅ Completed Immediately

- [x] **Removed 50+ temporary files** (`tmpclaude-*-cwd`)
- [x] **Updated .gitignore** to exclude temporary files and .claude/ directory

---

## 🔴 **CRITICAL: Multi-Club Migration Issues**

### 1. Navbar Using Deprecated Role Field
**File:** `src/components/Navbar.tsx:31-33`

**Problem:**
```typescript
// ❌ Uses deprecated profile.role
const navItems = profile?.role === 'owner' || profile?.role === 'manager'
    ? [...baseNavItems, { icon: <Settings size={16} />, label: 'Property Mgmt', path: '/property-management' }]
    : baseNavItems;
```

**Fix:**
```typescript
// ✅ Use activeMembership.role instead
const { activeMembership } = useAuth();
const navItems = activeMembership?.role === 'owner' || activeMembership?.role === 'manager'
    ? [...baseNavItems, { icon: <Settings size={16} />, label: 'Property Mgmt', path: '/property-management' }]
    : baseNavItems;
```

---

### 2. memberHelpers.ts Using Deprecated Fields
**File:** `src/utils/memberHelpers.ts`

**Problem:**
Permission helper functions expect `UserProfile` with deprecated `role` and `membershipStatus` fields, but these fields now live in `ClubMembership`.

**Options:**

**Option A: Create ClubMembership-based helpers (Recommended)**
```typescript
// New helpers that work with ClubMembership
export function canPromoteMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner') return false;
    if (membership.role === 'owner') return false;
    return true;
}

export function canSuspendMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner' && currentUserRole !== 'manager') return false;
    if (membership.role === 'owner') return false;
    if (membership.membershipStatus === 'suspended') return false;
    return true;
}
// ... update all other helpers
```

**Option B: Keep for backward compatibility**
Keep existing helpers but add `@deprecated` comments and create new ones:
```typescript
/** @deprecated Use canPromoteMember with ClubMembership instead */
export function canPromoteUser(member: UserProfile, currentUserRole: UserRole): boolean {
    // ... existing code
}
```

---

### 3. MembersPage and MemberCard Components
**Files:**
- `src/pages/MembersPage.tsx`
- `src/components/MemberCard.tsx`

**Likely Issue:** These components probably expect `UserProfile` with `role` field, but now need to work with merged data from `ClubMembership`.

**Audit Needed:**
- Check if `useMembers()` hook already returns merged data
- Update components to use `membership.role` instead of `member.role`

---

## 🟡 **Code Quality Improvements**

### 4. Console.log Statements (88 occurrences across 23 files)

**Files with console statements:**
```
src/hooks/useAccessRoutes.ts:5
src/hooks/useClubs.ts:7
src/hooks/useClubJoinRequests.ts:7
src/hooks/useTrailCameras.ts:5
src/hooks/useBookings.ts:7
... (23 files total)
```

**Recommendation:**
- **Keep:** `console.error()` in catch blocks (needed for debugging)
- **Remove:** Any `console.log()` debug statements
- **Consider:** Add proper error tracking service (Sentry, LogRocket)

**Quick audit script:**
```bash
# Find console.log statements (exclude console.error)
grep -r "console\.log" src --include="*.ts" --include="*.tsx"
```

---

### 5. Hook Consistency Patterns

**Current Patterns:**
- ✅ Most hooks follow consistent pattern: `{ data, loading, error, updateFunction }`
- ✅ All hooks filter by `activeClubId`
- ⚠️ Some hooks have `targetClubId` param, some don't

**Recommendation:**
Create a standard hook template pattern:
```typescript
// Standard data hook pattern
export function useResource(clubId?: string) {
    const { activeClubId } = useAuth();
    const [data, setData] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetClubId = clubId || activeClubId;

    useEffect(() => {
        if (!targetClubId) {
            setData([]);
            setLoading(false);
            return;
        }
        // ... real-time listener
    }, [targetClubId]);

    return { data, loading, error, updateFunction };
}
```

---

## 🟢 **Nice-to-Have Improvements**

### 6. Type Safety Enhancements

**Add runtime validation for critical types:**
```typescript
// src/utils/typeGuards.ts (NEW FILE)
export function isClubMembership(obj: any): obj is ClubMembership {
    return (
        typeof obj === 'object' &&
        typeof obj.userId === 'string' &&
        typeof obj.clubId === 'string' &&
        ['owner', 'manager', 'member'].includes(obj.role)
    );
}

export function isValidBooking(obj: any): obj is Booking {
    // ... validation
}
```

---

### 7. Component Organization

**Current Structure:**
```
src/components/
  ├── ClubSwitcher.tsx
  ├── MemberBadges.tsx
  ├── MemberCard.tsx
  ├── Navbar.tsx
  └── map/  (8 components)
```

**Potential Improvement:**
```
src/components/
  ├── layout/
  │   ├── Navbar.tsx
  │   └── ClubSwitcher.tsx
  ├── members/
  │   ├── MemberBadges.tsx
  │   └── MemberCard.tsx
  └── map/  (existing)
```

**Note:** Only do this if it improves clarity. Current flat structure is fine for small component count.

---

### 8. Error Boundary Implementation

**Missing:** Global error boundary for React component errors

**Add:**
```typescript
// src/components/ErrorBoundary.tsx (NEW)
import React from 'react';

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0c08] flex items-center justify-center p-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
                        <p className="text-gray-400 mb-4">
                            An unexpected error occurred. Please refresh the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
```

Wrap `App` in `src/main.tsx`:
```typescript
<ErrorBoundary>
    <App />
</ErrorBoundary>
```

---

### 9. Environment Variable Validation

**Add at app startup:**
```typescript
// src/utils/validateEnv.ts (NEW)
export function validateEnvironment() {
    const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_MAPBOX_ACCESS_TOKEN'
    ];

    const missing = requiredEnvVars.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env.local file.'
        );
    }
}

// Call in src/main.tsx before rendering
validateEnvironment();
```

---

### 10. Performance: Memoization Opportunities

**Consider memoizing expensive operations:**

**In AuthContext:**
```typescript
// Memoize expensive derived state
const activeMembership = useMemo(
    () => memberships.find(m => m.clubId === activeClubId),
    [memberships, activeClubId]
);

const activeClub = useMemo(
    () => clubs.find(c => c.id === activeClubId),
    [clubs, activeClubId]
);
```

**In map components:**
```typescript
// Memoize marker creation
const markers = useMemo(
    () => stands.map(stand => createMarker(stand)),
    [stands]
);
```

---

## 📋 **Testing Recommendations**

### 11. Add Basic Test Setup

**Install:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Start with:**
- Hook tests for `useMembers`, `useClubs`, `useBookings`
- Component tests for `ClubSwitcher`, `Navbar`
- Utility tests for `memberHelpers`, `geoUtils`

---

## 🎯 **Priority Order for Fixes**

1. **🔴 CRITICAL (Do Now):**
   - Fix Navbar deprecated role field (breaking bug in production)
   - Update memberHelpers or components using it

2. **🟡 HIGH PRIORITY (This Week):**
   - Audit and fix any other deprecated field usage
   - Remove debug console.log statements

3. **🟢 MEDIUM PRIORITY (Next Sprint):**
   - Add ErrorBoundary
   - Add env validation
   - Consider component organization

4. **⚪ LOW PRIORITY (Nice to Have):**
   - Add memoization
   - Add testing infrastructure
   - Create type guards

---

## 📝 **Migration Checklist for Multi-Club**

Before deploying multi-club to production:

- [ ] Deploy Firestore security rules (`firebase deploy --only firestore:rules`)
- [ ] Run data migration script (see MULTI_CLUB_IMPLEMENTATION.md)
- [ ] Fix Navbar deprecated role usage
- [ ] Audit all components for deprecated field usage
- [ ] Test club switching thoroughly
- [ ] Test data isolation (user can only see their club's data)
- [ ] Test join request workflow
- [ ] Test club creation and discovery
- [ ] Verify security rules work as expected

---

**Last Updated:** 2026-01-12
**Status:** Active cleanup backlog
