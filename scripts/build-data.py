#!/usr/bin/env python3
"""
민원나침반 샘플 데이터 빌드 스크립트

입력: data/epeople_faq.json (국민신문고 민원 질의응답 원문, 약 2만 건)
      data/featured_source.json (분야별 대표 사례 원문, scripts/extract-featured.py 로 만듦)
출력: public/data/cases.json     - 화면에 쓰는 선별 사례(주제별 표본)
      public/data/agencies.json  - 기관별 통계(건수·유형·처리기간·주요 부서·주요 법령)
      public/data/regions.json   - 시도/시군구 목록(데이터에서 추출 + 보완)
      public/data/meta.json      - 빌드 정보

실행: python3 -I scripts/build-data.py
"""
import collections
import hashlib
import json
import os
import re
import statistics
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "epeople_faq.json")
FEATURED_SRC = os.path.join(ROOT, "data", "featured_source.json")
OUT = os.path.join(ROOT, "public", "data")

SIDO = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시",
    "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "강원도", "충청북도",
    "충청남도", "전북특별자치도", "전라북도", "전라남도", "경상북도", "경상남도",
    "제주특별자치도",
]
SIDO_ALIAS = {"강원도": "강원특별자치도", "전라북도": "전북특별자치도"}

SEOUL_DISTRICTS = [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구",
    "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
]
GYEONGGI_DISTRICTS = [
    "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시",
    "평택시", "의정부시", "시흥시", "파주시", "김포시", "광명시", "광주시", "군포시", "하남시",
    "오산시", "양주시", "이천시", "구리시", "안성시", "포천시", "의왕시", "여주시", "양평군",
    "동두천시", "과천시", "가평군", "연천군",
]

# 주제 사전: slug -> (표시명, 키워드, 그룹)
TOPICS = {
    "housing-rent": ("전월세·보증금", ["전세", "월세", "임대차", "보증금", "임대인", "임차인", "전세사기"], "housing"),
    "housing-apt": ("아파트 관리·층간소음", ["층간소음", "관리비", "관리사무소", "입주자대표", "공동주택", "관리규약"], "housing"),
    "housing-subscription": ("청약·분양", ["청약", "분양", "특별공급", "당첨"], "housing"),
    "housing-redevelop": ("재개발·재건축", ["재개발", "재건축", "정비사업", "정비구역"], "housing"),
    "housing-public": ("공공임대·주거복지", ["공공임대", "LH", "행복주택", "주거급여", "임대주택", "전세임대", "주거복지"], "housing"),
    "care": ("돌봄·방과후", ["돌봄", "방과후", "늘봄", "어린이집", "유치원", "보육"], "life"),
    "school": ("학교·교육", ["학교", "급식", "교사", "학생", "통학", "학부모", "교육청"], "life"),
    "streetlight": ("가로등·보안등", ["가로등", "보안등", "조명"], "town"),
    "road": ("도로·보도", ["도로", "보도", "인도", "포트홀", "횡단보도", "신호등", "과속방지턱"], "town"),
    "parking": ("주차·불법주정차", ["주차", "주정차"], "town"),
    "transit": ("버스·대중교통", ["버스", "정류장", "노선", "지하철", "택시"], "town"),
    "noise": ("소음·공사", ["소음", "공사장", "진동"], "town"),
    "waste": ("쓰레기·폐기물", ["쓰레기", "폐기물", "분리수거", "무단투기", "재활용"], "town"),
    "park": ("공원·녹지", ["공원", "녹지", "놀이터", "산책로"], "town"),
    "fire": ("소방·안전", ["소방", "화재", "대피"], "safety"),
    "import-food": ("수입식품·식품", ["수입식품", "수입 식품", "해외직구", "수입신고", "식품", "건강기능식품"], "business"),
    "tax": ("세금·부가세", ["부가가치세", "부가세", "세금계산서", "종합소득세", "양도소득세", "세금", "국세", "지방세"], "business"),
    "business": ("영업·인허가", ["영업신고", "인허가", "폐업", "사업자", "소상공인", "영업자"], "business"),
    "building": ("건축·용도변경", ["건축", "증축", "용도변경", "건폐율", "용적률"], "housing"),
    "car": ("자동차·검사", ["자동차", "검사주기", "차량", "번호판", "운전면허"], "life"),
    "welfare": ("복지·지원금", ["기초생활", "수급", "장애인", "노인", "긴급복지", "바우처", "지원금"], "life"),
    "civil-defense": ("민방위·병역", ["민방위", "예비군", "병역"], "life"),
    "documents": ("증명서·등록", ["여권", "주민등록", "등본", "증명서", "전입신고"], "life"),
    "pets": ("반려동물", ["반려동물", "반려견", "유기동물", "동물등록", "개물림", "개 물림"], "life"),
    "energy": ("전기·에너지", ["전기요금", "한전", "전력", "태양광"], "life"),
    "labor": ("산업안전·노동", ["안전보건", "산업재해", "근로자", "임금"], "business"),
    "environment": ("환경·대기", ["미세먼지", "악취", "하천", "수질", "대기"], "town"),
}
TOPIC_QUOTA = 22
HOUSING_QUOTA = 30

