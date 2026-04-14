"""Top-level orchestration for verification runs."""

from __future__ import annotations

import logging
from pathlib import Path

from .artifacts import (
    write_fractal_edition,
    write_summary_json,
    write_verification,
)
from .assembler import normalize_edition
from .config import EXPECTED_GRAND_TOTAL
from .counting import build_summary, build_web_data, compute_gradient_stats, verify_all_groups
from .loader import load_quran_file, resolve_source_paths

LOGGER = logging.getLogger(__name__)


def run_verification(
    *,
    base_dir: Path,
    output_path: Path,
    summary_path: Path,
    web_data_path: Path | None = None,
) -> dict[str, object]:
    simple_path, uthmani_path = resolve_source_paths(base_dir)
    LOGGER.info("Using source files: simple=%s uthmani=%s", simple_path, uthmani_path)

    simple_verses = load_quran_file(simple_path)
    uthmani_verses = load_quran_file(uthmani_path)
    LOGGER.info(
        "Loaded verses: simple=%d uthmani=%d",
        len(simple_verses),
        len(uthmani_verses),
    )

    edition, original_v1_texts, word_merges_done = normalize_edition(simple_verses, uthmani_verses)
    LOGGER.info(
        "Assembled edition: verses=%d surahs=%d merged_v1=%d word_merges=%d",
        len(edition),
        len({surah for surah, _ayah, _text in edition}),
        len(original_v1_texts),
        word_merges_done,
    )

    results, grand_total, all_pass = verify_all_groups(edition, original_v1_texts)
    gradient = compute_gradient_stats(edition)
    summary = build_summary(results, gradient)

    source_files = [
        ("Simple-Plain", simple_path),
        ("Uthmani", uthmani_path),
    ]

    write_fractal_edition(edition, output_path)
    write_verification(
        results,
        output_path,
        gradient=gradient,
        append=True,
        source_files=source_files,
    )
    write_summary_json(summary, summary_path, source_files=source_files)

    if web_data_path is not None:
        import json
        web_data = build_web_data(edition, results, gradient, original_v1_texts)
        web_data_path.parent.mkdir(parents=True, exist_ok=True)
        web_data_path.write_text(
            json.dumps(web_data, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        LOGGER.info("Wrote web data: %s", web_data_path)

    LOGGER.info("Wrote artifacts: text=%s summary=%s", output_path, summary_path)
    LOGGER.info(
        "Verification status: grand_total=%d expected=%d all_groups_pass=%s",
        grand_total,
        EXPECTED_GRAND_TOTAL,
        all_pass,
    )

    return {
        "output_path": output_path,
        "summary_path": summary_path,
        "simple_path": simple_path,
        "uthmani_path": uthmani_path,
        "edition": edition,
        "results": results,
        "gradient": gradient,
        "summary": summary,
        "grand_total": grand_total,
        "all_pass": all_pass,
    }
