# DevRadar

개발자를 위한 최신 뉴스 피드와 긴급 패치 레이더를 한 화면에 묶은 모노레포 MVP입니다.

DevRadar는 일반 RSS 리더가 아닙니다. 목표는 많이 긁어오는 것이 아니라, 개발자가 오늘 실제로 확인해야 할 변경과 보안 이슈를 빠르게 걸러주는 것입니다. “새로운 글이 있네”보다 “이거 우리 코드에 영향 있나?”에 더 가깝습니다.

## 주요 기능

- 개발자 뉴스 피드: Hacker News, GitHub Releases 기반 최신 개발 이슈와 릴리즈를 수집합니다.
- 카테고리 필터: AI / Web / App / Backend / Security 기준으로 피드를 좁혀 볼 수 있습니다.
- 정렬: 최신순, 중요도순, 토론량 기준으로 피드를 정렬합니다.
- 한국어 요약: 수집된 피드마다 짧은 한국어 summary와 why-it-matters 문구를 저장합니다.
- 보안 이슈 레이더: OSV, GitHub Advisories, NVD, CISA KEV 데이터를 수집해 보안 사고로 정규화합니다.
- 워치리스트: 사용자가 추적할 패키지와 현재 버전을 등록할 수 있습니다.
- 영향 판별: watchlist 패키지와 보안 사고를 비교해 exact / likely / no_match / unknown confidence를 표시합니다.
- 알림 센터: 영향 있는 사고는 UserAlert로 생성해 별도 알림 목록에서 확인합니다.
- 중복 제거: feed는 URL 기반, security는 alias / package / version range 기준으로 중복을 줄입니다.
- 더미 데이터 없음: 현재 앱은 실패 fallback으로 가짜 피드를 보여주지 않습니다. 데이터가 없으면 비어 있는 상태가 그대로 보입니다.

## 화면

- `/dashboard`: 긴급 알림, 주시 중 위험 패키지, 오늘의 피드, 보안 사고 요약을 한 화면에서 봅니다.
- `/feed`: 개발 뉴스와 릴리즈 피드를 필터/정렬해서 확인합니다.
- `/feed/[id]`: 피드 상세와 원문 링크를 봅니다.
- `/security`: 보안 사고 목록을 severity / ecosystem / package 기준으로 확인합니다.
- `/security/[id]`: affected range, fixed version, aliases, references, 권장 조치를 확인합니다.
- `/watchlist`: 추적할 패키지와 현재 사용 버전을 관리합니다.
- `/alerts`: watchlist와 매칭된 긴급 알림을 확인합니다.
- `/settings`: 알림 채널, digest 시간, 소스 설정을 확인합니다.

## 시스템 역할

```text
web      사용자 화면. Next.js App Router 기반.
api      web이 호출하는 NestJS API. Prisma로 PostgreSQL을 조회합니다.
worker   외부 데이터 수집, 정규화, dedupe, watchlist 매칭, alert 생성을 담당합니다.
db       PostgreSQL. FeedItem, SecurityIncident, WatchlistItem, UserAlert 저장.
redis    BullMQ queue. worker의 반복 작업과 job 실행을 관리합니다.
```

## 데이터 소스

### Feed

- Hacker News Firebase API
- GitHub Releases
  - `vercel/next.js`
  - `vercel/vercel`
  - `vitejs/vite`
  - `facebook/react`
  - `nuxt/nuxt`
  - `sveltejs/kit`
  - `spring-projects/spring-boot`
  - `JetBrains/kotlin`
  - `androidx/androidx`

### Security

- OSV
- GitHub Advisories
- NVD
- CISA Known Exploited Vulnerabilities

## 구조