BOILER = [
    r"안녕하십니까", r"국민신문고를 통해", r"국민신문고를 통하여", r"신청하신 민원", r"관심과 애정",
    r"감사드리", r"감사합니다", r"만족스러운 답변", r"연락\s*주시", r"문의하시기 바랍니다",
    r"본 회신내용은", r"이해됩니다", r"검토한 의견은 다음과 같습니다", r"다음과 같이 알려드립니다",
    r"답변드리겠습니다", r"평소 .{0,20}관심", r"응답소\(민원상담\)", r"^끝\.?$", r"귀하의 질의사항에 대",
    r"답변이 되었기를", r"양해하여 주시기", r"안내해 드리", r"안내드리겠습니다$",
    r"기원합니다", r"검토\s*의견은 다음과 같습니다", r"만족도 (조사|평가)", r"에 관하여 답변드립니다",
    r"답변\s*드립니다", r"귀하의 민원사항에 대", r"소중한 시간을", r"나의 신문고",
    # 답변 머리의 면책 문구: "(답변 출처) 해당 민원 답변은 … 달리 적용될 수 있음을 알려드립니다."
    r"답변\s*출처", r"유효한 법규를 토대로", r"달리 적용될 수 있음", r"사실관계 등에 따라",
]
BOILER_RE = [re.compile(p) for p in BOILER]
ENUM_RE = re.compile(r"^\s*(?:\d{1,2}[.)]|[가-힣][.)]|[ㅇ○□■▶▪◦∙·\-–*]|[oO](?=\s)|\(\d+\))\s*")
# 요약에서 그림 기호(이모지·딩뱃·도형 글머리)를 걷어냅니다. 전화 기호는 '전화'로, 딩뱃 화살표는 →로 바꿉니다.
PICTO_PHONE_RE = re.compile(r"[☎☏]\s*")
PICTO_ARROW_RE = re.compile(r"[\u2794-\u27BF]")
PICTO_DROP_RE = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u26FF\u2700-\u2775\u2B00-\u2BFF\u25A0-\u25FF\uFE0F\uE000-\uF8FF]")


def strip_pictographs(t: str) -> str:
    t = PICTO_PHONE_RE.sub("전화 ", t)
    t = PICTO_ARROW_RE.sub("→", t)
    t = PICTO_DROP_RE.sub(" ", t)
    return re.sub(r"\s+", " ", t)


def agency_type(agency: str) -> str:
    if "교육청" in agency or "교육지원청" in agency:
        return "education"
    for s in SIDO:
        if agency.startswith(s):
            return "local"
    return "central"


