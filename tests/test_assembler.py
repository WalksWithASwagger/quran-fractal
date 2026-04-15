import pytest

import quran_fractal.assembler as assembler
from quran_fractal.config import UTHMANI_SURAHS


def _minimal_complete_sources() -> tuple[dict[tuple[int, int], str], dict[tuple[int, int], str]]:
    simple: dict[tuple[int, int], str] = {}
    uthmani: dict[tuple[int, int], str] = {}
    for surah in range(1, 115):
        if surah in UTHMANI_SURAHS:
            uthmani[(surah, 1)] = f"u-{surah}"
        else:
            simple[(surah, 1)] = f"s-{surah}"
    return simple, uthmani


def test_assemble_fractal_edition_fails_when_required_surah_missing() -> None:
    simple, uthmani = _minimal_complete_sources()
    simple.pop((1, 1))

    with pytest.raises(ValueError, match="missing surahs"):
        assembler.assemble_fractal_edition(simple, uthmani)


def test_assemble_fractal_edition_fails_on_non_contiguous_ayahs() -> None:
    simple, uthmani = _minimal_complete_sources()
    simple[(2, 3)] = "extra-ayah-with-gap"

    with pytest.raises(ValueError, match="Non-contiguous ayah numbering"):
        assembler.assemble_fractal_edition(simple, uthmani)


def test_apply_word_merges_fails_for_out_of_range_indexes(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(assembler, "WORD_MERGE_VERSES", {(1, 1): (0, 1)})
    edition = [(1, 1, "single")]

    with pytest.raises(ValueError, match="out of range"):
        assembler.apply_word_merges(edition)


def test_apply_word_merges_fails_when_target_verse_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(assembler, "WORD_MERGE_VERSES", {(1, 1): (0, 1)})
    edition = [(1, 2, "a b")]

    with pytest.raises(ValueError, match="targets not found"):
        assembler.apply_word_merges(edition)
