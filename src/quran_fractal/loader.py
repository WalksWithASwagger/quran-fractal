"""Source file resolution and loading helpers."""

from __future__ import annotations

import hashlib
from pathlib import Path

from .config import SIMPLE_CLEAN_CANDIDATES, UTHMANI_PATH


def resolve_source_paths(base_dir: Path) -> tuple[Path, Path]:
    simple_path = None
    for candidate in SIMPLE_CLEAN_CANDIDATES:
        candidate_path = base_dir / candidate
        if candidate_path.exists():
            simple_path = candidate_path
            break

    if simple_path is None:
        candidates = ", ".join(str(base_dir / candidate) for candidate in SIMPLE_CLEAN_CANDIDATES)
        raise FileNotFoundError(
            "Simple-Clean source file not found. Looked in: "
            f"{candidates}. Download the Tanzil Simple Clean text and save it in tanzil_data/."
        )

    uthmani_path = base_dir / UTHMANI_PATH
    if not uthmani_path.exists():
        raise FileNotFoundError(
            f"Uthmani source file not found at {uthmani_path}. "
            "Download the Tanzil Uthmani text and save it in tanzil_data/."
        )

    return simple_path, uthmani_path


def load_quran_file(filepath: Path) -> dict[tuple[int, int], str]:
    """Load a pipe-delimited Tanzil Quran file."""
    verses: dict[tuple[int, int], str] = {}
    first_data_line = None

    for encoding in ["utf-8-sig", "utf-8", "latin-1"]:
        try:
            with filepath.open("r", encoding=encoding) as handle:
                for raw_line in handle:
                    line = raw_line.strip("\r\n\t ")
                    if not line or line.startswith("#"):
                        continue
                    if first_data_line is None:
                        first_data_line = line
                    parts = line.split("|", 2)
                    if len(parts) != 3:
                        continue
                    try:
                        surah = int(parts[0])
                        ayah = int(parts[1])
                    except ValueError:
                        continue
                    verses[(surah, ayah)] = parts[2]
            break
        except UnicodeDecodeError:
            continue

    if not verses and first_data_line:
        raise ValueError(
            "File loaded but no pipe-delimited verses were found. "
            f"First data line: {first_data_line[:80]}"
        )

    if not verses:
        raise ValueError(f"No verses could be parsed from {filepath}.")

    return verses


def compute_sha256(filepath: Path) -> str:
    return hashlib.sha256(filepath.read_bytes()).hexdigest()
