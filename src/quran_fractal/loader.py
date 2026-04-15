"""Source file resolution and loading helpers."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import TextIO

from .config import SIMPLE_CLEAN_CANDIDATES, UTHMANI_PATH


def resolve_source_paths(base_dir: Path) -> tuple[Path, Path]:
    simple_path = None
    for candidate in SIMPLE_CLEAN_CANDIDATES:
        candidate_path = base_dir / candidate
        if candidate_path.is_file():
            simple_path = candidate_path
            break

    if simple_path is None:
        candidates = ", ".join(str(base_dir / candidate) for candidate in SIMPLE_CLEAN_CANDIDATES)
        raise FileNotFoundError(
            "Simple-Clean source file not found. Looked in: "
            f"{candidates}. Download the Tanzil Simple Clean text and save it in tanzil_data/."
        )

    uthmani_path = base_dir / UTHMANI_PATH
    if not uthmani_path.is_file():
        raise FileNotFoundError(
            f"Uthmani source file not found at {uthmani_path}. "
            "Download the Tanzil Uthmani text and save it in tanzil_data/."
        )

    return simple_path, uthmani_path


def _parse_quran_lines(handle: TextIO, filepath: Path) -> tuple[dict[tuple[int, int], str], str | None]:
    verses: dict[tuple[int, int], str] = {}
    first_data_line = None

    for lineno, raw_line in enumerate(handle, start=1):
        line = raw_line.strip("\r\n\t ")
        if not line or line.startswith("#"):
            continue
        if first_data_line is None:
            first_data_line = line

        parts = line.split("|", 2)
        if len(parts) != 3:
            raise ValueError(
                f"Malformed line in {filepath} at line {lineno}: expected 'surah|ayah|text'."
            )

        try:
            surah = int(parts[0])
            ayah = int(parts[1])
        except ValueError as exc:
            raise ValueError(
                f"Malformed line in {filepath} at line {lineno}: surah and ayah must be integers."
            ) from exc

        if surah < 1 or ayah < 1:
            raise ValueError(
                f"Malformed line in {filepath} at line {lineno}: surah/ayah must be positive."
            )

        key = (surah, ayah)
        if key in verses:
            raise ValueError(
                f"Duplicate verse key in {filepath} at line {lineno}: {surah}|{ayah}."
            )
        verses[key] = parts[2]

    return verses, first_data_line


def load_quran_file(filepath: Path) -> dict[tuple[int, int], str]:
    """Load a pipe-delimited Tanzil Quran file using strict UTF-8 decoding."""
    decode_errors: list[str] = []
    verses: dict[tuple[int, int], str] = {}
    first_data_line = None

    for encoding in ("utf-8-sig", "utf-8"):
        try:
            with filepath.open("r", encoding=encoding) as handle:
                verses, first_data_line = _parse_quran_lines(handle, filepath)
        except UnicodeDecodeError as exc:
            decode_errors.append(f"{encoding}: {exc}")
            continue
        else:
            break

    if not verses and first_data_line:
        raise ValueError(
            "File loaded but no pipe-delimited verses were found. "
            f"First data line: {first_data_line[:80]}"
        )

    if not verses:
        if decode_errors:
            error_detail = "; ".join(decode_errors)
            raise ValueError(
                f"Unable to decode {filepath} as UTF-8 Tanzil text. "
                f"Decoding attempts failed: {error_detail}"
            )
        raise ValueError(f"No verses could be parsed from {filepath}.")

    return verses


def compute_sha256(filepath: Path) -> str:
    return hashlib.sha256(filepath.read_bytes()).hexdigest()
