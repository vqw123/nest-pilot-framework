---
name: nest-backend-feature-builder
description: 이 NestJS monorepo에서 NestJS 철학, MSA 경계, SOLID 원칙, TDD 친화 구조, Kubernetes 기반 실행 환경, 로컬 개발 편의성을 고려해 백엔드 기능을 구현한다.
---

# 목적

이 skill은 새로운 백엔드 기능을 추가하거나 수정할 때 사용합니다.

# 절차

1. 현재 구조를 먼저 확인

- 대상 앱의 `apps/{appName}` 구조 확인
- 관련 `libs/*` 구조 확인
- module import, provider 등록, config 사용, logger/error/health/auth 패턴 확인

2. 변경 경계를 정의
   아래 중 어디에 속하는지 판단합니다.

- controller
- service/use-case
- repository/persistence
- infrastructure adapter
- shared lib
- app 전용 module

공통 관심사가 아니라면 앱 내부 구현을 우선합니다.

3. 계층 분리 유지

- controller는 얇게 유지
- 비즈니스 로직은 service/use-case에 둠
- persistence와 외부 연동은 분리
- 전송/비즈니스/인프라 책임을 섞지 않음

4. 기존 관례 재사용

- 기존 config 패턴 재사용
- logger/error/health 관례 재사용
- module/provider 구조 재사용
- 강한 이유 없이 경쟁 구조를 새로 만들지 않음

5. 런타임과 운영 영향 고려
   아래 영향이 있는지 확인합니다.

- startup
- readiness/liveness
- graceful shutdown
- logging/traceability
- config 요구사항
- 로컬 실행 방식

6. 로컬 개발 고려

- 로컬에서 어떻게 실행할지 설명
- 필요한 인프라 의존성이 있으면 Docker / Docker Compose 사용법 설명
- 과도한 수동 설치를 요구하지 않음

7. 테스트 고려

- unit test 추가 또는 제안
- 필요 시 integration/e2e test 고려
- 테스트 가능한 구조를 우선

8. 결과 설명 포함
   아래를 포함합니다.

- 영향받는 파일/모듈
- 설계 이유
- config 변경점
- 로컬 실행 가이드
- 필요 시 Docker 가이드
- 추가/수정 테스트
- 운영 관점 주의사항

# 피해야 할 것

- fat controller
- app 전용 도메인 로직의 shared lib 이동
- 환경값 하드코딩
- ORM 세부사항이 전체 구조로 퍼지는 것
- readiness/shutdown 무시
- 로컬 실행이 어려운 해결책
