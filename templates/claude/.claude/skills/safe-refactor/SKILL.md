---
name: safe-refactor
description: Refactor safely with impact analysis, behavior preservation, and test awareness.
---

# Procedure

1. Inspect current structure and behavior.
2. Define the refactor goal clearly.
3. Preserve behavior unless a breaking change is intentional.
4. Check impact on config, runtime, startup, health, and tests.
5. Prefer incremental refactoring.
6. Explain why the result is better.

# Avoid

- silent breaking changes
- large rewrites without impact analysis
- moving app-specific logic into shared libs without a clear reason
- refactors that make local execution harder
