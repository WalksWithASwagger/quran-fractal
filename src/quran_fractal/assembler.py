"""Edition assembly and structural normalization."""

from __future__ import annotations

from .config import MERGE_V1_SURAHS, UTHMANI_SURAHS, WORD_MERGE_VERSES

EditionVerse = tuple[int, int, str]


def _index_surahs(verses: dict[tuple[int, int], str]) -> dict[int, list[int]]:
    by_surah: dict[int, list[int]] = {}
    for surah, ayah in verses:
        by_surah.setdefault(surah, []).append(ayah)
    for surah, ayahs in by_surah.items():
        by_surah[surah] = sorted(ayahs)
    return by_surah


def _validate_surah_ayah_sequence(surah: int, ayahs: list[int], source_name: str) -> None:
    if not ayahs:
        raise ValueError(f"Missing surah {surah} in {source_name} source.")
    if ayahs[0] != 1:
        raise ValueError(
            f"Invalid ayah numbering in {source_name} source for surah {surah}: "
            f"first ayah is {ayahs[0]}, expected 1."
        )
    expected = list(range(1, ayahs[-1] + 1))
    if ayahs != expected:
        missing = sorted(set(expected) - set(ayahs))
        raise ValueError(
            f"Non-contiguous ayah numbering in {source_name} source for surah {surah}. "
            f"Missing ayahs: {missing[:10]}{'...' if len(missing) > 10 else ''}"
        )


def assemble_fractal_edition(
    simple_verses: dict[tuple[int, int], str],
    uthmani_verses: dict[tuple[int, int], str],
) -> list[EditionVerse]:
    """Assemble the base Fractal Edition by selecting the source per surah."""
    simple_index = _index_surahs(simple_verses)
    uthmani_index = _index_surahs(uthmani_verses)

    expected_surahs = set(range(1, 115))
    required_simple_surahs = expected_surahs - UTHMANI_SURAHS
    missing_simple = sorted(required_simple_surahs - set(simple_index.keys()))
    missing_uthmani = sorted(UTHMANI_SURAHS - set(uthmani_index.keys()))
    if missing_simple or missing_uthmani:
        details: list[str] = []
        if missing_simple:
            details.append(f"simple missing surahs {missing_simple}")
        if missing_uthmani:
            details.append(f"uthmani missing surahs {missing_uthmani}")
        raise ValueError("Source files do not contain required surahs: " + "; ".join(details))

    edition: list[EditionVerse] = []
    for surah in sorted(expected_surahs):
        if surah in UTHMANI_SURAHS:
            source = uthmani_verses
            ayahs = uthmani_index.get(surah, [])
            source_name = "Uthmani"
        else:
            source = simple_verses
            ayahs = simple_index.get(surah, [])
            source_name = "Simple"

        _validate_surah_ayah_sequence(surah, ayahs, source_name)
        for ayah in ayahs:
            edition.append((surah, ayah, source[(surah, ayah)]))

    return edition


def apply_verse_merges(edition: list[EditionVerse]) -> tuple[list[EditionVerse], dict[int, str]]:
    merge_keys = {(surah, ayah) for surah, ayah, _text in edition if surah in MERGE_V1_SURAHS}
    expected_keys = {(surah, 1) for surah in MERGE_V1_SURAHS} | {(surah, 2) for surah in MERGE_V1_SURAHS}
    missing_keys = sorted(expected_keys - merge_keys)
    if missing_keys:
        raise ValueError(f"Cannot apply verse merges: missing expected verse keys {missing_keys}")

    merged_edition: list[EditionVerse] = []
    original_v1_texts: dict[int, str] = {}
    held_v1: tuple[int, str] | None = None

    for surah, ayah, text in edition:
        if surah in MERGE_V1_SURAHS and ayah == 1:
            held_v1 = (surah, text)
            original_v1_texts[surah] = text
            continue

        if surah in MERGE_V1_SURAHS and ayah == 2 and held_v1 and held_v1[0] == surah:
            merged_edition.append((surah, 1, held_v1[1] + " " + text))
            held_v1 = None
            continue
        if surah in MERGE_V1_SURAHS and ayah == 2 and held_v1 is None:
            raise ValueError(
                f"Cannot merge verse 1+2 for surah {surah}: verse 2 encountered before verse 1."
            )

        if surah in MERGE_V1_SURAHS and ayah > 2:
            merged_edition.append((surah, ayah - 1, text))
        else:
            merged_edition.append((surah, ayah, text))

    if held_v1 is not None:
        raise ValueError(
            f"Cannot merge verse 1+2 for surah {held_v1[0]}: verse 2 was not found."
        )

    return merged_edition, original_v1_texts


def apply_word_merges(edition: list[EditionVerse]) -> tuple[list[EditionVerse], int]:
    merged: list[EditionVerse] = []
    applied = 0
    remaining_targets = set(WORD_MERGE_VERSES.keys())

    for surah, ayah, text in edition:
        if (surah, ayah) in WORD_MERGE_VERSES:
            remaining_targets.discard((surah, ayah))
            idx_a, idx_b = WORD_MERGE_VERSES[(surah, ayah)]
            if idx_b != idx_a + 1:
                raise ValueError(
                    f"Invalid word merge rule for {surah}:{ayah}: indexes must be adjacent, "
                    f"got ({idx_a}, {idx_b})."
                )
            words = text.split()
            if idx_a < 0 or idx_b < 0 or idx_a >= len(words) or idx_b >= len(words):
                raise ValueError(
                    f"Word merge rule out of range for {surah}:{ayah}: "
                    f"indexes ({idx_a}, {idx_b}) with {len(words)} words."
                )
            joined = words[idx_a] + words[idx_b]
            text = " ".join(words[:idx_a] + [joined] + words[idx_b + 1 :])
            applied += 1
        merged.append((surah, ayah, text))

    if remaining_targets:
        missing = sorted(remaining_targets)
        raise ValueError(f"Word merge targets not found in assembled edition: {missing}")

    return merged, applied


def normalize_edition(
    simple_verses: dict[tuple[int, int], str],
    uthmani_verses: dict[tuple[int, int], str],
) -> tuple[list[EditionVerse], dict[int, str], int]:
    edition = assemble_fractal_edition(simple_verses, uthmani_verses)
    edition, original_v1_texts = apply_verse_merges(edition)
    edition, word_merges_done = apply_word_merges(edition)
    return edition, original_v1_texts, word_merges_done