def split_region(agency: str):
    for s in SIDO:
        if agency.startswith(s):
            rest = agency[len(s):].strip()
            return SIDO_ALIAS.get(s, s), rest
    return None, None


def norm_ws(t: str) -> str:
    return re.sub(r"\s+", " ", t or "").strip()


def clean_answer(answer: str) -> str:
    t = norm_ws(answer)
    t = re.sub(r"\[본 회신내용은.*?\]", "", t)
    t = re.sub(r"\(신청번호[^)]*\)", "", t)
    t = re.sub(r"\(답변\)\s*", "", t)
    t = re.sub(r"[-=_─━]{3,}", " ", t)  # 구분선
    # 날짜 표기(2026. 3. 27.)의 내부 공백 제거 → 항목 기호로 오인하지 않도록 보호
    t = re.sub(r"(\d{2,4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.?", r"\1.\2.\3.", t)
    t = re.sub(r"(\d{2,4})\.\s+(\d{1,2})\.", r"\1.\2.", t)
    # 문장 끝에 바로 붙은 항목 번호(…합니다.2. 귀하…) 분리
    t = re.sub(r"(?<=[.?!])(?=\d{1,2}\.\s*[가-힣(\"“「])", " ", t)
    # 항목 기호 앞에서 줄바꿈 (기호 뒤에 한글/괄호/따옴표가 이어질 때만)
    t = re.sub(r"\s(?=(?:\d{1,2}\.|[가-힣]\.|ㅇ|○|□|■|▶|-)\s+[가-힣(\"“「])", "\n", t)
    t = re.sub(r"\n{2,}", "\n", t)
    return t.strip()[:1400]


def summarize(answer: str) -> str:
    t = strip_pictographs(norm_ws(answer))
    t = re.sub(r"\[본 회신내용은.*?\]", "", t)
    # FAQ 형식(Q. 질문? A. 답변)의 질문 부분은 요약에서 제외
    t = re.sub(r"^\s*Q\.?\s*[^?？]{0,120}[?？]\s*(A\.?\s*)?", "", t)
    t = re.sub(r"귀하의 (?:민원|질의)\s*내용은.*?이해됩니다\.?", " ", t)
    t = re.sub(r"\(답변\)\s*", "", t)
    t = re.sub(r"[-=_─━]{3,}", " ", t)  # 구분선
    t = re.sub(r"(\d{2,4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.?", r"\1.\2.\3.", t)
    t = re.sub(r"(?<=[.?!])(?=\d{1,2}\.\s*[가-힣(\"“「])", " ", t)
    sentences = re.split(r"(?<=[.?!])\s+|(?<=[.?!])(?=[가-힣(\[“\"])", t)
    picked = []
    total = 0
    for s in sentences:
        s = ENUM_RE.sub("", s).strip()
        if len(s) < 12:
            continue
        if any(r.search(s) for r in BOILER_RE):
            continue
        picked.append(s)
        total += len(s)
        if len(picked) >= 3 or total >= 150:
            break
    out = " ".join(picked)
    if not out:
        out = t[:160]
    if len(out) > 220:
        out = out[:218].rstrip() + "…"
    return out


def parse_laws(laws):
    out = []
    seen = set()
    for raw in laws or []:
        parts = [p.strip() for p in raw.split(" / ")]
        name = parts[0]
        article = parts[1] if len(parts) > 1 else ""
        name = re.sub(r"\s*/\s*$", "", name).strip("「」 ")
        if not name:
            continue
        key = (name, article)
        if key in seen:
            continue
        seen.add(key)
        out.append({"name": name, "article": article})
    return out


def days_between(a: str, b: str):
    try:
        return (date.fromisoformat(b) - date.fromisoformat(a)).days
    except Exception:
        return None


def topics_of(title: str):
    found = []
    for slug, (_, kws, _) in TOPICS.items():
        if any(k in title for k in kws):
            found.append(slug)
    return found


