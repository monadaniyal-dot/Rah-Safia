---
name: Aladhan API method and school parameters
description: Numeric codes for prayer calculation method and madhab passed to Aladhan API.
---

## Rule
When calling `https://api.aladhan.com/v1/timings/{date}?latitude=&longitude=&method=N&school=N`:

**method (calculationMethod setting → Aladhan number):**
- MWL → 1 (Muslim World League)
- ISNA → 2 (Islamic Society of North America)
- Egypt → 3 (Egyptian General Authority)
- Makkah → 4 (Umm al-Qura University)
- Karachi → 5 (University of Islamic Sciences)

**school (madhab setting → Aladhan number):**
- shafi (Shafi'i/Maliki/Hanbali, standard shadow factor 1x) → 0
- hanafi (shadow factor 2x) → 1

## Why
Hardcoded in PrayerTimesPage `ALADHAN_METHOD` and `ALADHAN_SCHOOL` maps. The setting strings match the `value` fields in `CALCULATION_METHODS` and `MADHAB_OPTIONS` arrays in SettingsPage.
