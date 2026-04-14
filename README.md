# quran-fractal

Verification pipeline and artifacts for the [74:30 Project](https://7430project.com).

## Overview

This repository assembles a Fractal Edition of the Quran from Tanzil source files, applies the project’s merge rules, counts the Muqatta'at letter groups, and produces both:

- a human-readable artifact: `fractal_edition.txt`
- a machine-readable artifact: `build/verification-summary.json`

The core claim under examination is:

`39,349 = 19² × P(29)`

where `39,349` is the sum of the 13 Muqatta'at group totals and also the word count of the 29 Muqatta'at surahs in the assembled edition.

## Quick Start

### Legacy entrypoint

```bash
python3 verify.py
```

### Packaged CLI

```bash
python3 -m quran_fractal verify --base-dir . --log-level INFO
```

If you want the installed console script:

```bash
python3 -m pip install -e ".[dev]"
quran-fractal verify
```

## Outputs

Running the verifier produces:

- `fractal_edition.txt`: assembled text plus the long-form verification narrative
- `build/verification-summary.json`: structured summary intended for future web/docs consumers

## Project Layout

- `src/quran_fractal/`: package code
- `tests/`: regression and parser tests
- `docs/`: methodology, architecture, data, and contribution docs
- `tanzil_data/`: source text inputs
- `verify.py`: compatibility wrapper for the packaged CLI

## Development

Install tooling:

```bash
python3 -m pip install -e ".[dev]"
```

Run tests:

```bash
pytest
```

Run linting:

```bash
ruff check .
```

## What The Code Does

1. Loads the Tanzil Simple and Uthmani text sources.
2. Assembles a single edition with surah-level source selection.
3. Applies verse-merge and word-merge normalization rules.
4. Verifies all 13 Muqatta'at groups against expected totals.
5. Computes aggregate book-level statistics.
6. Writes text and JSON artifacts for downstream use.

## The 13 Groups

| # | Group | Surahs | Total | ÷19 | Tier |
|---|-------|--------|------:|----:|------|
| 1 | ALM | 2,3,29,30,31,32 | 18,012 | 948 | 1 |
| 2 | ALR | 10,11,12,14,15 | 7,828 | 412 | 2 |
| 3 | ALMR | 13 | 1,178 | 62 | 2 |
| 4 | ALMS | 7,38 | 4,997 | 263 | 1 |
| 5 | HM | 40-46 | 2,147 | 113 | 1 |
| 6 | ASQ | 42 | 209 | 11 | 1 |
| 7 | Q | 50 | 57 | 3 | 1 |
| 8 | KHYAS | 19 | 798 | 42 | 1 |
| 9 | TSM | 26,28 | 1,178 | 62 | 1 |
| 10 | YS | 36 | 285 | 15 | 1 |
| 11 | N | 68 | 361 | 19 | 2 |
| 12 | TH | 20 | 1,292 | 68 | 2 |
| 13 | TS | 27 | 1,007 | 53 | 2 |
| | **Total** | | **39,349** | **2,071** | |

## Docs

- `docs/methodology.md`
- `docs/architecture.md`
- `docs/data-sources.md`
- `docs/contributing.md`
- `docs/api-contract.md`

## Source Data

Quran text comes from [tanzil.net](https://tanzil.net) under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/).

The JSON and text artifacts include source file hashes to support reproducibility.
