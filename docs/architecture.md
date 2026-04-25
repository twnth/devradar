# DevRadar Architecture

## Overview

DevRadar는 세 개의 실행 단위와 네 개의 공용 패키지로 구성됩니다.

- `apps/web`: 개발자용 대시보드 UI
- `apps/api`: 피드, 보안, 워치리스트, 알림 API
- `apps/worker`: 수집, 정규화, 점수화, 영향 매칭, 알림 잡
- `packages/types`: 도메인 타입과 Zod 스키마
- `packages/utils`: dedupe, scoring, alert rules, version matching
- `packages/ui`: 웹에서 재사용하는 UI 조각
- `packages/config`: Tailwind/TS 공통 설정

## Domain split

피드와 보안 사고는 별도 도메인으로 유지합니다.

- Feed domain: 소스 수집, dedupe, 점수 계산, 피드 카드 표시
- Security domain: advisory 수집, alias 병합, 버전 영향 판별, 알림 생성

두 도메인은 `related feed/news items` 수준에서만 연결하고 저장 구조는 분리합니다.

## Data flow

1. 워커 어댑터가 외부 소스를 polling
2. 어댑터 출력은 공통 staging shape로 정규화
3. dedupe / alias merge / scoring 실행
4. Prisma를 통해 canonical records 저장
5. watchlist와 incident를 매칭해 `UserAlert` 생성
6. 웹 UI와 API가 canonical data를 조회

## Worker queues

- `feed-ingest`
- `feed-normalize`
- `feed-score`
- `security-ingest`
- `security-normalize`
- `security-merge`
- `security-match`
- `security-notify`

각 큐는 BullMQ job key를 사용해 storm를 방지합니다.

## Security model

- public API rate limit 적용
- internal ingest routes는 `INTERNAL_API_SECRET` 검증
- 저장 전 URL sanitize
- 입력 payload는 Zod로 검증

## Web UI

Figma 기반 다크 모드 중심 레이아웃입니다.

- 좌측 고정 사이드바
- 상단 검색/알림 바
- 중앙 메인 피드/사고 리스트
- 우측 데스크톱 전용 요약 패널

뉴스와 긴급 보안은 색상, 카드 톤, 배지 체계로 분리합니다.