def quality(it) -> float:
    title, answer = it["title"], it["answer"]
    if not (6 <= len(title) <= 80):
        return -1
    if not (120 <= len(answer) <= 3200):
        return -1
    if re.search(r"(뇌의 기본|유교가|OOO-OOOO)", title):
        return -1
    v = int(it["views"]) if str(it["views"]).isdigit() else 0
    score = 0.0
    score += 2.0 if it["laws"] else 0.0
    score += min(3.0, (v ** 0.5) / 10)
    score += 1.0 if 10 <= len(title) <= 45 else 0.0
    score += 1.0 if 250 <= len(answer) <= 1500 else 0.0
    score += 0.5 if "?" in title or "문의" in title or "궁금" in title else 0.0
    return score


def stable_int(key: str, lo: int, hi: int) -> int:
    h = int(hashlib.md5(key.encode("utf-8")).hexdigest()[:8], 16)
    return lo + h % (hi - lo + 1)


# 분야(첫 화면 '분야별 찾기' 갈래) -> 그 분야에 속한 주제 slug. src/config/families.ts 와 맞춰 둡니다.
FAMILY_SLUGS = {
    "housing": ["housing-rent", "housing-apt", "housing-subscription", "housing-redevelop", "housing-public", "building"],
    "traffic": ["road", "parking", "transit", "car"],
    "care": ["care", "school"],
    "env": ["noise", "waste", "environment"],
    "town": ["streetlight", "park"],
    "safety": ["fire", "labor"],
    "biz": ["tax", "business", "import-food"],
    "welfare": ["welfare", "documents", "civil-defense", "energy"],
    "pets": ["pets"],
}
# 제목·질문에서 분야 안의 주제를 못 찾으면 붙이는 기본 주제
FAMILY_DEFAULT_SLUG = {
    "housing": "building", "traffic": "car", "care": "school", "env": "environment", "town": "park",
    "safety": "fire", "biz": "business", "welfare": "welfare", "pets": "pets",
}


def load_featured():
    """data/featured_source.json(분야별 대표 사례 원문)을 cases.json 형식으로 바꿉니다."""
    if not os.path.exists(FEATURED_SRC):
        return []
    with open(FEATURED_SRC, encoding="utf-8") as f:
        items = json.load(f)
    out = []
    for it in items:
        slugs = FAMILY_SLUGS[it["family"]]
        topics = [t for t in topics_of(it["title"]) if t in slugs] or [t for t in topics_of(it["title"] + " " + it["question"][:200]) if t in slugs]
        out.append({
            "id": f"f{it['answerId']}",
            "title": norm_ws(it["title"]),
            "agency": it["agency"],
            "agencyType": it["agencyType"],
            "dept": it["dept"],
            "sido": it["sido"],
            "kind": "policy" if it["workType"] == "POLICY" else "case",
            "askedAt": it["askedAt"],
            "answeredAt": it["answeredAt"],
            "views": it["views"],
            "processingDays": days_between(it["askedAt"], it["answeredAt"]),
            "laws": it["laws"],
            "summary": summarize(it["answer"]),
            "answer": clean_answer(it["answer"]),
            "topics": topics or [FAMILY_DEFAULT_SLUG[it["family"]]],
            "ref": it["ref"],
            "featured": it["family"],
        })
    # 분야 안에서는 기관 유형(중앙·지자체·교육청)이 분야 안 비율대로 섞이게 하고,
    # 같은 유형 안에서는 최근 답변이 먼저 오도록 순위를 매깁니다. 첫 화면은 앞 8건만 보여 줍니다.
    by_family = collections.defaultdict(list)
    for c in out:
        by_family[c["featured"]].append(c)
    for lst in by_family.values():
        lanes = collections.defaultdict(list)
        for c in sorted(lst, key=lambda c: (c["answeredAt"], c["id"]), reverse=True):
            lanes[c["agencyType"]].append(c)
        total, taken = len(lst), collections.Counter()
        for i in range(1, total + 1):
            # 지금까지 자기 몫보다 가장 덜 나온 유형을 고르고, 같으면 더 최근 답변을 먼저
            t = min(
                (t for t in lanes if taken[t] < len(lanes[t])),
                key=lambda t: ((taken[t] + 0.5) / len(lanes[t]), tuple(-ord(ch) for ch in lanes[t][taken[t]]["answeredAt"])),
            )
            lanes[t][taken[t]]["featuredRank"] = i
            taken[t] += 1
    return out


