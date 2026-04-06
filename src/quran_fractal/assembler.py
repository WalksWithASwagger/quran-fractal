"""Edition assembly and structural normalization."""

from __future__ import annotations

from .config import MERGE_V1_SURAHS, UTHMANI_SURAHS, WORD_MERGE_VERSES

EditionVerse = tuple[int, int, str]


def assemble_fractal_edition(
    simple_verses: dict[tuple[int, int], str],
    uthmani_verses: dict[tuple[int, int], str],
) -> list[EditionVerse]:
    """Assemble the base Fractal Edition by selecting the source per surah."""
    all_keys = set(simple_verses.keys()) | set(uthmani_verses.keys())
    all_surahs = sorted({surah for surah, _ayah in all_keys})

    edition: list[EditionVerse] = []
    for surah in all_surahs:
        source = uthmani_verses if surah in UTHMANI_SURAHS else simple_verses
        surah_ayahs = sorted(
            [(s, a) for (s, a) in source.keys() if s == surah],
            key=lambda item: item[1],
        )
        for s, a in surah_ayahs:
            edition.append((s, a, source[(s, a)]))

    return edition


def apply_verse_merges(edition: list[EditionVerse]) -> tuple[list[EditionVerse], dict[int, str]]:
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

        if surah in MERGE_V1_SURAHS and ayah > 2:
            merged_edition.append((surah, ayah - 1, text))
        else:
            merged_edition.append((surah, ayah, text))

    return merged_edition, original_v1_texts


def apply_word_merges(edition: list[EditionVerse]) -> tuple[list[EditionVerse], int]:
    merged: list[EditionVerse] = []
    applied = 0

    for surah, ayah, text in edition:
        if (surah, ayah) in WORD_MERGE_VERSES:
            idx_a, idx_b = WORD_MERGE_VERSES[(surah, ayah)]
            words = text.split()
            joined = words[idx_a] + words[idx_b]
            text = " ".join(words[:idx_a] + [joined] + words[idx_b + 1 :])
            applied += 1
        merged.append((surah, ayah, text))

    return merged, applied


def normalize_edition(
    simple_verses: dict[tuple[int, int], str],
    uthmani_verses: dict[tuple[int, int], str],
) -> tuple[list[EditionVerse], dict[int, str], int]:
    edition = assemble_fractal_edition(simple_verses, uthmani_verses)
    edition, original_v1_texts = apply_verse_merges(edition)
    edition, word_merges_done = apply_word_merges(edition)
    return edition, original_v1_texts, word_merges_done
