"""대표 사례(시연용) 원문 추출.

docs/민원나침반_시연용_대표사례.csv 에 고른 사례의 답변ID만 있으므로,
민원 DB를 내보낸 테이블 CSV(테이블_CSV 폴더)에서 원문을 찾아 data/featured_source.json 으로 저장합니다.
build-data.py 가 이 파일을 읽어 cases.json 에 대표 사례로 합칩니다.

사용: python3 -I scripts/extract-featured.py <테이블_CSV 폴더>
"""
import collections
import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SELECTION = os.path.join(ROOT, "docs", "민원나침반_시연용_대표사례.csv")
OUT = os.path.join(ROOT, "data", "featured_source.json")

FAMILY_KEY = {
    "주거": "housing", "교통·주차": "traffic", "돌봄·교육": "care", "환경·소음": "env", "동네 시설": "town",
    "안전·소방": "safety", "세금·사업": "biz", "복지·증명": "welfare", "반려동물": "pets",
}
AGENCY_TYPE = {"중앙행정기관": "central", "공공기관 등": "central", "지자체": "local", "교육청": "education"}


def rows(table_dir, name):
    with open(os.path.join(table_dir, name), encoding="utf-8-sig") as f:
        yield from csv.DictReader(f)


def article_of(jo):
    if jo["조문구분"] == "조문" and jo["조번호"] not in ("", "0"):
        art = f"제{jo['조번호']}조"
        if jo["가지번호"] not in ("", "0"):
            art += f"의{jo['가지번호']}"
        return art
    if jo["조문구분"] == "부칙":
        return "부칙"
    return ""


def main():
    if len(sys.argv) != 2:
        sys.exit("사용: python3 -I scripts/extract-featured.py <테이블_CSV 폴더>")
    table_dir = sys.argv[1]
    csv.field_size_limit(10**9)

    with open(SELECTION, encoding="utf-8-sig") as f:
        selection = list(csv.DictReader(f))
    rank = collections.Counter()
    picked = {}
    for r in selection:
        fam = FAMILY_KEY[r["카테고리"]]
        rank[fam] += 1
        picked[r["답변ID"]] = {"family": fam, "rank": rank[fam]}

    answers = {a["답변ID"]: a for a in rows(table_dir, "답변.csv") if a["답변ID"] in picked}
    meta = {m["답변ID"]: m for m in rows(table_dir, "v_검색메타.csv") if m["답변ID"] in picked}
    complaint_ids = {a["민원ID"] for a in answers.values()}
    complaints = {m["민원ID"]: m for m in rows(table_dir, "민원.csv") if m["민원ID"] in complaint_ids}
    law_names = {r["법령ID"]: r["표준법령명"] for r in rows(table_dir, "법령.csv")}
    articles = {r["조문ID"]: r for r in rows(table_dir, "조문.csv")}

    laws = collections.defaultdict(list)
    for r in rows(table_dir, "답변_법령인용.csv"):
        if r["답변ID"] not in picked:
            continue
        jo = articles.get(r["조문ID"])
        name = law_names.get(jo["법령ID"]) if jo else None
        if not name:
            continue
        ref = {"name": name.strip("「」 "), "article": article_of(jo)}
        if ref not in laws[r["답변ID"]]:
            laws[r["답변ID"]].append(ref)

    missing = sorted(set(picked) - set(answers) - set(meta))
    if missing:
        sys.exit(f"테이블에서 찾지 못한 답변ID: {missing}")

    out = []
    for aid, p in picked.items():
        a, m, c = answers[aid], meta[aid], complaints[answers[aid]["민원ID"]]
        out.append({
            "answerId": aid,
            "family": p["family"],
            "rank": p["rank"],
            "title": m["제목"],
            "question": c["질문내용"] or "",
            "agency": m["표준기관명"],
            "agencyType": AGENCY_TYPE.get(m["기관유형"], "central"),
            "sido": m["시도"] or None,
            "dept": m["부서경로"] or "",
            "workType": c["업무구분코드"],
            "askedAt": c["신청일자"],
            "answeredAt": a["답변일자"],
            "views": int(a["조회수"]) if a["조회수"].isdigit() else 0,
            "answer": a["답변내용"],
            "laws": laws[aid],
            "ref": a["게시번호"] or a["처리번호"] or f"답변 {aid}",
        })
    out.sort(key=lambda x: (list(FAMILY_KEY.values()).index(x["family"]), x["rank"]))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"대표 사례 {len(out)}건 → {os.path.relpath(OUT, ROOT)}", dict(collections.Counter(x["family"] for x in out)))


if __name__ == "__main__":
    main()
