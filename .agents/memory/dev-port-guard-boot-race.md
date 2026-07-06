---
name: Dev port-guard boot race
description: Why duplicate pnpm/vite processes and cascading fallback ports can still appear on a full container reboot even with a startup port-guard script, and how to recover.
---

On a full environment reboot (not a simple workflow restart), all configured workflows can fire near-simultaneously. If two or more of them invoke the same underlying package's `dev` script (e.g. a main workflow and an artifact-preview workflow both running `pnpm --filter <pkg> run dev` on different ports), duplicate parent pnpm/vite processes can pile up faster than a single boot cycle expects.

A port-guard that kills stale listeners on its *target* port at script start (see `scripts/dev-port-guard.mjs`) does not fully solve this: it only detects processes already LISTENING on the port. If several instances start at literally the same instant, none of them are listening yet when the others check, so no one gets killed, and only one instance wins the bind — the rest fall back to Vite's automatic "next free port" behavior, producing the cascading-port symptom (5000→5001, 8082→8083→8084) even though the guard code is working correctly.

**Why:** Boot-time concurrency is a race the guard's snapshot-based check cannot see across simultaneous launches; it only protects against genuinely stale leftover processes from a *previous* session.

**How to apply:** When this recurs after a reboot, don't just re-edit the guard — diagnose via `ps aux | grep "pnpm --filter"` and compare the process count per package against the number of workflows that legitimately invoke it. If there are more processes than workflows, kill all of them by explicit PID (never broad `pkill -f`, it can kill the invoking shell) and restart the workflows one at a time via `restart_workflow` (not all in the same instant) to avoid re-triggering the race.
