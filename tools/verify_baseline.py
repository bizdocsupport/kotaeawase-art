#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    p = argparse.ArgumentParser(description="Verify docs/ against the Phase 1 baseline manifest.")
    p.add_argument("--root", default="docs")
    p.add_argument("--manifest", default="baseline-manifest.json")
    args = p.parse_args()

    root = Path(args.root)
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    expected = {item["path"]: item for item in manifest["files"]}

    actual_paths = sorted(
        str(path.relative_to(root)).replace("\\", "/")
        for path in root.rglob("*")
        if path.is_file()
    )
    expected_paths = sorted(expected)

    problems = []
    missing = sorted(set(expected_paths) - set(actual_paths))
    extra = sorted(set(actual_paths) - set(expected_paths))
    if missing:
        problems.append(f"missing files: {len(missing)}")
        problems.extend(f"  MISSING {x}" for x in missing[:20])
    if extra:
        problems.append(f"extra files: {len(extra)}")
        problems.extend(f"  EXTRA   {x}" for x in extra[:20])

    checked_bytes = 0
    for rel in expected_paths:
        path = root / rel
        if not path.is_file():
            continue
        size = path.stat().st_size
        checked_bytes += size
        item = expected[rel]
        if size != item["size"]:
            problems.append(f"SIZE    {rel}: expected {item['size']}, got {size}")
            continue
        digest = sha256(path)
        if digest != item["sha256"]:
            problems.append(f"SHA256  {rel}: expected {item['sha256']}, got {digest}")

    if problems:
        print("Baseline verification: FAILED")
        for line in problems[:100]:
            print(line)
        if len(problems) > 100:
            print(f"... and {len(problems)-100} more problems")
        return 1

    print("Baseline verification: OK")
    print(f"files: {len(expected_paths)}")
    print(f"bytes: {checked_bytes}")
    print("docs/ is byte-for-byte identical to the source art/ snapshot used for Phase 1.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
