#!/usr/bin/env node
// Development-only startup guard.
//
// Purpose: before a dev server binds to its port, free that port if a
// *stale process from this same Replit workspace* is still holding it
// (leftover from a previous restart that didn't shut down cleanly).
//
// Safety rules (see replit.md / MEMORY for context):
//   - Only ever inspects/kills processes whose cwd resolves inside this
//     workspace directory AND whose command line looks like one of our
//     own dev processes (vite/pnpm/node running our workspace scripts).
//   - Never touches processes owned by a different uid (rules out any
//     system/root process).
//   - Never runs when NODE_ENV=production (double-guarded: this script
//     is only ever invoked from package.json "dev" scripts, which are
//     never used by the production build/run commands).
//   - No-ops safely if it can't determine port ownership (e.g. /proc is
//     unavailable) - it never falls back to broader process matching.
//
// Usage: node scripts/dev-port-guard.mjs <port> [<port> ...]

import { readFileSync, readdirSync, readlinkSync, existsSync, realpathSync } from "node:fs";
import { join } from "node:path";

const WORKSPACE_ROOT = realpathSync(new URL("..", import.meta.url).pathname);

function fail(msg) {
  console.warn(`[dev-port-guard] ${msg}`);
}

if (process.env.NODE_ENV === "production") {
  process.exit(0);
}

const ports = process.argv.slice(2).map(Number).filter((p) => Number.isInteger(p) && p > 0);
if (ports.length === 0) {
  fail("no ports given, nothing to do");
  process.exit(0);
}

function hexPort(port) {
  return port.toString(16).toUpperCase().padStart(4, "0");
}

// Find listening-socket inodes for the given ports from /proc/net/tcp{,6}.
function findListeningInodes(port) {
  const want = hexPort(port);
  const inodes = new Set();
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    if (!existsSync(file)) continue;
    let lines;
    try {
      lines = readFileSync(file, "utf8").split("\n").slice(1);
    } catch {
      continue;
    }
    for (const line of lines) {
      const cols = line.trim().split(/\s+/);
      if (cols.length < 10) continue;
      const [local, , , state, , , , , , , inode] = cols;
      const localPort = local?.split(":")[1];
      // 0A == TCP_LISTEN
      if (state === "0A" && localPort === want) {
        inodes.add(inode);
      }
    }
  }
  return inodes;
}

// Map socket inodes -> owning pid, restricted to our own uid.
function findPidsForInodes(inodes) {
  if (inodes.size === 0) return [];
  const myUid = process.getuid ? process.getuid() : null;
  const pids = new Set();
  let procDirs;
  try {
    procDirs = readdirSync("/proc").filter((d) => /^\d+$/.test(d));
  } catch {
    return [];
  }
  for (const pid of procDirs) {
    const fdDir = `/proc/${pid}/fd`;
    let fds;
    try {
      fds = readdirSync(fdDir);
    } catch {
      continue; // no permission / process gone - skip, never guess
    }
    let matched = false;
    for (const fd of fds) {
      let link;
      try {
        link = readlinkSync(join(fdDir, fd));
      } catch {
        continue;
      }
      const m = link.match(/^socket:\[(\d+)\]$/);
      if (m && inodes.has(m[1])) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;

    // uid check
    if (myUid !== null) {
      try {
        const status = readFileSync(`/proc/${pid}/status`, "utf8");
        const uidLine = status.split("\n").find((l) => l.startsWith("Uid:"));
        const uid = uidLine ? Number(uidLine.split(/\s+/)[1]) : null;
        if (uid !== myUid) continue;
      } catch {
        continue;
      }
    }

    pids.add(Number(pid));
  }
  return [...pids];
}

// A pid is only eligible for killing if BOTH:
//  - its resolved cwd is inside this workspace directory
//  - its cmdline mentions a known dev-tool token (vite/pnpm/tsx/node)
//    running one of our workspace paths, not some unrelated tool.
function isSafeToKill(pid) {
  if (pid === process.pid || pid === process.ppid) return false;

  let cwd;
  try {
    cwd = realpathSync(`/proc/${pid}/cwd`);
  } catch {
    return false;
  }
  if (!cwd.startsWith(WORKSPACE_ROOT)) return false;

  let cmdline = "";
  try {
    cmdline = readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ");
  } catch {
    return false;
  }
  const looksLikeDevProcess = /vite|pnpm|node|esbuild|tsx/.test(cmdline);
  if (!looksLikeDevProcess) return false;

  return true;
}

async function killPidSafely(pid) {
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
  await new Promise((r) => setTimeout(r, 800));
  try {
    process.kill(pid, 0); // still alive?
    process.kill(pid, "SIGKILL");
  } catch {
    // already gone, nothing to do
  }
}

for (const port of ports) {
  const inodes = findListeningInodes(port);
  if (inodes.size === 0) continue;
  const pids = findPidsForInodes(inodes).filter(isSafeToKill);
  for (const pid of pids) {
    fail(`freeing port ${port}: killing stale workspace process pid ${pid}`);
    await killPidSafely(pid);
  }
}
