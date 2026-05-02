# RATIONALE — truthscope-web-frontend

본 파일은 truthscope-web-frontend의 주요 의사결정 배경을 누적 박제. ADR과 별도 — ADR은 결정/Status, RATIONALE은 narrative 컨텍스트.

---

## Phase 21 — frontend DDD/TDD 적용 (2026-05-02)

ADR-006 참조. 핵심 메시지:

- archetype-ddd-pilot 정합은 학습 archetype 적용 (production-realistic learning track)
- Mind Signal/lapidix와 다른 4 unique 가치축 — production app 적용 + BE seed 1:1 + dep-cruiser FE-DDD 5+5+Q3 + Phase E 3-template stack companion
- Phase 21 = archetype의 첫 production-like adoption signal (14a Revision 평가 2026-11-01)
- 11 결정 LOCK (DISCUSS §2) + 12 compromise design (5+ score, §5)
- 6 base prereq (DISCUSS §6) + 4 critique 추가 prereq (CRITIQUE §Remedies) = 10 PLAN Preconditions
- Wave 분배: 권석 단독 W0-W2 + 4 멤버 W3+ (Usage WEAK 보정)
- revision trigger: W2 4시간 이내 + kickoff 자가평가 ≥3/5 → 🟢 / 미달 → 🟠 PIVOT

### W0~W3 BE 무관 영역 + W5 docs/guides done (2026-05-02 partial)

PR #24 draft (base = `dev`). 17 commits + Article unit test 13/13 PASS + dep-cruiser
0 violations + build PASS (7 routes). revision trigger 1차 metric 충족 (T2.1~T2.5 git
timestamp delta = 7분 19초 ≪ 4h LOCK).

W3 BE 의존 영역 (T3.3 attach feature + T3.4 actions slot wiring) + W4 통합 tests +
verify CHECKLIST + 옵시디언 history는 BE phase 21-5 ArticleController PR 머지 +
W-1b 게이트 통과 후 추가 의무. ADR-006 §"Implementation footnote" 상세 박제.
