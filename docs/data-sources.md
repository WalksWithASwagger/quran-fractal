# Data Sources

## Upstream

The repository uses Quran text downloaded from [tanzil.net](https://tanzil.net).

Expected files:

- `quran-simple-clean.txt` or `quran-simple-plain.txt`
- `quran-uthmani.txt`

## File Format

Each file must be pipe-delimited:

```text
1|1|text
1|2|text
```

Comment lines starting with `#` are ignored.

## Reproducibility

Every verification run writes source file hashes into:

- `fractal_edition.txt`
- `build/verification-summary.json`

This gives downstream reviewers a way to confirm exactly which source texts produced the artifacts.

## Licensing

The Tanzil text is distributed under Creative Commons Attribution 3.0. Check the upstream site for the latest attribution guidance.
