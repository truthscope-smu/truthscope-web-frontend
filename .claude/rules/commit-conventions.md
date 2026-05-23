# 커밋 규칙

## PR 전 필수 로컬 검사 (커밋·push 전 반드시 실행)

README `§7 CI 파이프라인` 기준. CI가 잡는 항목은 로컬에서 먼저 통과시킨 뒤 커밋한다.

```bash
npm run format        # Prettier 포맷 자동 수정
npm run typecheck     # TypeScript 타입 에러 확인
npm run lint:fix      # ESLint + FSD 레이어 위반 자동 수정
npm run stylelint:fix # 하드코딩 색상·spacing 자동 수정
npm run build         # 빌드 최종 확인
```

**순서 중요**: format → typecheck → lint:fix → stylelint:fix → build 순으로 실행.  
한 단계라도 실패하면 수정 후 재실행, 전부 통과한 뒤에만 커밋·push한다.

**⚠️ CRLF 주의 (Windows)**: `format` 실행 후 반드시 `git diff --name-only`로 변경된 파일을 확인하고, 변경된 파일을 모두 스테이지에 포함시킨 뒤 커밋한다. format으로 수정된 파일을 누락하면 CI `format:check`에서 실패한다.

---

## Co-authored-by 작성 방법

모든 커밋 메시지 마지막에 아래 형식으로 고정 작성한다:

```
Co-authored-by: KWONSEOK02 <gwonseok02@gmail.com>
```

- **이메일**: `gwonseok02@gmail.com` 고정 (`noreply` 주소 사용 금지)
- **GitHub 사용자명**: `KWONSEOK02` 고정 (2026-05-23 통일, 이전 `gs07103` 사용 deprecated)
- Claude Co-Authored-By 추가 금지 — `KWONSEOK02` 단독으로만

---

## Gitmoji 커밋 메시지 형식

```
{이모지}{type}({scope}): {description}
```

예시:
```
✨feat(pages): 대시보드 페이지 FSD 구조로 이동
🐛fix(navbar): 접근성 개선 button 태그 적용
♻️refactor(widgets): barrel export 추가
```

| 이모지 | 타입 | 용도 |
|--------|------|------|
| ✨ | feat | 새 기능 |
| 🐛 | fix | 버그 수정 |
| ♻️ | refactor | 리팩토링 |
| 💄 | style | UI/스타일 변경 |
| 📝 | docs | 문서 변경 |
| 🔧 | chore | 설정 변경 |
| ✅ | test | 테스트 추가/수정 |