```text
/apps
  /web      Next.js 15 + App Router + TanStack Query
  /api      NestJS API + Prisma
  /worker   BullMQ 기반 수집/정규화/매칭 워커
/packages
  /ui       공용 UI primitive
  /types    Zod schema와 공유 타입
  /config   Tailwind preset
  /utils    dedupe, scoring, version matching, alert rules
/prisma     schema, migration, seed/cleanup
/docs       architecture 문서
```

## 빠른 시작

```bash
cd /Users/onigiriman/workspace/devradar
corepack enable
corepack prepare pnpm@10.11.0 --activate
corepack pnpm install
```

환경 파일을 준비합니다.

```bash
cp .env.example .env.local
```

PostgreSQL과 Redis를 먼저 실행합니다.

```bash
brew services start postgresql@17
redis-server
```

DB 스키마를 반영합니다.

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:migrate
corepack pnpm prisma:seed
```

개발 서버를 실행합니다.

```bash
corepack pnpm dev:api
corepack pnpm dev:web
corepack pnpm dev:worker
```

기본 주소:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 수동 수집

워커 스케줄을 기다리지 않고 실제 외부 데이터를 한 번 바로 수집하려면:

```bash
corepack pnpm worker:once
```

이 명령은 다음 작업을 한 번 실행합니다.

- Hacker News 피드 수집
- GitHub Releases 수집
- OSV / GitHub Advisories / NVD / CISA KEV 보안 데이터 수집
- FeedItem / SecurityIncident 저장
- 중복 데이터 upsert

## Seed 정책

`prisma:seed`는 더 이상 가짜 피드나 가짜 보안 이슈를 만들지 않습니다.

현재 seed가 하는 일:

- 실제 adapter가 있는 source 설정 생성/갱신
- 과거 `demo-*`, `example.com`, mock payload 기반 legacy 데이터 삭제
- 미구현 source 설정 정리

즉 초기 화면이 비어 보이면 정상입니다. 데이터를 채우려면 `corepack pnpm worker:once`를 실행하거나 worker를 계속 켜두면 됩니다.

## 환경 변수

설정 예시는 [`.env.example`](/Users/onigiriman/workspace/devradar/.env.example)에 있고, 실제 실행은 루트 [`.env.local`](/Users/onigiriman/workspace/devradar/.env.local) 하나만 사용합니다.

주요 값:

- `DATABASE_URL`
- `REDIS_URL`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_SECRET`
- `INTERNAL_API_SECRET`
- `APP_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `OPENAI_API_KEY`
- `CRON_ENABLED`

## 주요 API

```text
GET    /api/v1/feed
GET    /api/v1/feed/:id
GET    /api/v1/security/incidents
GET    /api/v1/security/incidents/:id
GET    /api/v1/watchlist
POST   /api/v1/watchlist
PATCH  /api/v1/watchlist/:id
DELETE /api/v1/watchlist/:id
GET    /api/v1/alerts
PATCH  /api/v1/alerts/:id/read
PATCH  /api/v1/alerts/:id/archive
GET    /api/v1/settings
GET    /health
```

## 개발 메모

- API 실패 시 web은 더미 데이터를 보여주지 않고 빈 배열로 처리합니다.
- Watchlist가 비어 있으면 alert도 생성되지 않습니다.
- CISA KEV는 특정 패키지 생태계보다 제품명 중심 데이터라 `ecosystem: unknown`으로 들어올 수 있습니다.
- NVD는 정확한 package/version range 매핑이 약할 수 있어, MVP에서는 참고 incident 성격으로 저장합니다.
- OSV와 GitHub Advisories가 watchlist 기반 영향 판별에 가장 적합합니다.

## 테스트

```bash
corepack pnpm test
```

현재 코어 도메인 로직 테스트 범위:

- 버전 영향 매칭
- dedupe key 생성
- 보안 alias 병합
- 피드/보안 우선순위 계산
- 알림 규칙 엔진

## 검증

전체 빌드:

```bash
corepack pnpm build
```

웹 캐시가 꼬였을 때:

```bash
corepack pnpm dev:web:clean
```
