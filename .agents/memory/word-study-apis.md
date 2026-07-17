---
name: Quranic Word Study APIs
description: Confirmed working free APIs for word-by-word Quran data and occurrence search
---

## Confirmed Working APIs (July 2026)

### Word-by-word data
- **Endpoint**: `https://api.quran.com/api/v4/verses/by_key/{surah}:{ayah}?words=true&word_fields=text_uthmani,transliteration,location,char_type_name`
- Returns: `text_uthmani`, `translation.text`, `transliteration.text`, `audio_url`, `position`, `char_type_name`
- `char_type_name` values: `"word"` (actual words), `"end"` (verse number marker), `"pause"`, etc.
- Translations controlled by `&translations=131` (Sahih International, English)
- No auth required

### Word audio
- **Base URL**: `https://audio.qurancdn.com/`
- Audio URL from API is relative, prepend base: `audio.qurancdn.com/wbw/001_001_001.mp3`
- Returns HTTP 200 for valid word positions

### Occurrence search
- **Endpoint**: `https://api.alquran.cloud/v1/search/{encoded_word}/all/quran-uthmani`
- Returns: `data.count`, `data.matches[]` with `surah.number`, `surah.englishName`, `numberInSurah`, `text`
- Searches unvocalised text; strip diacritics before sending for best results
- No auth required

### Dead endpoint (do NOT use)
- `https://api.qurancdn.com/api/qdc/corpus/morphology?verse_key=...` → 404
- Full morphological data (root, lemma, POS) not available from any confirmed free API

## Architecture decisions

**Word splitting**: `ayah.arabic.split(/\s+/).filter(Boolean)` — tokens index 0-based maps to quran.com `position` 1-based after filtering `char_type_name === "word"` only.

**Matching strategy**: Use `wordIndex` (split-array index) → `realWords[wordIndex]` where `realWords = words.filter(w => w.charType === "word")`. Safer than text-matching due to possible Unicode normalization differences.

**`isArabicWord` regex**: `/[\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06FA-\u06FF]/` — filters out pure punctuation marks like ۚ ۖ that should not be interactive.

**Why:** qurancdn.com morphology 404'd during development; quran.com v4 API confirmed working and provides sufficient data for a rich word-study experience without morphological breakdown.
