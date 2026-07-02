---
name: Lazy preload navigation fix
description: Why first-navigation blank-page happened and how it was fixed in Rah-e-Safia.
---

# Lazy preload — first-navigation blank-page

## The rule
Never use `React.lazy(() => import(...))` alone in apps that use Framer Motion `AnimatePresence` with keyed `motion.div` transitions AND React 18 concurrent mode. Start the `import()` promises at module-load time and pass them into `lazy()`.

## Why
When `React.lazy()` wraps a raw `import()` call, the bundle download only starts the first time that component is rendered. On first navigation:
1. The new `motion.div` (key = new location) mounts at `initial={{ opacity: 0 }}`
2. Its children suspend (bundle not yet downloaded)
3. React 18 concurrent mode's Suspense processing disrupts Framer Motion's enter-animation effect scheduling
4. The animation never fires → `motion.div` stays at `opacity: 0` → blank page

Second navigation works because the bundle is cached and resolves synchronously — no Suspense, animation fires normally.

## How to apply
In `App.tsx`, store all `import()` results as module-level constants, then pass those promises to `React.lazy()`:

```tsx
const _prayer = import("@/pages/PrayerTimesPage");
const PrayerTimesPage = lazy(() => _prayer);
```

This starts all bundle downloads the instant the main JS executes — before any user interaction — so `lazy()` always resolves from cache.

**Why:** Removing `AnimatePresence mode="wait"` alone did NOT fix the bug. The real issue is the timing between Suspense suspension and Framer Motion's useEffect-based animation trigger in React 18.
