import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  type Reciter,
  buildAudioUrl,
  loadSavedReciter,
  saveReciter,
} from "@/lib/quran-audio";

export type PlaybackSpeed = 0.75 | 1 | 1.25;
export type RepeatMode = "off" | "ayah" | "surah";

// ── Main player state — changes on meaningful events (play, pause, ayah nav) ──
export interface QuranPlayerState {
  surahNumber: number | null;
  surahName: string;
  surahArabicName: string;
  ayahNumber: number | null;
  totalAyahs: number;
  reciter: Reciter;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  speed: PlaybackSpeed;
  repeat: RepeatMode;
  fullPlayerOpen: boolean;
}

// ── Progress state — changes up to 4×/sec during playback ──────────────────
// Kept in a SEPARATE context so only MiniPlayer/FullPlayer re-render on timeupdate.
export interface PlayerProgressState {
  currentTime: number;
  duration: number;
}

export interface QuranPlayerContextValue {
  state: QuranPlayerState;
  playAyah: (
    surah: number,
    ayah: number,
    surahName: string,
    surahArabicName: string,
    totalAyahs: number
  ) => void;
  togglePlayPause: () => void;
  stop: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setRepeat: (mode: RepeatMode) => void;
  setReciter: (reciter: Reciter) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
}

const QuranPlayerContext = createContext<QuranPlayerContextValue | null>(null);
const PlayerProgressContext = createContext<PlayerProgressState>({ currentTime: 0, duration: 0 });

const INITIAL: QuranPlayerState = {
  surahNumber: null,
  surahName: "",
  surahArabicName: "",
  ayahNumber: null,
  totalAyahs: 0,
  reciter: loadSavedReciter(),
  isPlaying: false,
  isLoading: false,
  hasError: false,
  errorMessage: "",
  speed: 1,
  repeat: "off",
  fullPlayerOpen: false,
};

const INITIAL_PROGRESS: PlayerProgressState = { currentTime: 0, duration: 0 };

function prefetchNextAyahAudio(folder: string, surah: number, ayah: number, totalAyahs: number): void {
  if (ayah >= totalAyahs) return;
  const url = buildAudioUrl(folder, surah, ayah + 1);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "audio";
  link.href = url;
  link.id = `audio-prefetch-${surah}-${ayah + 1}`;
  const old = document.getElementById(`audio-prefetch-${surah}-${ayah}`);
  if (old) old.remove();
  if (!document.getElementById(link.id)) {
    document.head.appendChild(link);
  }
}

