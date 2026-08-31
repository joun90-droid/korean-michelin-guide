#!/usr/bin/env python3
"""Michelin Guide KR crawler — Seoul / Busan (+ KR listings) → restaurants.json."""

from __future__ import annotations

import csv
import io
import json
import re
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "public" / "data" / "restaurants.json"
SITEMAP = ROOT / "public" / "sitemap.xml"
ROBOTS = ROOT / "public" / "robots.txt"
SITE_URL = "https://michelin-guide-kr.web.app"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; KoreanMichelinGuideBot/1.0; "
        "+https://github.com/korean-michelin-guide) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

LISTING_URLS = [
    "https://guide.michelin.com/kr/ko/seoul-capital-area/kr-seoul/restaurants",
    "https://guide.michelin.com/en/seoul-capital-area/kr-seoul/restaurants",
    "https://guide.michelin.com/kr/ko/busan-si/busan/restaurants",
    "https://guide.michelin.com/en/busan-si/busan/restaurants",
    "https://guide.michelin.com/kr/ko/restaurants",
]

CSV_FALLBACK = (
    "https://raw.githubusercontent.com/ngshiheng/michelin-my-maps/main/"
    "data/michelin_my_maps.csv"
)

KST = timezone(timedelta(hours=9))

CUISINE_MAP = [
    (r"한식|korean", "한식"),
    (r"스시|sushi|오마카세|omakase|japanese|일식", "오마카세"),
    (r"프렌치|french", "프렌치"),
    (r"이탈리|italian", "이탈리안"),
    (r"중식|chinese", "중식"),
    (r"모던|modern|contemporary|creative|innovative|fusion", "모던"),
]


