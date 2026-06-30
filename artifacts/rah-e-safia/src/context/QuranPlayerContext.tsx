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
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  repeat: RepeatMode;
  fullPlayerOpen: boolean;
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
  currentTime: 0,
  duration: 0,
  speed: 1,
  repeat: "off",
  fullPlayerOpen: false,
};

export function QuranPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuranPlayerState>(INITIAL);

  // Singleton audio element — persists across route changes
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Always-current state ref so audio event handlers avoid stale closures
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Ref to loadAndPlay so the "ended" handler can always call the latest version
  const loadAndPlayRef = useRef<(
    surah: number, ayah: number, surahName: string, surahArabicName: string,
    totalAyahs: number, reciter: Reciter, speed: PlaybackSpeed
  ) => void>(() => {});

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
    });
    audio.addEventListener("pause", () => {
      setState((s) => ({ ...s, isPlaying: false }));
    });
    audio.addEventListener("timeupdate", () => {
      const a = audioRef.current!;
      setState((s) => ({
        ...s,
        currentTime: a.currentTime,
        duration: isFinite(a.duration) ? a.duration : 0,
      }));
    });
    audio.addEventListener("durationchange", () => {
      const a = audioRef.current!;
      setState((s) => ({
        ...s,
        duration: isFinite(a.duration) ? a.duration : 0,
      }));
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
          setState((p) => ({ ...p, isPlaying: false, currentTime: 0 }));
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
      currentTime: 0,
      duration: 0,
    }));

    audio.src = url;
    audio.playbackRate = speed;
    audio.load();
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

  // Keep ref up to date
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
      currentTime: 0,
      duration: 0,
      fullPlayerOpen: false,
    }));
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
      setState((s) => ({ ...s, currentTime: time }));
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) { audio.pause(); audio.src = ""; }
    };
  }, []);

  return (
    <QuranPlayerContext.Provider value={{
      state, playAyah, togglePlayPause, stop, nextAyah, prevAyah,
      seek, setSpeed, setRepeat, setReciter, openFullPlayer, closeFullPlayer,
    }}>
      {children}
    </QuranPlayerContext.Provider>
  );
}

export function useQuranPlayer(): QuranPlayerContextValue {
  const ctx = useContext(QuranPlayerContext);
  if (!ctx) throw new Error("useQuranPlayer must be inside QuranPlayerProvider");
  return ctx;
}
