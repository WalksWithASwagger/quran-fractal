"""Golden SHA-256 hash registry for source file verification.

This module provides cryptographic verification that the Tanzil source
files have not been modified. Any change to the source text will cause
verification to fail, ensuring reproducibility of the 7430 analysis.
"""

from pathlib import Path

from .loader import compute_sha256

# Golden hashes for Tanzil source files (from tanzil.net)
# These are the canonical SHA-256 hashes that all analyses must match
GOLDEN_HASHES: dict[str, str] = {
    "quran-simple-plain.txt": "e9f4aa7ba1bea8c5245dc75354e28fd448a423d5d8826f50295416634f506b80",
    "quran-uthmani.txt": "54ea3b2f689f39dec2808361fec957f62a965ae029dcde7f9f21d65a844448e5",
}


def verify_source_hashes(base_dir: Path) -> list[tuple[str, bool, str]]:
    """Verify source files match golden hashes.

    Args:
        base_dir: Repository root directory containing tanzil_data/

    Returns:
        List of (filename, passed, message) tuples for each source file.
    """
    results: list[tuple[str, bool, str]] = []
    tanzil_dir = base_dir / "tanzil_data"

    for filename, expected_hash in GOLDEN_HASHES.items():
        filepath = tanzil_dir / filename
        if not filepath.exists():
            results.append((filename, False, f"File not found: {filepath}"))
            continue

        actual_hash = compute_sha256(filepath)
        if actual_hash == expected_hash:
            results.append((filename, True, "OK"))
        else:
            results.append(
                (
                    filename,
                    False,
                    f"Hash mismatch: expected {expected_hash[:16]}..., got {actual_hash[:16]}...",
                )
            )

    return results


def all_hashes_valid(base_dir: Path) -> bool:
    """Check if all source files match their golden hashes.

    Args:
        base_dir: Repository root directory containing tanzil_data/

    Returns:
        True if all source files match, False otherwise.
    """
    results = verify_source_hashes(base_dir)
    return all(passed for _, passed, _ in results)


def print_verification_report(base_dir: Path) -> bool:
    """Print a human-readable verification report.

    Args:
        base_dir: Repository root directory containing tanzil_data/

    Returns:
        True if all files verified, False otherwise.
    """
    results = verify_source_hashes(base_dir)
    all_passed = True

    print("Source File Hash Verification")
    print("=" * 50)

    for filename, passed, message in results:
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {filename}: {message}")
        if not passed:
            all_passed = False

    print("=" * 50)
    if all_passed:
        print("All source files verified successfully.")
    else:
        print("VERIFICATION FAILED: Some files do not match expected hashes.")

    return all_passed
