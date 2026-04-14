"""Command-line interface for the Quran fractal verifier."""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

from .config import EXPECTED_GRAND_TOTAL
from .service import run_verification


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="quran-fractal",
        description="Assemble and verify the Fractal Edition artifacts.",
    )
    parser.add_argument(
        "command",
        nargs="?",
        default="verify",
        choices=["verify"],
        help="Command to run.",
    )
    parser.add_argument(
        "--base-dir",
        default=".",
        help="Repository root containing tanzil_data/.",
    )
    parser.add_argument(
        "--output",
        default="fractal_edition.txt",
        help="Path for the human-readable verification artifact.",
    )
    parser.add_argument(
        "--summary-output",
        default="build/verification-summary.json",
        help="Path for the machine-readable JSON summary artifact.",
    )
    parser.add_argument(
        "--web-data-output",
        default="web/public/data/quran-data.json",
        help="Path for the web research explorer JSON data.",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity.",
    )
    return parser


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(levelname)s %(name)s: %(message)s",
    )


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    configure_logging(args.log_level)

    result = run_verification(
        base_dir=Path(args.base_dir).resolve(),
        output_path=Path(args.output).resolve(),
        summary_path=Path(args.summary_output).resolve(),
        web_data_path=Path(args.web_data_output).resolve(),
    )

    logger = logging.getLogger(__name__)
    if result["grand_total"] == EXPECTED_GRAND_TOTAL and result["all_pass"]:
        logger.info(
            "Verification succeeded: grand_total=%d output=%s summary=%s",
            result["grand_total"],
            result["output_path"],
            result["summary_path"],
        )
        return 0

    logger.error("Verification failed: grand_total=%d", result["grand_total"])
    return 1
