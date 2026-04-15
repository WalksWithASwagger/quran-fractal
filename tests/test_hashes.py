"""Tests for source file hash verification."""

from pathlib import Path

import pytest

from quran_fractal.hashes import (
    GOLDEN_HASHES,
    all_hashes_valid,
    verify_source_hashes,
)


@pytest.fixture
def repo_root() -> Path:
    """Get the repository root directory."""
    return Path(__file__).resolve().parents[1]


def test_golden_hashes_defined():
    """Ensure golden hashes are defined for expected files."""
    assert "quran-simple-plain.txt" in GOLDEN_HASHES
    assert "quran-uthmani.txt" in GOLDEN_HASHES
    assert len(GOLDEN_HASHES) == 2


def test_source_file_hashes(repo_root: Path):
    """Verify all source files match their golden hashes."""
    results = verify_source_hashes(repo_root)

    for filename, passed, msg in results:
        assert passed, f"{filename}: {msg}"


def test_all_hashes_valid(repo_root: Path):
    """Verify the all_hashes_valid helper returns True."""
    assert all_hashes_valid(repo_root), "Source file hash verification failed"


def test_verify_returns_results_for_all_files(repo_root: Path):
    """Ensure verify_source_hashes returns a result for each golden hash."""
    results = verify_source_hashes(repo_root)
    assert len(results) == len(GOLDEN_HASHES)
