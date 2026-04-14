# Contributing

## Setup

```bash
python3 -m pip install -e ".[dev]"
```

## Local Checks

```bash
ruff check .
pytest
```

## Expectations

- Keep behavior stable unless a change explicitly updates methodology.
- Add or update regression tests for any behavior change.
- Prefer changes inside `src/quran_fractal/` over expanding the compatibility wrapper in `verify.py`.
- Keep generated artifacts out of version control unless a change explicitly requires them.

## Where To Start

- `docs/architecture.md` for code layout
- `docs/methodology.md` for domain rules
- `tests/` for current regression coverage
