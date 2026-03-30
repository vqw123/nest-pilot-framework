# CLAUDE.md

## Project Identity

This repository is a NestJS monorepo starter framework.

- `apps/*`: independently runnable service apps
- `libs/*`: reusable shared modules

Always inspect the current repository structure before proposing changes.

## Core Rules

- Respect NestJS conventions: modules, providers, dependency injection, and clear boundaries.
- Keep controllers thin.
- Put business logic in services or use-case layers.
- Keep app-specific logic inside `apps/*`.
- Put only true shared concerns in `libs/*`.
- Do not hardcode secrets or environment-specific values.
- Preserve readiness, liveness, and graceful shutdown behavior.
- Use `.docker` for local infrastructure dependencies.
- When behavior changes, add or update tests.

## Avoid

- fat controllers
- app-specific logic in shared libs
- fragile startup assumptions
- tightly coupled business logic and infrastructure
- changes that make local development harder
