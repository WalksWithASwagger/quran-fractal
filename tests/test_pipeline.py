from pathlib import Path

from quran_fractal.assembler import normalize_edition
from quran_fractal.config import EXPECTED_GRAND_TOTAL
from quran_fractal.counting import compute_gradient_stats, verify_all_groups
from quran_fractal.loader import load_quran_file, resolve_source_paths
from quran_fractal.service import run_verification


def _load_repo_sources() -> tuple[dict[tuple[int, int], str], dict[tuple[int, int], str]]:
    repo_root = Path(__file__).resolve().parents[1]
    simple_path, uthmani_path = resolve_source_paths(repo_root)
    return load_quran_file(simple_path), load_quran_file(uthmani_path)


def test_normalize_edition_merges_expected_surahs() -> None:
    simple_verses, uthmani_verses = _load_repo_sources()

    edition, original_v1_texts, word_merges_done = normalize_edition(simple_verses, uthmani_verses)
    merged_lookup = {(surah, ayah): text for surah, ayah, text in edition}

    assert original_v1_texts.keys() == {19, 20, 31, 36}
    assert word_merges_done == 6
    assert merged_lookup[(19, 1)].startswith(original_v1_texts[19] + " ")
    assert merged_lookup[(19, 2)] == simple_verses[(19, 3)]


def test_verify_all_groups_matches_expected_totals() -> None:
    simple_verses, uthmani_verses = _load_repo_sources()
    edition, original_v1_texts, _word_merges_done = normalize_edition(simple_verses, uthmani_verses)

    results, grand_total, all_pass = verify_all_groups(edition, original_v1_texts)
    gradient = compute_gradient_stats(edition)

    assert len(results) == 13
    assert grand_total == EXPECTED_GRAND_TOTAL
    assert all_pass is True
    assert gradient.total_verses == 6232
    assert gradient.total_words == 82498
    assert gradient.muqattaat_words == 39349


def test_run_verification_writes_text_and_json_artifacts(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    output_path = tmp_path / "fractal_edition.txt"
    summary_path = tmp_path / "verification-summary.json"

    result = run_verification(
        base_dir=repo_root,
        output_path=output_path,
        summary_path=summary_path,
    )

    assert result["grand_total"] == EXPECTED_GRAND_TOTAL
    assert result["all_pass"] is True
    assert output_path.exists()
    assert summary_path.exists()
    summary_text = summary_path.read_text(encoding="utf-8")
    assert '"grand_total": 39349' in summary_text
    assert '"all_groups_pass": true' in summary_text
