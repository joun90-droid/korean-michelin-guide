#!/usr/bin/env python3
"""Translate English Michelin blurbs in restaurants.json to Korean."""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "restaurants.json"
HANGUL = re.compile(r"[가-힣]")


def needs_ko(text: str) -> bool:
    if not (text or "").strip():
        return False
    return not HANGUL.search(text)


def clean(text: str) -> str:
    return (
        (text or "")
        .replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2014", "-")
        .replace("\u2013", "-")
        .strip()
    )


def chunks(text: str) -> list[str]:
    text = clean(text)
    parts = re.split(r"(?<=[.!?])\s+", text)
    out: list[str] = []
    buf = ""
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if len(buf) + len(p) < 380:
            buf = f"{buf} {p}".strip()
        else:
            if buf:
                out.append(buf)
            buf = p
    if buf:
        out.append(buf)
    return out or [text[:380]]


def translate_piece(piece: str) -> str:
    for attempt in range(3):
        try:
            out = GoogleTranslator(source="en", target="ko").translate(piece)
            if out and HANGUL.search(out):
                return out
        except Exception as exc:
            print(f"  retry {attempt + 1}: {type(exc).__name__}")
            time.sleep(0.8 * (attempt + 1))
    return piece


def translate(text: str) -> str:
    if not needs_ko(text):
        return text
    ko_parts = [translate_piece(p) for p in chunks(text)]
    return " ".join(ko_parts).strip()


def summarize(desc: str, cuisine: str, region: str, area: str) -> str:
    desc = (desc or "").strip()
    if not desc:
        return f"{cuisine} · {region} {area}".strip()
    parts = re.split(r"(?<=[.。!?요다음임])\s+", desc)
    return " ".join(parts[:3])[:280]


def save(data: dict) -> None:
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    data = json.loads(OUT.read_text(encoding="utf-8"))
    rows = data.get("restaurants") or []
    done = 0
    for i, row in enumerate(rows, 1):
        desc = row.get("description") or ""
        if not needs_ko(desc) and not needs_ko(row.get("summary") or ""):
            continue
        if needs_ko(desc):
            row["description"] = translate(desc)
            time.sleep(0.12)
        row["summary"] = summarize(
            row.get("description") or "",
            row.get("cuisine") or "",
            row.get("region") or "",
            row.get("area") or "",
        )
        done += 1
        print(f"[{i}/{len(rows)}] ok {done}")
        if done % 10 == 0:
            save(data)
    save(data)
    print(f"updated {done}")


if __name__ == "__main__":
    main()
