# RAID Log — AXE

프로젝트 리스크(Risk), 가정(Assumption), 이슈(Issue), 의존성(Dependency)을 추적하는 내부 관리 도구입니다.

## 기술 스택

- **Frontend** — React 18, React Router v6, Tailwind CSS v3
- **빌드** — Vite 5
- **인증** — Azure AD (MSAL.js v2, 단일 계정 제한)
- **데이터** — JSONbin.io (REST API)
- **배포** — Docker + Azure Container Registry + Azure App Service
- **CI/CD** — GitHub Actions (main 브랜치 push 시 자동 배포)

## 프로젝트 구조

```
├── src/
│   ├── App.jsx               # 라우터 + 전역 상태 + 모달
│   ├── constants.js          # 타입/상태/색상 등 공통 상수
│   ├── utils.js              # 날짜 유틸, cx, ME
│   ├── index.css             # Tailwind + 커스텀 스타일
│   ├── components/
│   │   ├── icons.jsx
│   │   ├── badges.jsx        # TypeBadge, StatusBadge, SeverityBadge
│   │   ├── Header.jsx
│   │   ├── Select.jsx
│   │   ├── DetailDrawer.jsx
│   │   ├── FormModal.jsx
│   │   ├── AreaModal.jsx
│   │   └── TagModal.jsx
│   ├── hooks/
│   │   └── useRAIDStore.js   # 데이터 fetch/save + CRUD
│   └── pages/
│       ├── Dashboard.jsx     # / 대시보드 (AI 보고서 포함)
│       └── Log.jsx           # /log 전체 항목 테이블
├── public/
│   └── login.html            # Azure AD 로그인 (MSAL.js, Vite 빌드 외)
├── index.html                # Vite SPA 엔트리
├── nginx.conf                # SPA 라우팅용 try_files 설정
├── .github/workflows/
│   └── deploy.yml            # CI/CD 파이프라인
└── Dockerfile                # 멀티스테이지: node 빌드 → nginx 서빙
```

## 배포 구조

```
GitHub push → GitHub Actions
  → npm run build (VITE_AZURE_OPENAI_KEY 빌드 시 주입)
  → Docker 빌드 (node:20-alpine → nginx:alpine)
  → Azure Container Registry 푸시
  → Azure App Service 컨테이너 업데이트
```

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:5173  (로그인 없이 개발 가능)
```

Docker로 빌드 확인:
```bash
docker build --build-arg VITE_AZURE_OPENAI_KEY=your_key -t raid-log .
docker run -p 8080:80 raid-log
# http://localhost:8080/login.html
```

## GitHub Secrets

| Secret 이름 | 설명 |
|---|---|
| `AZURE_CREDENTIALS` | Azure 서비스 주체 JSON (App Service 배포 권한) |
| `AZURE_OPENAI_KEY` | Azure OpenAI API Key (AI 보고서 기능, 빌드 시 주입) |
| `ACR_PASSWORD` | Azure Container Registry 비밀번호 |
