# RAID Log — AXE

프로젝트 리스크(Risk), 가정(Assumption), 이슈(Issue), 의존성(Dependency)을 추적하는 내부 관리 도구입니다.

## 기술 스택

- **Frontend** — React 18 (CDN), Tailwind CSS
- **인증** — Azure AD (MSAL.js v2, 단일 계정 제한)
- **데이터** — JSONbin.io (REST API)
- **배포** — Docker + Azure Container Registry + Azure App Service
- **CI/CD** — GitHub Actions (main 브랜치 push 시 자동 배포)

## 프로젝트 구조

```
├── src/                  # HTML 앱 파일
│   ├── index.html        # 대시보드 (메인)
│   ├── login.html        # Azure AD 로그인
│   └── log.html          # RAID 전체 목록
├── .github/workflows/
│   └── deploy.yml        # CI/CD 파이프라인
├── scripts/
│   └── setup-azure.sh    # Azure 리소스 최초 설정 (1회)
├── docs/
│   └── apps-script.md    # Google Apps Script 연동 참고
└── Dockerfile
```

## 배포 구조

```
GitHub push → GitHub Actions
  → src/index.html에 Azure OpenAI Key 주입
  → Docker 빌드 (nginx:alpine)
  → Azure Container Registry 푸시
  → Azure App Service 컨테이너 업데이트
```

## 로컬 실행

```bash
docker build -t raid-log .
docker run -p 8080:80 raid-log
# http://localhost:8080/login.html
```

## Azure 리소스 최초 설정

```bash
# Azure Cloud Shell에서 실행
bash <(curl -sL https://raw.githubusercontent.com/ratslee1/hw-raid-log/main/scripts/setup-azure.sh)
```

## GitHub Secrets

| Secret 이름 | 설명 |
|---|---|
| `AZURE_CREDENTIALS` | Azure 서비스 주체 JSON (App Service 배포 권한) |
| `AZURE_OPENAI_KEY` | Azure OpenAI API Key (AI 보고서 기능) |
