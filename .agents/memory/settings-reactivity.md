---
name: Settings cross-component reactivity
description: How useSettings propagates changes to always-mounted components like Sidebar and BottomNav.
---

## Rule
`useSettings().update()` dispatches a `CustomEvent("rah-e-safia:settings-changed", { detail: nextSettings })` on `window`. Components that are always mounted (Sidebar, BottomNav) must listen for this event to react to setting changes made in other components.

## Why
Each `useSettings()` call creates independent local React state. Navigation causes unmount/remount so pages read fresh settings on mount — that's fine. But Sidebar is never unmounted, so it won't re-read localStorage unless it listens for the event.

## How to apply
- `useSettings` (in `use-settings.ts`): dispatch the event inside `update()` after calling `saveSettings()`.
- Always-mounted components: use `useAppLanguage()` hook from `i18n.ts` which subscribes to the event.
- Page-level components: `useSettings()` is sufficient since they remount on navigation.