def slugify(text: str) -> str:
    s = text.strip().lower()
    s = re.sub(r"[^\w\s가-힣-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s)
    return s[:80] or "restaurant"


def map_cuisine(raw: str) -> str:
    blob = (raw or "").lower()
    for pat, label in CUISINE_MAP:
        if re.search(pat, blob, re.I):
            return label
    return "모던"


def map_region(location: str, address: str) -> tuple[str, str]:
    blob = f"{location} {address}"
    if re.search(r"부산|Busan", blob, re.I):
        return "부산", "부산"
    if re.search(r"제주|Jeju", blob, re.I):
        return "제주", "제주"
    if re.search(r"대구|Daegu", blob, re.I):
        return "대구", "대구"
    if re.search(r"인천|Incheon", blob, re.I):
        return "인천", "인천"
    if re.search(r"경기|Gyeonggi|성남|수원|고양|판교", blob, re.I):
        return "경기", "경기"
    if re.search(r"서울|Seoul", blob, re.I):
        area = "서울"
        for token in (
            "강남",
            "청담",
            "종로",
            "용산",
            "마포",
            "성수",
            "이태원",
            "한남",
            "광화문",
            "여의도",
        ):
            if token in address:
                area = token
                break
        return "서울", area
    return "서울", "서울"


def map_award(award: str, green: Any) -> tuple[Any, bool]:
    a = (award or "").lower()
    green_star = bool(green) and str(green) not in ("0", "false", "False", "")
    if "3" in a and "star" in a:
        return 3, green_star
    if "2" in a and "star" in a:
        return 2, green_star
    if "1" in a and "star" in a:
        return 1, green_star
    if "bib" in a:
        return "bib", green_star
    if "green" in a:
        return "selected", True
    return "selected", green_star


def parse_price_krw(price: str) -> tuple[str, int | None]:
    if not price:
        return "", None
    nums = [int(x.replace(",", "")) for x in re.findall(r"\d[\d,]*", price)]
    if nums:
        lo = min(nums)
        hi = max(nums)
        label = f"{lo:,}원" if lo == hi else f"{lo:,}원 ~ {hi:,}원"
        return label, lo
    symbols = price.count("$") + price.count("₩") + price.count("￦")
    if symbols:
        bands = {1: 40000, 2: 80000, 3: 150000, 4: 280000}
        lo = bands.get(min(symbols, 4), 150000)
        return price.strip(), lo
    return price.strip(), None


def catchtable_url(name: str) -> str:
    return (
        "https://app.catchtable.co.kr/ct/search/total"
        f"?keyword={quote(name)}&isKeywordSearchOpen=true"
    )


def naver_search_url(name: str, address: str) -> str:
    return f"https://map.naver.com/p/search/{quote(f'{name} {address}'.strip())}"


def naver_directions_url(lat: float | None, lng: float | None, name: str) -> str:
    if lat is None or lng is None:
        return naver_search_url(name, "")
    return (
        f"https://map.naver.com/p/directions/-/-/{lng},{lat},{quote(name)}"
        "/walk?c=15.00,0,0,0,dh"
    )


def infer_flags(row: dict[str, Any]) -> dict[str, Any]:
    tags = [t.lower() for t in row.get("tags") or []]
    fac = " ".join(tags + [str(row.get("facilities") or ""), str(row.get("description") or "")]).lower()
    price_lo = row.get("priceMin")
    stars = row.get("stars")
    private_room = any(k in fac for k in ("private", "룸", "개인실", "프라이빗"))
    parking = any(k in fac for k in ("car park", "valet", "주차"))
    wine = any(k in fac for k in ("wine", "와인"))
    under_100k = stars == "bib" or (isinstance(price_lo, int) and price_lo <= 100000)
    occasions = []
    if private_room or (isinstance(stars, int) and stars >= 2):
        occasions.append("parents")
    if isinstance(stars, int) and stars >= 1:
        occasions.append("date")
    if private_room or "호텔" in fac or "hotel" in fac:
        occasions.append("business")
    if stars == "bib" or under_100k:
        occasions.append("value")
    amenities = []
    if private_room:
        amenities.append("private-room")
    if parking:
        amenities.append("parking")
    if under_100k:
        amenities.append("under-100k")
    if wine:
        amenities.append("wine")
    row["occasions"] = occasions
    row["amenities"] = amenities
    if row.get("greenStar"):
        tags_out = list(row.get("tags") or [])
        if "그린스타" not in tags_out:
            tags_out.append("그린스타")
        row["tags"] = tags_out
    return row


def enrich(row: dict[str, Any]) -> dict[str, Any]:
    name = row.get("name") or ""
    address = row.get("address") or ""
    lat, lng = row.get("lat"), row.get("lng")
    row["catchtableUrl"] = catchtable_url(name)
    row["naverMapUrl"] = naver_search_url(name, address)
    row["naverDirectionsUrl"] = naver_directions_url(lat, lng, name)
    row["bookingUrl"] = row.get("bookingUrl") or row.get("websiteUrl") or row["catchtableUrl"]
    summary = (row.get("description") or "").strip()
    if summary:
        sentences = re.split(r"(?<=[.。])\s+", summary)
        row["summary"] = " ".join(sentences[:3])[:280]
    else:
        row["summary"] = f"{row.get('cuisine', '')} · {row.get('region', '')} {row.get('area', '')}"
    return infer_flags(row)


def session() -> requests.Session:
    s = requests.Session()
    s.headers.update(HEADERS)
    return s


def fetch_html(s: requests.Session, url: str) -> str | None:
    try:
        r = s.get(url, timeout=25)
        if r.status_code != 200:
            print(f"[skip] {r.status_code} {url}")
            return None
        return r.text
    except requests.RequestException as exc:
        print(f"[err] {url}: {exc}")
        return None


def parse_listing(html: str, base: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    hrefs: list[str] = []
    for a in soup.select("a[href*='/restaurant/']"):
        href = a.get("href") or ""
        if "/restaurant/" not in href:
            continue
        full = urljoin(base, href.split("?")[0])
        if full not in hrefs:
            hrefs.append(full)
    return hrefs


def parse_detail(html: str, url: str) -> dict[str, Any] | None:
    soup = BeautifulSoup(html, "lxml")

    def meta(prop: str) -> str:
        el = soup.find("meta", attrs={"property": prop}) or soup.find(
            "meta", attrs={"name": prop}
        )
        return (el.get("content") or "").strip() if el else ""

    name = ""
    h1 = soup.find("h1")
    if h1:
        name = h1.get_text(" ", strip=True)
    if not name:
        name = meta("og:title").split("–")[0].split("-")[0].strip()
    if not name:
        return None

    address = ""
    addr_el = soup.select_one("div.data-sheet__block--text, .restaurant-details__heading--list")
    if addr_el:
        address = addr_el.get_text(" ", strip=True)
    ld = soup.find("script", type="application/ld+json")
    payload: dict[str, Any] = {}
    if ld and ld.string:
        try:
            parsed = json.loads(ld.string)
            payload = parsed[0] if isinstance(parsed, list) else parsed
        except json.JSONDecodeError:
            payload = {}

    address = address or (payload.get("address") or {})
    if isinstance(address, dict):
        address = ", ".join(
            str(address.get(k) or "")
            for k in ("streetAddress", "addressLocality", "addressRegion", "addressCountry")
            if address.get(k)
        )

    phone = payload.get("telephone") or ""
    if not phone:
        tel = soup.select_one("a[href^='tel:']")
        phone = tel.get_text(strip=True) if tel else ""

    geo = payload.get("geo") or {}
    lat = geo.get("latitude")
    lng = geo.get("longitude")
    for node in soup.select("[data-lat]"):
        try:
            lat = float(node["data-lat"])
            lng = float(node["data-lng"])
            break
        except (KeyError, TypeError, ValueError):
            continue

    cuisine_raw = ""
    for el in soup.select(".card__menu-footer--price, .data-sheet__block, li"):
        t = el.get_text(" ", strip=True)
        if t and len(t) < 80 and re.search(r"Cuisine|요리|한식|Korean|French", t, re.I):
            cuisine_raw = t
            break
    if payload.get("servesCuisine"):
        sc = payload["servesCuisine"]
        cuisine_raw = ", ".join(sc) if isinstance(sc, list) else str(sc)

    price = ""
    if payload.get("priceRange"):
        price = str(payload["priceRange"])
    desc = meta("og:description") or payload.get("description") or ""

    award_text = " ".join(
        el.get_text(" ", strip=True)
        for el in soup.select(
            ".distinction-icon, .michelin-award, img[alt*='Star'], img[alt*='Bib'], img[alt*='Green']"
        )
    )
    alts = " ".join(img.get("alt") or "" for img in soup.select("img[alt]"))
    award_blob = f"{award_text} {alts}"
    stars, green = map_award(award_blob, "green" in award_blob.lower())

    region, area = map_region(url + " " + address, address)
    price_label, price_min = parse_price_krw(price)
    facilities = [
        el.get_text(" ", strip=True)
        for el in soup.select(".restaurant__services li, .card__menu-footer li")
        if el.get_text(strip=True)
    ]

    booking = ""
    for a in soup.select("a[href]"):
        href = a["href"]
        label = a.get_text(" ", strip=True).lower()
        if "catchtable" in href or "opentable" in href or "예약" in label or "book" in label:
            booking = href
            break

    return {
        "id": slugify(name),
        "name": name,
        "nameEn": name,
        "stars": stars,
        "greenStar": green,
        "ribbons": None,
        "cuisine": map_cuisine(cuisine_raw + " " + desc),
        "region": region,
        "area": area,
        "address": address,
        "priceRange": price_label or price,
        "priceMin": price_min,
        "phone": re.sub(r"[^\d+]", "", str(phone)) or phone,
        "hours": "",
        "tags": facilities[:8],
        "facilities": ", ".join(facilities),
        "description": desc,
        "lat": float(lat) if lat not in (None, "") else None,
        "lng": float(lng) if lng not in (None, "") else None,
        "michelinUrl": url,
        "websiteUrl": payload.get("url") if payload.get("url") != url else "",
        "bookingUrl": booking,
        "source": "michelin-html",
    }


def scrape_official(s: requests.Session) -> list[dict[str, Any]]:
    detail_urls: list[str] = []
    for listing in LISTING_URLS:
        for page in range(1, 40):
            url = listing if page == 1 else f"{listing.rstrip('/')}/page/{page}"
            html = fetch_html(s, url)
            time.sleep(1.2)
            if not html:
                break
            found = parse_listing(html, url)
            kr_only = [
                u
                for u in found
                if any(k in u.lower() for k in ("seoul", "busan", "/kr/", "korea"))
            ]
            new = [u for u in kr_only if u not in detail_urls]
            if not new:
                if page > 1:
                    break
                continue
            detail_urls.extend(new)
            print(f"[list] {url} +{len(new)}")
            if len(found) < 8:
                break

    rows: list[dict[str, Any]] = []
    for url in detail_urls:
        html = fetch_html(s, url)
        time.sleep(0.8)
        if not html:
            continue
        row = parse_detail(html, url)
        if row:
            rows.append(enrich(row))
            print(f"[ok] {row['name']}")
    return rows


def scrape_csv_fallback(s: requests.Session) -> list[dict[str, Any]]:
    print("[fallback] downloading public Michelin KR dataset")
    r = s.get(CSV_FALLBACK, timeout=60)
    r.raise_for_status()
    reader = csv.DictReader(io.StringIO(r.content.decode("utf-8", errors="replace")))
    rows: list[dict[str, Any]] = []
    for rec in reader:
        loc = rec.get("Location") or ""
        addr = rec.get("Address") or ""
        url = rec.get("Url") or ""
        blob = f"{loc} {addr} {url}"
        if "South Korea" not in blob and "seoul" not in blob.lower() and "busan" not in blob.lower():
            continue
        if not re.search(r"Seoul|Busan|South Korea", blob, re.I):
            continue
        name = rec.get("Name") or ""
        stars, green = map_award(rec.get("Award") or "", rec.get("GreenStar"))
        region, area = map_region(loc, addr)
        price_label, price_min = parse_price_krw(rec.get("Price") or "")
        fac = rec.get("FacilitiesAndServices") or ""
        phone = rec.get("PhoneNumber") or ""
        try:
            lat = float(rec["Latitude"]) if rec.get("Latitude") else None
            lng = float(rec["Longitude"]) if rec.get("Longitude") else None
        except ValueError:
            lat = lng = None
        row = {
            "id": slugify(name),
            "name": name,
            "nameEn": name,
            "stars": stars,
            "greenStar": green,
            "ribbons": None,
            "cuisine": map_cuisine(rec.get("Cuisine") or ""),
            "region": region,
            "area": area,
            "address": addr,
            "priceRange": price_label,
            "priceMin": price_min,
            "phone": phone,
            "hours": "",
            "tags": [t.strip() for t in fac.split(",") if t.strip()][:8],
            "facilities": fac,
            "description": rec.get("Description") or "",
            "lat": lat,
            "lng": lng,
            "michelinUrl": url,
            "websiteUrl": rec.get("WebsiteUrl") or "",
            "bookingUrl": "",
            "source": "michelin-csv",
        }
        rows.append(enrich(row))
    print(f"[fallback] {len(rows)} KR restaurants")
    return rows


def load_existing() -> list[dict[str, Any]]:
    if not OUT_JSON.exists():
        return []
    data = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    return data.get("restaurants") or []


def merge(scraped: list[dict[str, Any]], existing: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    by_name: dict[str, dict[str, Any]] = {}
    for row in existing:
        by_id[row["id"]] = row
        by_name[(row.get("name") or "").lower()] = row

    out: dict[str, dict[str, Any]] = {}
    for row in scraped:
        prev = by_id.get(row["id"]) or by_name.get(row["name"].lower())
        if prev:
            merged = {**row}
            for keep in ("ribbons", "hours", "phone", "tags", "name", "nameEn", "id"):
                if prev.get(keep) and (not merged.get(keep) or keep in ("ribbons", "name", "id")):
                    if keep == "tags":
                        merged["tags"] = list(dict.fromkeys((prev.get("tags") or []) + (row.get("tags") or [])))
                    elif keep == "phone":
                        merged["phone"] = merged.get("phone") or prev.get("phone")
                    else:
                        merged[keep] = prev[keep] if keep in ("ribbons", "id", "name", "nameEn") else (
                            merged.get(keep) or prev.get(keep)
                        )
            if prev.get("hours"):
                merged["hours"] = prev["hours"]
            if prev.get("ribbons"):
                merged["ribbons"] = prev["ribbons"]
            merged["id"] = prev["id"]
            merged["name"] = prev.get("name") or merged["name"]
            row = enrich(merged)
        rid = row["id"]
        if rid in out:
            rid = f"{rid}-{row.get('region', 'kr')}".lower()
            row["id"] = rid
        out[rid] = row

    for prev in existing:
        if prev["id"] not in out:
            out[prev["id"]] = enrich(prev)

    def rank(r: dict[str, Any]) -> tuple:
        s = r.get("stars")
        return (-{3: 3, 2: 2, 1: 1, "bib": 0.5, "selected": 0.25}.get(s, 0), r.get("name") or "")

    return sorted(out.values(), key=rank)


def write_sitemap(rows: list[dict[str, Any]]) -> None:
    urls = [
        f"  <url><loc>{SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        f"  <url><loc>{SITE_URL}/map</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>",
    ]
    for r in rows:
        urls.append(
            f"  <url><loc>{SITE_URL}/restaurant/{r['id']}</loc>"
            f"<changefreq>weekly</changefreq><priority>0.8</priority></url>"
        )
    SITEMAP.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n",
        encoding="utf-8",
    )
    ROBOTS.write_text(
        f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n",
        encoding="utf-8",
    )


def main() -> None:
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    existing = load_existing()
    s = session()
    scraped: list[dict[str, Any]] = []
    try:
        scraped = scrape_official(s)
    except Exception as exc:
        print(f"[warn] html scrape failed: {exc}")
    if len(scraped) < 8:
        try:
            scraped = scrape_csv_fallback(s)
        except Exception as exc:
            print(f"[warn] csv fallback failed: {exc}")
            scraped = []
    rows = merge(scraped, existing)
    try:
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "resolve_catchtable", Path(__file__).with_name("resolve_catchtable.py")
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        for row in rows:
            if row.get("catchtableShop"):
                continue
            alias = mod.resolve_one(row)
            if alias:
                row["catchtableShop"] = alias
                row["catchtableUrl"] = mod.shop_url(alias)
                row["bookingUrl"] = mod.shop_url(alias)
            time.sleep(0.25)
    except Exception as exc:
        print(f"[warn] catchtable shop resolve skipped: {exc}")
    payload = {
        "updatedAt": datetime.now(KST).isoformat(timespec="seconds"),
        "source": "michelin-guide",
        "count": len(rows),
        "restaurants": rows,
    }
    prev = OUT_JSON.read_text(encoding="utf-8") if OUT_JSON.exists() else ""
    nxt = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    OUT_JSON.write_text(nxt, encoding="utf-8")
    write_sitemap(rows)
    print(f"[done] {len(rows)} restaurants, changed={prev != nxt}")


if __name__ == "__main__":
    main()
