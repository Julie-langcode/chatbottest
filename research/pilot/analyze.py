#!/usr/bin/env python3
"""Pilot analysis for the hallucination-management protocol.

Usage:
  python3 analyze.py summary annotated.csv
  python3 analyze.py kappa rater1.csv rater2.csv
  python3 analyze.py recheck annotated.csv recheck.csv

Input: the CSV exported from the bot ("CSV для разметки") with the annot_* columns filled in
(see annotation-guide.md). Only assistant rows that have annot_error_yes_no filled are counted.
No third-party libraries needed.
"""

import csv
import sys
from collections import Counter, defaultdict

TYPES = ["factual", "linguistic", "pragmatic", "other"]
CONTENT_TYPES = {"factual", "linguistic", "pragmatic"}


def read_rows(path):
    # utf-8-sig strips the BOM the export adds for Excel.
    with open(path, encoding="utf-8-sig", newline="") as f:
        sample = f.read(4096)
        f.seek(0)
        # Sniff only the delimiter (Excel may re-save with ";"). Letting the sniffer guess the
        # quoting breaks rows whose text contains doubled quotes ("") and silently drops data.
        delimiter = csv.Sniffer().sniff(sample, delimiters=",;").delimiter
        return list(csv.DictReader(f, delimiter=delimiter, quotechar='"', doublequote=True))


def annotated(rows):
    out = []
    for r in rows:
        if r.get("role") != "assistant":
            continue
        yn = (r.get("annot_error_yes_no") or "").strip().lower()
        if yn not in ("yes", "no"):
            continue
        out.append(r)
    return out


def types_of(row):
    raw = (row.get("annot_error_type") or "").strip().lower()
    found = [t.strip() for t in raw.split(";") if t.strip()]
    return [t if t in TYPES else "other" for t in found]


def pct(a, b):
    return f"{(100.0 * a / b):.1f}%" if b else "—"


def summary(path):
    rows = annotated(read_rows(path))
    if not rows:
        print("No annotated assistant rows found (fill annot_error_yes_no with yes/no).")
        return

    by_cond = defaultdict(list)
    for r in rows:
        by_cond[r.get("protocol") or "?"].append(r)

    print(f"Annotated assistant replies: {len(rows)}\n")
    for cond in sorted(by_cond):
        group = by_cond[cond]
        sessions = {r["session_id"] for r in group}
        with_error = [r for r in group if r["annot_error_yes_no"].strip().lower() == "yes"]
        type_counts = Counter(t for r in with_error for t in types_of(r))
        print(f"Condition protocol={cond}: {len(sessions)} sessions, {len(group)} replies")
        print(f"  replies with ≥1 error: {len(with_error)} ({pct(len(with_error), len(group))})")
        for t in TYPES:
            print(f"  {t:<11} {type_counts.get(t, 0)}")

        # Level 2 vs the human rater (only meaningful when the protocol was on).
        # The checker only reviews content, so a "real error" here is a factual, linguistic or
        # pragmatic one; script/format errors ("other") are out of its scope.
        checked = [r for r in group if r.get("checker_status") in ("ok", "warning")]
        if checked:
            def content_err(r):
                return r["annot_error_yes_no"].strip().lower() == "yes" and \
                    any(t in CONTENT_TYPES for t in types_of(r))
            tp = sum(1 for r in checked if r["checker_status"] == "warning" and content_err(r))
            fp = sum(1 for r in checked if r["checker_status"] == "warning" and not content_err(r))
            fn = sum(1 for r in checked if r["checker_status"] == "ok" and content_err(r))
            tn = sum(1 for r in checked if r["checker_status"] == "ok" and not content_err(r))
            print("  checker vs rater, content errors only (replies with a completed check):")
            print(f"    flagged & real error (TP): {tp}   flagged, no error (FP): {fp}")
            print(f"    missed real error (FN):    {fn}   correctly silent (TN): {tn}")
            print(f"    recall {pct(tp, tp + fn)}   precision {pct(tp, tp + fp)}")
        print()

    mode_counts = defaultdict(lambda: [0, 0])
    for r in rows:
        key = (r.get("mode"), r.get("protocol"))
        mode_counts[key][1] += 1
        if r["annot_error_yes_no"].lower() == "yes":
            mode_counts[key][0] += 1
    print("Replies with errors by mode and condition:")
    for (mode, cond), (err, total) in sorted(mode_counts.items()):
        print(f"  {mode:<20} protocol={cond:<3} {err}/{total} ({pct(err, total)})")