export function QuranPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuranPlayerState>(INITIAL);
  const [progress, setProgress] = useState<PlayerProgressState>(INITIAL_PROGRESS);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const loadAndPlayRef = useRef<(
    surah: number, ayah: number, surahName: string, surahArabicName: string,
    totalAyahs: number, reciter: Reciter, speed: PlaybackSpeed
  ) => void>(() => {});

  // ── Eagerly initialise the Audio element on mount ────────────────────────
  // This avoids cold-start latency on first user play (element creation +
  // event-listener attachment happens before the user ever taps Play).
  function getAudio(): HTMLAudioElement {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("loadstart", () => {
      setState((s) => ({ ...s, isLoading: true, hasError: false, errorMessage: "" }));
    });
    audio.addEventListener("canplay", () => {
      setState((s) => ({ ...s, isLoading: false }));
    });
    audio.addEventListener("waiting", () => {
      setState((s) => ({ ...s, isLoading: true }));
    });
    audio.addEventListener("playing", () => {
      setState((s) => ({ ...s, isPlaying: true, isLoading: false }));
      // Prefetch next ayah once current one starts playing
      const s = stateRef.current;
      if (s.surahNumber !== null && s.ayahNumber !== null) {
        prefetchNextAyahAudio(s.reciter.folder, s.surahNumber, s.ayahNumber, s.totalAyahs);
      }
    });
    audio.addEventListener("pause", () => {
      setState((s) => ({ ...s, isPlaying: false }));
    });

    // ── Progress events: update ONLY the lightweight progress context ──────
    // This prevents SurahPage / QuranPage / nav from re-rendering 4×/sec.
    audio.addEventListener("timeupdate", () => {
      const a = audioRef.current!;
      setProgress((p) => {
        const t = a.currentTime;
        const d = isFinite(a.duration) ? a.duration : 0;
        if (Math.abs(p.currentTime - t) < 0.1 && p.duration === d) return p;
        return { currentTime: t, duration: d };
      });
    });
    audio.addEventListener("durationchange", () => {
      const a = audioRef.current!;
      const d = isFinite(a.duration) ? a.duration : 0;
      setProgress((p) => p.duration === d ? p : { ...p, duration: d });
    });

    audio.addEventListener("error", () => {
      setState((s) => ({
        ...s,
        isLoading: false,
        isPlaying: false,
        hasError: true,
        errorMessage: "Could not load audio. Check your connection.",
      }));
    });
    audio.addEventListener("ended", () => {
      const s = stateRef.current;
      if (s.surahNumber === null || s.ayahNumber === null) return;

      if (s.repeat === "ayah") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        const isLast = s.ayahNumber >= s.totalAyahs;
        if (isLast && s.repeat === "off") {
          setState((p) => ({ ...p, isPlaying: false }));
          setProgress({ currentTime: 0, duration: 0 });
          return;
        }
        const next = isLast && s.repeat === "surah" ? 1 : s.ayahNumber + 1;
        loadAndPlayRef.current(
          s.surahNumber, next, s.surahName, s.surahArabicName,
          s.totalAyahs, s.reciter, s.speed
        );
      }
    });

    return audio;
  }

  // Warm up the audio element on mount — eliminates first-play cold start
  useEffect(() => {
    getAudio();
    return () => {
      const audio = audioRef.current;
      if (audio) { audio.pause(); audio.src = ""; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndPlay = useCallback((
    surah: number, ayah: number, surahName: string, surahArabicName: string,
    totalAyahs: number, reciter: Reciter, speed: PlaybackSpeed
  ) => {
    const audio = getAudio();
    const url = buildAudioUrl(reciter.folder, surah, ayah);

    setState((s) => ({
      ...s,
      surahNumber: surah,
      surahName,
      surahArabicName,
      ayahNumber: ayah,
      totalAyahs,
      reciter,
      speed,
      isLoading: true,
      hasError: false,
      errorMessage: "",
    }));
    setProgress({ currentTime: 0, duration: 0 });

    // Setting src and calling play() is sufficient — the browser fetches and
    // decodes automatically. Calling audio.load() before play() only adds an
    // extra round-trip and delays the canplay event.
    audio.src = url;
    audio.playbackRate = speed;
    audio.play().catch((err) => {
      if (err?.name !== "AbortError") {
        setState((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          hasError: true,
          errorMessage: "Playback failed. Please try again.",
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadAndPlayRef.current = loadAndPlay; }, [loadAndPlay]);

  const playAyah = useCallback((
    surah: number, ayah: number, surahName: string, surahArabicName: string, totalAyahs: number
  ) => {
    const s = stateRef.current;
    loadAndPlay(surah, ayah, surahName, surahArabicName, totalAyahs, s.reciter, s.speed);
  }, [loadAndPlay]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setState((s) => ({
      ...s,
      isPlaying: false,
      isLoading: false,
      surahNumber: null,
      ayahNumber: null,
      fullPlayerOpen: false,
    }));
    setProgress({ currentTime: 0, duration: 0 });
  }, []);

  const nextAyah = useCallback(() => {
    const s = stateRef.current;
    if (s.surahNumber === null || s.ayahNumber === null) return;
    const isLast = s.ayahNumber >= s.totalAyahs;
    if (isLast && s.repeat !== "surah") return;
    const next = isLast ? 1 : s.ayahNumber + 1;
    loadAndPlay(s.surahNumber, next, s.surahName, s.surahArabicName, s.totalAyahs, s.reciter, s.speed);
  }, [loadAndPlay]);

  const prevAyah = useCallback(() => {
    const s = stateRef.current;
    if (s.surahNumber === null || s.ayahNumber === null) return;
    const prev = Math.max(1, s.ayahNumber - 1);
    loadAndPlay(s.surahNumber, prev, s.surahName, s.surahArabicName, s.totalAyahs, s.reciter, s.speed);
  }, [loadAndPlay]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(time)) {
      audio.currentTime = time;
      setProgress((p) => ({ ...p, currentTime: time }));
    }
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = speed;
    setState((s) => ({ ...s, speed }));
  }, []);

  const setRepeat = useCallback((repeat: RepeatMode) => {
    setState((s) => ({ ...s, repeat }));
  }, []);

  const setReciter = useCallback((reciter: Reciter) => {
    saveReciter(reciter);
    const s = stateRef.current;
    if (s.surahNumber !== null && s.ayahNumber !== null) {
      loadAndPlay(
        s.surahNumber, s.ayahNumber, s.surahName, s.surahArabicName,
        s.totalAyahs, reciter, s.speed
      );
    } else {
      setState((p) => ({ ...p, reciter }));
    }
  }, [loadAndPlay]);

  const openFullPlayer = useCallback(() => {
    setState((s) => ({ ...s, fullPlayerOpen: true }));
  }, []);

  const closeFullPlayer = useCallback(() => {
    setState((s) => ({ ...s, fullPlayerOpen: false }));
  }, []);

  return (
    <QuranPlayerContext.Provider value={{
      state, playAyah, togglePlayPause, stop, nextAyah, prevAyah,
      seek, setSpeed, setRepeat, setReciter, openFullPlayer, closeFullPlayer,
    }}>
      <PlayerProgressContext.Provider value={progress}>
        {children}
      </PlayerProgressContext.Provider>
    </QuranPlayerContext.Provider>
  );
}

export function useQuranPlayer(): QuranPlayerContextValue {
  const ctx = useContext(QuranPlayerContext);
  if (!ctx) throw new Error("useQuranPlayer must be inside QuranPlayerProvider");
  return ctx;
}

/** Subscribe only to currentTime/duration — does NOT re-render on player state changes. */
export function usePlayerProgress(): PlayerProgressState {
  return useContext(PlayerProgressContext);
}
