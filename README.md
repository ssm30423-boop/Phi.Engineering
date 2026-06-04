# 집중 타이머

CT 과제 — 모래시계 추상화 모델 기반 집중 타이머 프로토타입

## 추상화 속성

| 속성 | 설명 |
|------|------|
| `trigger` | 시스템을 시작시키는 신호 (0 / 1) |
| `resource` | 소비 가능한 자원의 양 (남은 시간, 초) |
| `consumeRate` | 단위 시간당 자원 소비율 (1s/tick) |
| `threshold` | 완료를 판단하는 조건값 (0s) |
| `progress` | 현재 상태를 0~100%로 나타낸 값 |

## 기능

- 원형 다이얼 드래그로 시간 조절 (타이머 작동 중에도 가능)
- 집중 25분 / 단기 10분 / 휴식 5분 모드
- IDLE → RUNNING → COMPLETE 상태 전환
- 다크모드 지원

## 로컬 실행

별도 빌드 없이 `index.html`을 브라우저에서 열면 됩니다.

```bash
open index.html
```

## GitHub → Vercel 배포

### 1. GitHub 저장소 생성

```bash
git init
git add .
git commit -m "init: 집중 타이머 프로토타입"
git branch -M main
git remote add origin https://github.com/[유저명]/focus-timer.git
git push -u origin main
```

### 2. Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. **Add New Project** → 위에서 만든 저장소 선택
3. Framework Preset: **Other** 선택
4. **Deploy** 클릭

빌드 설정 없이 정적 파일로 바로 배포됩니다.

---

이후 `main` 브랜치에 push할 때마다 Vercel이 자동으로 재배포합니다.
