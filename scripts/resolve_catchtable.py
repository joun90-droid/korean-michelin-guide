#!/usr/bin/env python3
"""Resolve Catchtable /ct/shop/{alias} pages via Naver search snippets."""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data" / "restaurants.json"
SHOP_RE = re.compile(r"https://app\.catchtable\.co\.kr/ct/shop/([A-Za-z0-9_\-%]+)")
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9",
}


def norm_en(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def shop_url(alias: str) -> str:
    return f"https://app.catchtable.co.kr/ct/shop/{alias}"


def naver_html(query: str) -> str:
    url = f"https://search.naver.com/search.naver?query={quote(query)}"
    r = requests.get(url, timeout=20, headers=HEADERS)
    r.raise_for_status()
    return r.text


def score_slug(slug: str, ctx: str, row: dict) -> int:
    score = 0
    name = row.get("name") or ""
    name_en = row.get("nameEn") or ""
    area = row.get("area") or ""
    address = row.get("address") or ""
    place = f"{address} {area} {name}"
    if name and name in ctx:
        score += 8
    if name_en and name_en.lower() in ctx.lower():
        score += 6
    en = norm_en(name_en)
    sl = norm_en(slug)
    slug_ok = False
    if en and len(en) >= 3:
        if sl == en or sl.startswith(en) or (len(en) >= 4 and en in sl):
            slug_ok = True
            score += 16
        else:
            score -= 20
    elif name and name in ctx:
        score += 8
    if area and area in ctx:
        score += 6
    if address[:10] and address[:10] in ctx:
        score += 4
    extras = (
        "boramae",
        "mullae",
        "gwangjin",
        "ilsan",
        "pangyo",
        "haeundae",
        "seomyeon",
        "busan",
        "jeju",
        "suwon",
        "incheon",
    )
    for extra in extras:
        if extra in sl and extra not in norm_en(place):
            score -= 16
    if slug.startswith("mt_"):
        score -= 2
    return score


def pick_alias(html: str, row: dict) -> str | None:
    best: tuple[int, str] | None = None
    for m in SHOP_RE.finditer(html):
        slug = m.group(1)
        ctx = html[max(0, m.start() - 220) : m.end() + 220]
        sc = score_slug(slug, ctx, row)
        if best is None or sc > best[0]:
            best = (sc, slug)
    if not best or best[0] < 12:
        return None
    return best[1]


def resolve_one(row: dict) -> str | None:
    name = row.get("name") or ""
    name_en = row.get("nameEn") or ""
    area = row.get("area") or ""
    queries = [
        f"캐치테이블 {name} {name_en} {area}".strip(),
        f"캐치테이블 {name}",
    ]
    if name_en:
        queries.append(f"캐치테이블 {name_en}")
    seen = set()
    for q in queries:
        if q in seen:
            continue
        seen.add(q)
        try:
            html = naver_html(q)
        except requests.RequestException:
            time.sleep(0.8)
            continue
        alias = pick_alias(html, row)
        if alias:
            return alias
        time.sleep(0.35)
    return None


def main() -> None:
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    rows = payload["restaurants"]
    hits = 0
    for i, row in enumerate(rows, 1):
        if row.get("catchtableShop") and "/ct/shop/" in (row.get("catchtableUrl") or ""):
            hits += 1
            continue
        alias = resolve_one(row)
        label = str(row.get("id") or "").encode("ascii", "replace").decode()
        if alias:
            row["catchtableShop"] = alias
            row["catchtableUrl"] = shop_url(alias)
            row["bookingUrl"] = shop_url(alias)
            hits += 1
            print("[%s/%s] %s -> %s" % (i, len(rows), label, alias))
        else:
            print("[%s/%s] %s -> search" % (i, len(rows), label))
        time.sleep(0.35)
    payload["restaurants"] = rows
    DATA.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"done shop pages={hits}/{len(rows)}")


if __name__ == "__main__":
    main()
