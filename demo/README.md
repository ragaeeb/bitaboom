# Bitaboom Demo

A compact Svelte + Vite playground for Arabic and English text utilities. Search by function name or purpose, filter by category, and compare editable input with live output.

**Live demo:** https://bitaboom.surge.sh

## Explore the library

- Every showcased helper starts with a focused example that demonstrates its behavior.
- Load an Arabic manuscript or bilingual article to try realistic mock text. Detectors include contrasting inputs; page ranges include an error example.
- Inspect returned strings, numbers, booleans, arrays and regular expressions without losing your input.
- Toggle visible whitespace to inspect spaces, tabs and newlines. Copy output or reuse the generated code example.
- The demo imports this checkout's library source directly, so examples and version information stay in sync with local changes. No published package or library build is required.

## Local development

From the repository root:

```bash
cd demo
bun install --frozen-lockfile
bun run dev
```

## Build & checks

From `demo/`:

```bash
bun run build
bun run check
bun test src/catalog.test.ts
```

Svelte's tooling currently needs the TypeScript 6 JavaScript API alongside the TypeScript 7 native compiler. The `@typescript/native` alias keeps TypeScript 7 available for `svelte-check --tsgo`; TypeScript 6 checks the Vite configuration. Vite fixes the server-only preformat builder switch to its default for browser builds.

## Deployment

The demo uses [Surge](https://surge.sh). The production domain is tracked in `public/CNAME`.

```bash
bun run build
surge ./dist bitaboom.surge.sh
```
