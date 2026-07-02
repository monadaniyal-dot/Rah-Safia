---
name: Lazy preload navigation fix
description: Why first-navigation blank-page happened and how it was fixed in Rah-e-Safia.
---

# Lazy preload — first-navigation blank-page

## The rule
Do NOT use `AnimatePresence` with `initial={false}` on a page-level route wrapper in React 19 + Framer Motion 12. This combination causes entering children (on navigation) to skip their animation but stay at their `initial` state (`opacity: 0`) rather than the `animate` state — blank page on first navigation.

## Why (confirmed root cause)
`<AnimatePresence initial={false}>` with keyed `motion.div` children and React 19:
1. Old motion.div exits (fades out) — both old AND new divs render the new route (Switch reads context)
2. New motion.div mounts at `initial={{ opacity: 0, y: 6 }}`
3. Due to React 19 + Framer Motion 12 interaction, `initial={false}` on AnimatePresence propagates to entering children, causing the enter animation to NOT fire
4. New motion.div stays at `opacity: 0` → blank content; old one finishes fading out → fully blank
5. Only exits (not enters) animate correctly

**Two red herrings that did NOT fix it:**
- Removing `mode="wait"` → still blank (both divs show new route, new one stays invisible)
- Eagerly preloading all `React.lazy` imports → correct but not the root cause

## Fix
Remove `AnimatePresence` and `motion.div` from the page wrapper in `AppShell.tsx` entirely. Use a plain `div`. Individual page components have their own enter animations (card stagger, etc.).

Also keep the eager preload pattern in `App.tsx` (all `import()` calls at module level, passed to `lazy()`) — this is still good practice to avoid Suspense suspension on first navigation.

**Why:** Without `AnimatePresence`, there is no dual-render issue, no `initial={false}` propagation, no opacity:0 stuck state.
