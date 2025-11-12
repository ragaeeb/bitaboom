# Agent guidelines

## Tooling
- Use **Bun** for everything:
  - Build: `bun run build` (runs `scripts/tsdown.ts`, which bundles with `bun build` and then emits declarations via `tsc`).
  - Test: `bun test`.
  - Lint: `bun run lint` or `bun run lint:ci`.
  - Format: `bun run format`.
- The repo no longer uses `tsup`. Do not re-introduce it—extend `scripts/tsdown.ts` if the build pipeline needs changes.
- Keep the `dist/` directory out of version control; regenerate it on demand.

## Source layout
- All runtime code lives in `src/` and is exported through `src/index.ts`.
- When you add or rename functions, update the tables in `README.md` so users can discover them easily.
- Tests sit alongside the modules in `src/*.test.ts` and use Bun's test runner. New functionality should come with matching tests.

## Style & quality
- Follow existing TypeScript/ESM style (JSDoc on public helpers, `single` quotes, 4-space indentation). `biome` enforces the formatting rules.
- Prefer descriptive test names using `describe`/`it`.
- Avoid introducing dependencies that require network access during CI unless absolutely necessary.

## Documentation
- Significant behaviour changes must be reflected in `README.md`.
- Mention noteworthy build/test changes in pull request descriptions.

Thanks for keeping the library tidy!
