# Architecture

`quran-fractal` is now organized as a small Python package with a thin CLI layer.

## Flow

1. `loader.py` resolves and parses the Tanzil source files.
2. `assembler.py` chooses the per-surah source edition and applies normalization rules.
3. `counting.py` verifies each Muqatta'at group and computes book-level stats.
4. `artifacts.py` writes the text artifact and the JSON summary.
5. `service.py` orchestrates the run for CLI and future web/API consumers.

## Package Layout

- `quran_fractal.config`: static configuration and group definitions
- `quran_fractal.loader`: source resolution, parsing, and hashing
- `quran_fractal.assembler`: edition assembly and merge rules
- `quran_fractal.counting`: group verification and aggregate statistics
- `quran_fractal.artifacts`: text and JSON output writers
- `quran_fractal.service`: top-level pipeline orchestration
- `quran_fractal.cli`: command-line interface

## Design Principles

- Keep the verification logic importable and testable.
- Preserve existing behavior before changing methodology.
- Separate domain rules from CLI and artifact concerns.
- Emit machine-readable outputs so a future web layer can stay thin.
