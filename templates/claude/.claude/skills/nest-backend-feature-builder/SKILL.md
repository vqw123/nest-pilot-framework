---
name: nest-backend-feature-builder
description: Build backend features in this NestJS monorepo while respecting app boundaries, shared module rules, testability, and local developer usability.
---

# Procedure

1. Inspect the target app and related shared libs.
2. Decide whether the change belongs in the app or a shared lib.
3. Keep controllers thin and business logic in services/use-cases.
4. Reuse existing module, config, logger, error, and health patterns.
5. Check config, local runtime, and test impact.
6. Explain how to run and test the change locally.

# Avoid

- fat controllers
- app-specific logic in shared libs
- hardcoded config
- changes that ignore readiness or shutdown
