from pathlib import Path

import pytest

from quran_fractal.loader import load_quran_file, resolve_source_paths


def test_load_quran_file_parses_pipe_delimited_text(tmp_path: Path) -> None:
    sample = tmp_path / "sample.txt"
    sample.write_text("\ufeff# comment\n1|1|abc\n1|2|def\n", encoding="utf-8")

    verses = load_quran_file(sample)

    assert verses == {(1, 1): "abc", (1, 2): "def"}


def test_load_quran_file_rejects_non_pipe_delimited_text(tmp_path: Path) -> None:
    sample = tmp_path / "bad.txt"
    sample.write_text("not a valid tanzil file\n", encoding="utf-8")

    with pytest.raises(ValueError):
        load_quran_file(sample)


def test_resolve_source_paths_prefers_existing_repo_files() -> None:
    repo_root = Path(__file__).resolve().parents[1]

    simple_path, uthmani_path = resolve_source_paths(repo_root)

    assert simple_path.name == "quran-simple-plain.txt"
    assert uthmani_path.name == "quran-uthmani.txt"
