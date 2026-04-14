"""Static configuration for the Quran fractal verifier."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GroupDefinition:
    name: str
    surahs: list[int]
    edition: str
    exclude_v1: bool
    consonants: list[str]
    alif_chars: list[str]
    expected_total: int


UTHMANI_SURAHS = {7, 10, 11, 12, 13, 14, 15, 20, 27, 36, 68}

UTHMANI_PATH = "tanzil_data/quran-uthmani.txt"

SIMPLE_CLEAN_CANDIDATES = [
    "tanzil_data/quran-simple-clean.txt",
    "tanzil_data/quran-simple-plain.txt",
]

MERGE_V1_SURAHS = {19, 20, 31, 36}

WORD_MERGE_VERSES = {
    (64, 14): (0, 1),
    (71, 2): (1, 2),
    (74, 1): (4, 5),
    (78, 40): (12, 13),
    (82, 6): (0, 1),
    (84, 6): (0, 1),
}

MUQATTAAT_SURAHS = {
    2,
    3,
    7,
    10,
    11,
    12,
    13,
    14,
    15,
    19,
    20,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    36,
    38,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    50,
    68,
}

EXPECTED_GRAND_TOTAL = 39349

GROUP_METADATA: dict[str, dict[str, object]] = {
    "ALM":   {"arabic": "الم",    "tier": 1},
    "ALR":   {"arabic": "الر",    "tier": 2},
    "ALMR":  {"arabic": "المر",   "tier": 2},
    "ALMS":  {"arabic": "المص",   "tier": 1},
    "HM":    {"arabic": "حم",     "tier": 1},
    "ASQ":   {"arabic": "عسق",    "tier": 1},
    "Q":     {"arabic": "ق",      "tier": 1},
    "KHYAS": {"arabic": "كهيعص",  "tier": 1},
    "TSM":   {"arabic": "طسم",    "tier": 1},
    "YS":    {"arabic": "يس",     "tier": 1},
    "N":     {"arabic": "ن",      "tier": 2},
    "TH":    {"arabic": "طه",     "tier": 2},
    "TS":    {"arabic": "طس",     "tier": 2},
}

GROUPS = [
    GroupDefinition(
        "ALM",
        [2, 3, 29, 30, 31, 32],
        "simple",
        False,
        ["ل", "م"],
        ["ا"],
        18012,
    ),
    GroupDefinition(
        "ALR",
        [10, 11, 12, 14, 15],
        "uthmani",
        False,
        ["ل", "ر"],
        ["ا", "إ", "\u0653"],
        7828,
    ),
    GroupDefinition(
        "ALMR",
        [13],
        "uthmani",
        False,
        ["ل", "م", "ر"],
        ["أ", "إ", "\u0653", "\u0670"],
        1178,
    ),
    GroupDefinition(
        "ALMS",
        [7, 38],
        "uthmani",
        True,
        ["ل", "م", "ص"],
        ["ا"],
        4997,
    ),
    GroupDefinition(
        "HM",
        [40, 41, 42, 43, 44, 45, 46],
        "simple",
        False,
        ["ح", "م"],
        [],
        2147,
    ),
    GroupDefinition(
        "ASQ",
        [42],
        "simple",
        False,
        ["ع", "س", "ق"],
        [],
        209,
    ),
    GroupDefinition(
        "Q",
        [50],
        "simple",
        False,
        ["ق"],
        [],
        57,
    ),
    GroupDefinition(
        "KHYAS",
        [19],
        "simple",
        True,
        ["ك", "ه", "ة", "ي", "ى", "ئ", "ع", "ص"],
        [],
        798,
    ),
    GroupDefinition(
        "TSM",
        [26, 28],
        "simple",
        True,
        ["ط", "س", "م"],
        [],
        1178,
    ),
    GroupDefinition(
        "YS",
        [36],
        "uthmani",
        True,
        ["ي", "س", "ى", "\u06E6"],
        [],
        285,
    ),
    GroupDefinition(
        "N",
        [68],
        "uthmani",
        False,
        ["ن"],
        ["ا", "\u0670", "أ", "\u0653", "\u06DF", "ٱ"],
        361,
    ),
    GroupDefinition(
        "TH",
        [20],
        "uthmani",
        True,
        ["ط", "ه"],
        ["ا", "\u0670", "أ", "\u06DF", "ٱ"],
        1292,
    ),
    GroupDefinition(
        "TS",
        [27],
        "uthmani",
        True,
        ["ط", "س"],
        ["ا", "\u0670", "أ", "إ", "ٱ"],
        1007,
    ),
]