def cohen_kappa(a, b):
    n = len(a)
    if n == 0:
        return float("nan")
    po = sum(1 for x, y in zip(a, b) if x == y) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum((ca[k] / n) * (cb[k] / n) for k in set(ca) | set(cb))
    return 1.0 if pe == 1 else (po - pe) / (1 - pe)


def key_of(r):
    return (r.get("session_id"), r.get("turn"), (r.get("content") or "")[:80])


def kappa(path1, path2):
    r1 = {key_of(r): r for r in annotated(read_rows(path1))}
    r2 = {key_of(r): r for r in annotated(read_rows(path2))}
    common = [k for k in r1 if k in r2]
    if not common:
        print("No replies annotated by both raters.")
        return

    yn1 = [r1[k]["annot_error_yes_no"].lower() for k in common]
    yn2 = [r2[k]["annot_error_yes_no"].lower() for k in common]
    print(f"Replies annotated by both raters: {len(common)}")
    print(f"Error yes/no: agreement {pct(sum(x == y for x, y in zip(yn1, yn2)), len(common))}, "
          f"Cohen's kappa = {cohen_kappa(yn1, yn2):.2f}")

    # Type agreement on replies both raters marked as errors (main type = first listed).
    both = [k for k in common if r1[k]["annot_error_yes_no"].lower() == "yes" and r2[k]["annot_error_yes_no"].lower() == "yes"]
    t1 = [(types_of(r1[k]) or ["other"])[0] for k in both]
    t2 = [(types_of(r2[k]) or ["other"])[0] for k in both]
    if both:
        print(f"Main error type (n={len(both)}): agreement {pct(sum(x == y for x, y in zip(t1, t2)), len(both))}, "
              f"Cohen's kappa = {cohen_kappa(t1, t2):.2f}")
    print("\nRough guide: kappa < 0.4 weak, 0.4–0.6 moderate, 0.6–0.8 substantial, > 0.8 almost perfect.")



def recheck(annotated_path, recheck_path):
    """Level 2 applied after the fact to condition-A replies, against the human annotation.

    The checker only looks at content (factual / linguistic / pragmatic), so the main score
    counts a reply as a real error only when the rater gave it one of those types; script and
    format errors ("other") are reported separately as out of the checker's scope.
    """
    ann = {(r["session_id"], r["turn"]): r for r in annotated(read_rows(annotated_path))}
    chk = {(r["session_id"], r["turn"]): r for r in read_rows(recheck_path)
           if r.get("recheck_status") in ("ok", "warning")}
    common = [k for k in ann if k in chk]
    if not common:
        print("No replies found in both files (join on session_id + turn).")
        return
    tp, fp, fn, tn = [], [], [], []
    for k in common:
        content_err = any(t in CONTENT_TYPES for t in types_of(ann[k])) and \
            ann[k]["annot_error_yes_no"].strip().lower() == "yes"
        flagged = chk[k]["recheck_status"] == "warning"
        (tp if flagged and content_err else fp if flagged else fn if content_err else tn).append(k)
    print(f"Replies re-checked and annotated: {len(common)} (failed checks skipped: {len(ann) - len(common)})")
    print(f"Content errors (factual/linguistic/pragmatic) caught: {len(tp)} of {len(tp) + len(fn)}"
          f"  -> recall {pct(len(tp), len(tp) + len(fn))}")
    print(f"Warnings raised: {len(tp) + len(fp)}, of them on replies without a content error: {len(fp)}"
          f"  -> precision {pct(len(tp), len(tp) + len(fp))}")
    print(f"Correctly silent: {len(tn)}")
    for label, group in (("Caught", tp), ("Missed", fn), ("False alarm", fp)):
        for k in group:
            a, c = ann[k], chk[k]
            print(f"\n[{label}] {a.get('pilot_scenario') or a['session_id']} turn {k[1]} ({a.get('mode')})")
            if a["annot_error_yes_no"].strip().lower() == "yes":
                print(f"  rater:   {a.get('annot_error_type')}: {a.get('annot_quote')}")
            if c.get("recheck_issues"):
                print(f"  checker: {c['recheck_issues']}")


def main(argv):
    if len(argv) >= 3 and argv[1] == "summary":
        summary(argv[2])
    elif len(argv) >= 4 and argv[1] == "kappa":
        kappa(argv[2], argv[3])
    elif len(argv) >= 4 and argv[1] == "recheck":
        recheck(argv[2], argv[3])
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
