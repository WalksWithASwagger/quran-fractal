# API Contract

The project ships a Next.js research explorer and emits stable JSON artifacts consumed by that app.

## Artifacts

Default output paths:

- `build/verification-summary.json` (verification summary + source hashes)
- `web/public/data/quran-data.json` (full explorer dataset)

## Verification Summary Shape

```json
{
  "generated_on": "2026-04-05",
  "source_files": [
    {
      "label": "Simple-Plain",
      "path": "/abs/path/to/file",
      "sha256": "..."
    }
  ],
  "summary": {
    "grand_total": 39349,
    "expected_grand_total": 39349,
    "all_groups_pass": true,
    "groups": [],
    "gradient": {}
  }
}
```

## Web Explorer Data Shape

`web/public/data/quran-data.json` contains:

- `groups`: display metadata, per-group totals, and per-surah breakdowns
- `surahs`: surah index data for browsing/filtering
- `verses`: verse text, word counts, and optional per-group letter counts (`lc`)
- `gradient`: aggregate totals for book-level metrics

## Group Fields

Each group entry contains:

- `name`
- `surahs`
- `edition`
- `exclude_v1`
- `total`
- `expected`
- `verified`
- `consonant_total`
- `alif_total`
- `per_surah`

## Intended Consumers

- the `/explore` web app
- static or API-backed result sites
- external analysis clients that should not re-implement counting rules

## Guidance For A Future Web Layer

- Treat the Python package as the source of truth.
- Read JSON artifacts or call the package through a thin API wrapper.
- Do not duplicate the verification algorithm in JavaScript.
