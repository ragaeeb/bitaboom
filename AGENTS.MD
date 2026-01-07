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
- **Arrow Functions**: Use arrow functions (`const x = () => ...`) for top-level logic and one-liners. Classical `function` style is acceptable inside classes for methods.
- **Inferred Types**: Favor inferred return types for internal functions/methods to reduce boilerplate, provided clarity isn't sacrificed.
- Use the `describe`/`it` pattern for tests. Maintain the `it('should [action] [context]')` convention for test descriptions (e.g., `it('should preserve spaces between Arabic letters')`).
- Avoid introducing dependencies that require network access during CI unless absolutely necessary.

## Preformatting Architecture (`src/preformat.ts`)
- **Single-Pass Logic**: The core formatter (`Preformatter` class) uses a single-pass loop. Avoid multi-pass regex or split/join operations which balloon memory usage.
- **Output Abstraction**: Logic is decoupled from storage via the `PreformatWriter` interface.
  - `StringWriter`: Uses standard `+=` string concatenation. This is usually faster in Bun/V8 for typical web-sized inputs.
  - `BufferWriter`: Wraps `Utf16Builder` (backed by `Uint16Array`). This path avoids GC pressure and is forced for extremely large inputs (controlled by `BITABOOM_PREFORMAT_BUILDER=buffer`).
- **High-Performance Lookups**: `CHAR_MAP` (Uint8Array lookup table) stores bit flags (e.g., `F_SPACE`, `F_NO_SPACE_BEFORE`). Using flags is significantly faster than `string.includes` or regex inside the hot loop.
- **Redundancy Management**: Many punctuation rules are implicitly handled by setting flags (e.g., `setFlags('.!', F_NO_SPACE_BEFORE)`). If you find yourself adding explicit character-specific `if` checks in `handlePendingSpaces`, check if the flag mapping can handle it instead.
- **Ayah and Number References**: Watch out for special spacing rules for `Digit:Digit` and `Digit/Digit`. These must remain space-free for Quranic references and time formats.

## Performance & profiling
- Perf microbenchmarks live in `src/preformat.perf.test.ts` (runs under `bun test`).
- Heavy memory stress tests are opt-in (skipped by default):
  - `BITABOOM_HEAVY_TESTS=1 bun test`
  - Optional size override: `BITABOOM_HEAVY_MB=120`
- For internal experiments you can force the preformat builder without changing public API:
  - `BITABOOM_PREFORMAT_BUILDER=concat` (Default)
  - `BITABOOM_PREFORMAT_BUILDER=buffer`

## Documentation
- Significant behaviour changes must be reflected in `README.md`.
- Mention noteworthy build/test changes in pull request descriptions.

Thanks for keeping the library tidy!
