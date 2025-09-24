# Codex Decision Log

Record irreversible or significant decisions here so future contributors understand the rationale.

## Template
- **Date**: YYYY-MM-DD
- **Decision**: One sentence summary.
- **Context**: Why the decision was made.
- **Implications**: Expected impact.
- **Revisit By**: Optional date to reconsider.

## Decisions
<!-- Add new decisions below this line, newest first -->
- **Date**: 2024-03-17
- **Decision**: Adopt pnpm as the workspace package manager.
- **Context**: Need a fast, deterministic package manager with strong monorepo support.
- **Implications**: Use `pnpm-workspace.yaml`; developers require pnpm (>=8). Lockfile will be `pnpm-lock.yaml`.
- **Revisit By**: 2024-06-01 (post-M1 assessment).
