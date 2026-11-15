"""민원 DB 테이블 CSV → data/minwon_db.json

민원 DB(minwon.db)를 내보낸 테이블 CSV 폴더(테이블_CSV)를 읽어,
build-data.py 가 쓰는 원본 파일 하나(data/minwon_db.json)로 합칩니다.

- 답변: 중복 묶음의 최신 답변(최신답변여부 1·2)만, 기관·부서·처리기간·조회수를 붙여서
- 법령: 답변이 인용한 법령·조문과, 답변일 이후 개정 여부(법제처 조회 결과)
- 기관: 기관별 법정 처리일수 요약(기관별_예상답변기간)

사용: python3 -I scripts/import-db.py <테이블_CSV 폴더>
"""
import collections
import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "minwon_db.json")

AGENCY_TYPE = {"중앙행정기관": "central", "공공기관 등": "central", "지자체": "local", "교육청": "education"}
AGENCY_TYPE_CODE = {"CENTRAL": "central", "PUBLIC": "central", "LOCAL": "local", "EDU": "education"}
# JSON 법령 목록에서 온 인용을 먼저, 본문 「」 표기에서 뽑은 인용(정확도 미검증)을 뒤에 둡니다.
METHOD_ORDER = {"laws정상": 0, "laws전체": 0, "laws부칙": 0, "laws파싱실패": 0, "본문정규식": 1}


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


# 국가법령정보센터 본문 주소(현행 일련번호). 찾지 못한 법령은 앱에서 검색 주소로 보냅니다.
LAW_PAGE = {
    "법령": "https://www.law.go.kr/lsInfoP.do?lsiSeq={}",
    "자치법규": "https://www.law.go.kr/ordinInfoP.do?ordinSeq={}",
    "행정규칙": "https://www.law.go.kr/admRulInfoP.do?admRulSeq={}",
}


def law_page(law):
    tpl = LAW_PAGE.get(law.get("법령출처"))
    return tpl.format(law["현행일련번호"]) if tpl and law.get("현행일련번호") else None


def change_of(jo, law, answered_at):
    """답변일 이후 바뀌었으면 (바뀐 날, 'article'|'law'), 아니면 (None, None).
    조문 본문을 받은 조문은 그 조문의 최종개정일로, 그렇지 않으면 법령 시행일로 판단합니다."""
    last = jo.get("최종개정일") or ""
    if jo["조문구분"] == "조문" and last:
        return (last, "article") if last > answered_at else (None, None)
    enforced = law.get("시행일자") or ""
    if enforced and enforced > answered_at:
        return enforced, "law"
    return None, None


def main():
    if len(sys.argv) != 2:
        sys.exit("사용: python3 -I scripts/import-db.py <테이블_CSV 폴더>")
    table_dir = sys.argv[1]
    csv.field_size_limit(10**9)

    meta = list(rows(table_dir, "v_검색메타.csv"))
    ids = {m["답변ID"] for m in meta}
    answers = {a["답변ID"]: a for a in rows(table_dir, "답변.csv") if a["답변ID"] in ids}
    complaints = {c["민원ID"]: c for c in rows(table_dir, "민원.csv")}
    timing = {t["답변ID"]: t for t in rows(table_dir, "처리기간.csv")}
    laws = {r["법령ID"]: r for r in rows(table_dir, "법령.csv")}
    articles = {r["조문ID"]: r for r in rows(table_dir, "조문.csv")}

    answered = {m["답변ID"]: m["답변일자"] for m in meta}
    cites = collections.defaultdict(list)
    for r in rows(table_dir, "답변_법령인용.csv"):
        aid = r["답변ID"]
        if aid not in ids:
            continue
        jo = articles.get(r["조문ID"])
        law = laws.get(jo["법령ID"]) if jo else None
        if not law or not law["표준법령명"].strip("「」 "):
            continue
        changed_at, scope = change_of(jo, law, answered[aid])
        ref = {"name": law["표준법령명"].strip("「」 "), "article": article_of(jo)}
        page = law_page(law)
        if page:
            ref["link"] = page
        if changed_at:
            ref["changedAt"] = changed_at
            ref["changeScope"] = scope
        cites[aid].append((METHOD_ORDER.get(r["추출방식"], 1), int(r["인용순번"] or 0), ref))

    out = []
    for m in meta:
        aid = m["답변ID"]
        a, c, t = answers[aid], complaints[m["민원ID"]], timing.get(aid)
        refs, seen = [], set()
        for _, _, ref in sorted(cites[aid], key=lambda x: (x[0], x[1])):
            key = (ref["name"], ref["article"])
            if key not in seen:
                seen.add(key)
                refs.append(ref)
        out.append({
            "id": aid,
            "title": m["제목"],
            "question": c["질문내용"] or "",
            "agency": m["표준기관명"],
            "agencyType": AGENCY_TYPE.get(m["기관유형"], "central"),
            "sido": m["시도"] or None,
            "district": m["시군구"] or None,
            "dept": m["부서경로"] or "",
            "workType": m["업무구분코드"],
            "askedAt": c["신청일자"],
            "answeredAt": m["답변일자"],
            "views": int(a["조회수"]) if a["조회수"].isdigit() else 0,
            # 처리기간 표는 민원질의응답(MINWON)만 있습니다. 신청민원은 답변일이 공개 등록일이라 계산하지 않습니다.
            "calendarDays": int(t["달력일"]) if t and t["이상치여부"] != "1" else None,
            "legalDays": int(t["법정일수"]) if t and t["이상치여부"] != "1" else None,
            "answer": m["답변내용"],
            "laws": refs,
            # 국민신문고 처리번호(신청민원만 있음). 게시번호는 수집 파일의 번호라 밖에서 쓸 수 없습니다.
            "ref": a["처리번호"] or "",
        })

    agencies = {r["기관ID"]: r for r in rows(table_dir, "기관.csv")}
    stats = []
    for r in rows(table_dir, "기관별_예상답변기간.csv"):
        ag = agencies.get(r["기관ID"])
        if not ag:
            continue
        stats.append({
            "name": ag["표준기관명"],
            "type": AGENCY_TYPE_CODE.get(ag["기관유형코드"], "central"),
            "answers": int(r["답변수"]),
            "medianLegalDays": float(r["중앙값_법정일수"]),
            "p90LegalDays": float(r["상위90_법정일수"]),
            "over7Pct": float(r["법정7일초과_비율"]),
        })
    region_rows = [
        {"name": r["표준기관명"], "sido": r["시도"], "district": r["시군구"] or None}
        for r in agencies.values()
        if r["기관유형코드"] == "LOCAL" and r["시도"]
    ]
    checked = max((l["조회일시"] for l in laws.values() if l["조회일시"]), default="")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(
            {"lawCheckedAt": checked[:10], "answers": out, "agencyStats": stats, "localAgencies": region_rows},
            f,
            ensure_ascii=False,
            separators=(",", ":"),
        )
    changed = sum(1 for x in out if any("changedAt" in l for l in x["laws"]))
    print(f"답변 {len(out):,}건 · 법령 인용 {sum(1 for x in out if x['laws']):,}건 (답변 뒤 개정 {changed:,}건) · 기관 통계 {len(stats)}곳")
    print(f"→ {os.path.relpath(OUT, ROOT)} ({round(os.path.getsize(OUT) / 1024 / 1024, 1)} MB)")


if __name__ == "__main__":
    main()
