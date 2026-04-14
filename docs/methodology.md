# Methodology

This project verifies a set of fixed counting rules against Tanzil Quran source files.

## Inputs

- `tanzil_data/quran-simple-plain.txt`
- `tanzil_data/quran-uthmani.txt`

Both files are expected to be pipe-delimited in the format `surah|ayah|text`.

## Core Rules

- Some surahs are taken from the Uthmani source, while the rest come from the simple source.
- Verse 1 is merged into verse 2 for surahs `19`, `20`, `31`, and `36`.
- Six verses receive word-boundary corrections for the vocative `يا`.
- Each Muqatta'at group has a fixed set of counted characters and an expected total.

## Invariants

- All 13 group totals must divide by 19.
- Their grand total must equal `39,349`.
- The assembled edition should yield:
  - `6,232` verses
  - `82,498` words
  - `39,349` words in the 29 Muqatta'at surahs

## Known Methodological Sensitivities

- Uthmani alif-family variants are significant for Tier 2 groups.
- Verse-merge and word-merge rules are explicit editorial choices in code and must be documented, not implied.
- The project should treat these choices as auditable configuration, not hidden implementation details.
