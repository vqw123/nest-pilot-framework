---
name: local-runtime-and-compose
description: Document local backend execution, infrastructure setup, Docker Compose usage, and onboarding flow.
---

# Procedure

1. Identify the target app and required dependencies.
2. Run the app directly on the host where practical.
3. Use Docker / Docker Compose for infrastructure dependencies.
4. Document host, port, credentials, and related config files.
5. Provide exact local startup commands.
6. Keep the setup simple and reproducible.

# Avoid

- undocumented ports
- hidden credentials
- unnecessary complexity
- forcing all services to run for simple testing
