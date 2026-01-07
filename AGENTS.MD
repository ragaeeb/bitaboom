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
- `src/preformat.ts` is the public preformatting entry point.
- When you add or rename functions, update the tables in `README.md` so users can discover them easily.
- Tests sit alongside the modules in `src/*.test.ts` and use Bun's test runner. New functionality should come with matching tests.

## Style & quality
- Follow existing TypeScript/ESM style (JSDoc on public helpers, `single` quotes, 4-space indentation). `biome` enforces the formatting rules.
- Prefer descriptive test names using `describe`/`it`.
- Avoid introducing dependencies that require network access during CI unless absolutely necessary.

## Performance & profiling
- Perf microbenchmarks live in `src/preformat.perf.test.ts` (runs under `bun test`).
- Heavy memory stress tests are opt-in (skipped by default):
  - `BITABOOM_HEAVY_TESTS=1 bun test`
  - Optional size override: `BITABOOM_HEAVY_MB=120`
- For internal experiments you can force the preformat builder without changing public API:
  - `BITABOOM_PREFORMAT_BUILDER=concat`
  - `BITABOOM_PREFORMAT_BUILDER=buffer`

## Documentation
- Significant behaviour changes must be reflected in `README.md`.
- Mention noteworthy build/test changes in pull request descriptions.

Thanks for keeping the library tidy!
