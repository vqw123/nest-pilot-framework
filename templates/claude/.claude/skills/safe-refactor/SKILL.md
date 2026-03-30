---
name: safe-refactor
description: 모듈 구조 변경, shared lib 정리, 테스트 가능성 개선, 유지보수성 향상을 위한 안전한 리팩토링에 사용하는 skill이다.
---

# 목적

이 skill은 아래 상황에 사용합니다.

- 모듈 재구성
- shared lib 정리
- 서비스 경계 정리
- 테스트 가능성 개선
- 유지보수성 향상

# 절차

1. 현재 동작 확인

- 현재 모듈 구조 확인
- 공개 인터페이스 확인
- 영향받는 앱과 shared lib 확인
- 현재 config/runtime 가정 확인

2. 리팩토링 목표 정의
   아래 중 무엇인지 구분합니다.

- 네이밍 정리
- 모듈 분리
- shared lib 추출
- service/controller 경계 정리
- repository 추상화 개선
- 테스트성 개선
- 운영 단순화

3. 동작 보존 우선

- 의도치 않은 breaking change 방지
- 의도적 breaking change는 명확히 설명
- 가능하면 점진적 리팩토링 우선

4. 영향도 검토
   아래 영향 확인

- app module
- shared lib
- configuration
- 로컬 실행
- Docker/Compose 기대사항
- startup flow
- readiness/liveness
- graceful shutdown
- logging/error behavior
- tests

5. 안전장치 추가

- 가능하면 테스트 먼저 추가
- 바뀐 동작 주변 테스트 갱신
- 위험한 구조 변경은 rollback 관점도 설명

6. 왜 나아졌는지 설명
   아래 관점으로 설명합니다.

- NestJS 철학
- 서비스 경계 명확성
- SOLID 원칙
- TDD 친화성
- 운영 단순성
- 로컬 개발 편의성

# 결과 설명에 포함할 것

- 현재 문제
- 영향 범위
- 제안 구조
- 동작 보존 방법
- config/runtime 영향
- 로컬 실행 영향
- 테스트 영향
- 위험 요소

# 피해야 할 것

- 조용한 breaking change
- 영향도 분석 없는 대규모 재작성
- app 전용 로직의 무리한 shared lib 이동
- 디버깅과 로컬 실행을 더 어렵게 만드는 리팩토링
