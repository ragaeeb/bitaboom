# Bitaboom Demo

A minimalist Svelte + Vite showcase for the Bitaboom string utilities library. Use the left sidebar to explore every exported helper, paste sample text, and apply formatting instantly.

**Live demo:** https://bitaboom.surge.sh

## What this demo covers

- Arabic-aware formatting helpers for publishing workflows
- Sanitization utilities for removing markdown, URLs, digits, and noise
- Parsing and transliteration helpers
- The high-performance `preformatArabicText` pipeline

## Local development

```bash
bun install
bun run dev
```

## Build & checks

```bash
bun run build
bun run check
```

## Deployment

The demo is deployed with [Surge](https://surge.sh). The production domain is tracked in `public/CNAME` so static hosts can pick up the custom domain.

```bash
bun run build
surge ./dist bitaboom.surge.sh
```