def norm_title(t):
    return re.sub(r"[^가-힣a-z0-9]", "", t.lower())[:28]


def main():
    with open(SRC, encoding="utf-8") as f:
        items = json.load(f)
    print(f"원본 {len(items):,}건")

    # ---------- 기관 통계 (전체 데이터 기준) ----------
    by_agency = collections.defaultdict(list)
    for it in items:
        by_agency[it["agency"]].append(it)

    agencies = []
    for name, lst in by_agency.items():
        atype = agency_type(name)
        ds = [d for d in (days_between(x["qdate"], x["adate"]) for x in lst) if d is not None and d >= 0]
        median_days = statistics.median(ds) if ds else None
        within14 = round(100 * sum(1 for d in ds if d <= 14) / len(ds)) if ds else None
        depts = collections.Counter(x["dept"] for x in lst if x["dept"]).most_common(3)
        laws = collections.Counter(l.split(" / ")[0].strip("「」 ") for x in lst for l in x["laws"]).most_common(3)
        # 예상 답변기간(영업일): 데이터가 신뢰할 만하면 데이터 기반, 아니면 결정적 Mock
        if median_days is not None and median_days <= 30 and len(ds) >= 5:
            expected = max(1, min(14, round(median_days * 5 / 7)))
            source = "data"
        else:
            expected = stable_int(name, 3, 12) if atype == "central" else stable_int(name, 4, 14)
            source = "mock"
        sido, district = split_region(name)
        agencies.append({
            "name": name,
            "type": atype,
            "count": len(lst),
            "medianDays": median_days,
            "within14Pct": within14,
            "expectedBusinessDays": expected,
            "estimateSource": source,
            "topDepts": [d for d, _ in depts],
            "topLaws": [l for l, _ in laws],
            "sido": sido,
            "district": district or None,
        })
    agencies.sort(key=lambda a: -a["count"])

    # ---------- 사례 선별 ----------
    scored = []
    for it in items:
        q = quality(it)
        if q < 0:
            continue
        scored.append((q, it))
    scored.sort(key=lambda x: -x[0])

    picked = {}
    seen_titles = set()
    per_agency = collections.Counter()

    def take(it, reason):
        key = norm_title(it["title"])
        if key in seen_titles or it["no"] in picked:
            return False
        if per_agency[it["agency"]] >= 60:
            return False
        seen_titles.add(key)
        per_agency[it["agency"]] += 1
        picked[it["no"]] = (it, reason)
        return True

    # 1) 주제별 표본
    for slug, (_, kws, group) in TOPICS.items():
        quota = HOUSING_QUOTA if group == "housing" else TOPIC_QUOTA
        n = 0
        for q, it in scored:
            if n >= quota:
                break
            if any(k in it["title"] for k in kws):
                if take(it, slug):
                    n += 1
    # 2) 정책 질의응답(공식 안내)
    n = 0
    for q, it in scored:
        if it["dutySctnNm"] == "tqaplcy" and take(it, "policy"):
            n += 1
            if n >= 50:
                break
    # 3) 당일 답변 안내형(기관 FAQ 성격) - 기관별 최대 6건
    cnt = collections.Counter()
    n = 0
    for q, it in scored:
        if it["dutySctnNm"] == "tqapttn" and it["qdate"] == it["adate"] and cnt[it["agency"]] < 6:
            if take(it, "faq"):
                cnt[it["agency"]] += 1
                n += 1
                if n >= 100:
                    break
    # 4) 조회수 상위로 보충
    for q, it in scored:
        if len(picked) >= 780:
            break
        take(it, "popular")

    cases = []
    for no, (it, reason) in picked.items():
        kind = "policy" if it["dutySctnNm"] == "tqaplcy" or (it["dutySctnNm"] == "tqapttn" and it["qdate"] == it["adate"]) else "case"
        sido, district = split_region(it["agency"])
        cases.append({
            "id": str(it["no"]),
            "title": norm_ws(it["title"]),
            "agency": it["agency"],
            "agencyType": agency_type(it["agency"]),
            "dept": it["dept"],
            "sido": sido,
            "kind": kind,
            "askedAt": it["qdate"],
            "answeredAt": it["adate"],
            "views": int(it["views"]) if str(it["views"]).isdigit() else 0,
            "processingDays": days_between(it["qdate"], it["adate"]),
            "laws": parse_laws(it["laws"]),
            "summary": summarize(it["answer"]),
            "answer": clean_answer(it["answer"]),
            "topics": topics_of(it["title"]),
            "ref": it["epUnionSn"],
        })
    cases.sort(key=lambda c: c["answeredAt"], reverse=True)

    # ---------- 대표 사례(분야별 20건, scripts/extract-featured.py 로 추출) ----------
    featured = load_featured()
    if featured:
        featured_titles = {norm_title(c["title"]) for c in featured}
        cases = [c for c in cases if norm_title(c["title"]) not in featured_titles] + featured
    else:
        print("주의: data/featured_source.json 이 없어 대표 사례 없이 빌드합니다.")

    # ---------- 지역 ----------
    districts = collections.defaultdict(set)
    for a in agencies:
        if a["type"] == "local" and a["sido"] and a["district"]:
            districts[a["sido"]].add(a["district"])
    districts["서울특별시"].update(SEOUL_DISTRICTS)
    districts["경기도"].update(GYEONGGI_DISTRICTS)
    regions = []
    for s in SIDO:
        if s in SIDO_ALIAS:
            continue
        regions.append({
            "sido": s,
            "shortName": s.replace("특별자치시", "").replace("특별자치도", "").replace("특별시", "").replace("광역시", ""),
            "educationOffice": f"{s}교육청",
            "districts": sorted(districts.get(s, [])),
        })

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "cases.json"), "w", encoding="utf-8") as f:
        json.dump(cases, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(OUT, "agencies.json"), "w", encoding="utf-8") as f:
        json.dump(agencies, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(OUT, "regions.json"), "w", encoding="utf-8") as f:
        json.dump(regions, f, ensure_ascii=False, indent=1)
    meta = {
        "sourceCount": len(items),
        "caseCount": len(cases),
        "policyCount": sum(1 for c in cases if c["kind"] == "policy"),
        "featuredCount": sum(1 for c in cases if c.get("featured")),
        "agencyCount": len(agencies),
        "topics": {slug: {"label": label, "group": group} for slug, (label, _, group) in TOPICS.items()},
        "builtAt": date.today().isoformat(),
        "source": "국민권익위원회 국민신문고 민원질의응답 원문데이터(공공데이터포털)",
    }
    with open(os.path.join(OUT, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)

    print(f"선별 사례 {len(cases):,}건 (공식 안내 {meta['policyCount']}건), 기관 {len(agencies)}곳")
    tc = collections.Counter(t for c in cases for t in c["topics"])
    print("주제별:", dict(tc))
    print("유형별:", collections.Counter(c["agencyType"] for c in cases))
    print("법령 인용 사례:", sum(1 for c in cases if c["laws"]))
    print("cases.json 크기:", round(os.path.getsize(os.path.join(OUT, "cases.json")) / 1024), "KB")


if __name__ == "__main__":
    main()
