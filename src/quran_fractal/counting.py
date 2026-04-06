"""Counting and verification logic."""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass

from .assembler import EditionVerse
from .config import EXPECTED_GRAND_TOTAL, GROUPS, MERGE_V1_SURAHS, MUQATTAAT_SURAHS


@dataclass(frozen=True)
class GroupResult:
    name: str
    total: int
    consonant_total: int
    alif_total: int
    per_surah: list[tuple[int, int, int, int]]
    surahs: list[int]
    edition: str
    exclude_v1: bool
    consonants: list[str]
    alif_chars: list[str]
    expected: int

    @property
    def verified(self) -> bool:
        return self.total == self.expected and self.total % 19 == 0


@dataclass(frozen=True)
class GradientStats:
    total_letters: int
    total_verses: int
    total_words: int
    muqattaat_words: int


def count_chars_in_surah(
    edition_list: list[EditionVerse],
    surah: int,
    char_set: set[str],
    original_v1_texts: dict[int, str],
    exclude_v1: bool = False,
) -> int:
    total = 0
    for current_surah, ayah, text in edition_list:
        if current_surah != surah:
            continue
        if exclude_v1 and ayah == 1:
            if surah in MERGE_V1_SURAHS and surah in original_v1_texts:
                orig_v1_len = len(original_v1_texts[surah])
                text = text[orig_v1_len + 1 :]
            else:
                continue
        total += sum(1 for char in text if char in char_set)
    return total


def verify_group(
    edition_list: list[EditionVerse],
    group_name: str,
    surahs: list[int],
    edition: str,
    exclude_v1: bool,
    consonants: list[str],
    alif_chars: list[str],
    expected: int,
    original_v1_texts: dict[int, str],
) -> GroupResult:
    char_set = set(consonants + alif_chars)
    consonant_set = set(consonants)
    alif_set = set(alif_chars)

    total = 0
    consonant_total = 0
    alif_total = 0
    per_surah: list[tuple[int, int, int, int]] = []

    for surah in surahs:
        surah_total = count_chars_in_surah(
            edition_list,
            surah,
            char_set,
            original_v1_texts,
            exclude_v1,
        )
        surah_consonants = count_chars_in_surah(
            edition_list,
            surah,
            consonant_set,
            original_v1_texts,
            exclude_v1,
        )
        surah_alif = (
            count_chars_in_surah(edition_list, surah, alif_set, original_v1_texts, exclude_v1)
            if alif_chars
            else 0
        )
        total += surah_total
        consonant_total += surah_consonants
        alif_total += surah_alif
        per_surah.append((surah, surah_consonants, surah_alif, surah_total))

    return GroupResult(
        name=group_name,
        total=total,
        consonant_total=consonant_total,
        alif_total=alif_total,
        per_surah=per_surah,
        surahs=surahs,
        edition=edition,
        exclude_v1=exclude_v1,
        consonants=consonants,
        alif_chars=alif_chars,
        expected=expected,
    )


def verify_all_groups(
    edition_list: list[EditionVerse],
    original_v1_texts: dict[int, str],
) -> tuple[list[GroupResult], int, bool]:
    results: list[GroupResult] = []
    grand_total = 0
    all_pass = True

    for group in GROUPS:
        result = verify_group(
            edition_list=edition_list,
            group_name=group.name,
            surahs=group.surahs,
            edition=group.edition,
            exclude_v1=group.exclude_v1,
            consonants=group.consonants,
            alif_chars=group.alif_chars,
            expected=group.expected_total,
            original_v1_texts=original_v1_texts,
        )
        results.append(result)
        grand_total += result.total
        if not result.verified:
            all_pass = False

    return results, grand_total, all_pass


def compute_gradient_stats(edition_list: list[EditionVerse]) -> GradientStats:
    total_letters = 0
    total_words = 0
    muqattaat_words = 0

    for surah, _ayah, text in edition_list:
        total_letters += sum(
            1
            for char in text
            if "\u0600" <= char <= "\u06FF" and unicodedata.category(char).startswith("L")
        )
        word_count = len(text.split())
        total_words += word_count
        if surah in MUQATTAAT_SURAHS:
            muqattaat_words += word_count

    return GradientStats(
        total_letters=total_letters,
        total_verses=len(edition_list),
        total_words=total_words,
        muqattaat_words=muqattaat_words,
    )


def build_summary(results: list[GroupResult], gradient: GradientStats) -> dict[str, object]:
    grand_total = sum(result.total for result in results)
    all_groups_pass = all(result.verified for result in results)
    return {
        "grand_total": grand_total,
        "expected_grand_total": EXPECTED_GRAND_TOTAL,
        "all_groups_pass": all_groups_pass,
        "groups": [
            {
                "name": result.name,
                "surahs": result.surahs,
                "edition": result.edition,
                "exclude_v1": result.exclude_v1,
                "total": result.total,
                "expected": result.expected,
                "verified": result.verified,
                "consonant_total": result.consonant_total,
                "alif_total": result.alif_total,
                "per_surah": [
                    {
                        "surah": surah,
                        "consonants": consonants,
                        "alif": alif,
                        "total": total,
                    }
                    for surah, consonants, alif, total in result.per_surah
                ],
            }
            for result in results
        ],
        "gradient": {
            "total_letters": gradient.total_letters,
            "total_verses": gradient.total_verses,
            "total_words": gradient.total_words,
            "muqattaat_words": gradient.muqattaat_words,
        },
    }
