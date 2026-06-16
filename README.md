# 오목 (Omok)

Android용 오목 앱 — React + Vite + Capacitor + Firebase

## 기능

- 사람 대전 (로컬 2인 / 온라인 방 코드)
- 컴퓨터 대전 (JS 엔진 / AI)
- 급·단 난이도 (15급 ~ 9단)
- 일반룰 / 렌주룰 (3급 이상 렌주 강제)
- 기보 저장 · 리플레이
- 관전 (Firebase 연동 시)
- 게임 ID 자동 생성

## 개발

```bash
npm install
npm run dev        # 브라우저 개발 서버
npm run build      # 프로덕션 빌드
npm run test       # 단위 테스트
npm run cap:sync   # Android 동기화
npm run cap:open   # Android Studio 열기
```

## Firebase 설정

`.env.example`을 `.env`로 복사 후 Firebase 프로젝트 값을 입력합니다.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_DATABASE_URL=...
```

## Android 빌드

1. `npm run cap:sync`
2. `npm run cap:open` → Android Studio에서 Run
3. AdMob·Play Games 연동은 출시 전 네이티브 플러그인 추가 필요

## 문서

- [앱 제작 계획서](docs/APP_PLAN.md)
