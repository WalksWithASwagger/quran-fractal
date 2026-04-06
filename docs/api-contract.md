# API Contract

This project does not ship a web app yet, but it now emits a stable JSON artifact for future web and docs consumers.

## Artifact

Default path:

`build/verification-summary.json`

## Top-Level Shape

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

## Group Object

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

- a static results site
- a thin API layer
- frontend visualizations that must not re-implement the counting logic

## Guidance For A Future Web Layer

- Treat the Python package as the source of truth.
- Read JSON artifacts or call the package through a thin API.
- Do not duplicate the verification algorithm in JavaScript.
