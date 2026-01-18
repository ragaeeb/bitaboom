# Bitaboom

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650)
![GitHub](https://img.shields.io/github/license/ragaeeb/bitaboom)
![npm](https://img.shields.io/npm/v/bitaboom)
![npm](https://img.shields.io/npm/dm/bitaboom)
![GitHub issues](https://img.shields.io/github/issues/ragaeeb/bitaboom)
![GitHub stars](https://img.shields.io/github/stars/ragaeeb/bitaboom?style=social)
![GitHub Release](https://img.shields.io/github/v/release/ragaeeb/bitaboom)
[![codecov](https://codecov.io/gh/ragaeeb/bitaboom/graph/badge.svg?token=7Z3E38HXCD)](https://codecov.io/gh/ragaeeb/bitaboom)
![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)

Bitaboom is a TypeScript-first string utility toolkit focused on Arabic and bilingual (Arabic ↔ English) publishing workflows. It ships a wide surface of helpers for:

- Arabic script awareness (diacritics, tatweel, Urdu glyphs, punctuation harmonisation)
- Formatting and typography clean-up for scanned/OCRd manuscripts
- Sanitisation pipelines for removing noise such as references, page numbers, markdown artefacts, or escaped spaces
- Parsing helpers (balanced punctuation, JSON normalisation, page range parsing)
- Transliteration cleanup and salutation normalisation for classical Islamic texts

The project targets ESNext and is built/tested with Bun. All exports are tree-shakeable and documented with JSDoc.

## Quick start

```bash
npm install bitaboom
# or
yarn add bitaboom
# or
pnpm add bitaboom
# or
bun add bitaboom
```

```typescript
import { makeDiacriticInsensitiveRegex, removeMarkdownFormatting } from 'bitaboom';

const rx = makeDiacriticInsensitiveRegex('أنا إلى الآفاق');
rx.test('انا الي الافاق'); // true

const plain = removeMarkdownFormatting('**Bold** _italic_ [link](https://example.com)');
console.log(plain); // "Bold italic link"
```

## Demo

Try the interactive demo at https://bitaboom.surge.sh to explore every exported helper with real-time formatting.

### High-performance Arabic preformatting

If you need to normalize messy Arabic/OCR text at scale (spacing, punctuation, brackets, ellipses, references), use the single-pass preformatter:

```typescript
import { preformatArabicText } from 'bitaboom';

preformatArabicText('بِسْمِ  اللَّهِ ( الرَّحْمَنِ ) 127 / 11 قَالَ ...');
preformatArabicText(['صفحة 1 ...', 'صفحة 2 ...']); // batch mode
```

## Feature highlights

- **Arabic-first matching** – build diacritic-insensitive regular expressions, collapse tatweel, score Arabic content density, and replace Urdu glyphs.
- **Rich typography normalisers** – more than 30 helpers to fix punctuation spacing, quotes, brackets, ellipses, smart quotes, uppercase detection, and whitespace quirks.
- **Single-pass Arabic preformatter** – `preformatArabicText` consolidates the common formatting pipeline and is optimized for large datasets.
- **Sanitisation pipelines** – strip references, URLs, part markers, markdown decorations, escaped spaces, or numbers in bilingual text.
- **Parsing helpers** – validate JSON-ish blobs, split search queries by quotes, balance parentheses/quotes, and expand page range strings.
- **Transliteration polish** – normalise common Arabic prefixes (`al-`, `wa-`, `bi-`), dedupe apostrophes, replace salutations with ﷺ, and extract initials from transliterated names.
- **Bun-native toolchain** – tests run through `bun test` and builds use an in-repo `tsdown` pipeline powered by `bun build` + `tsc` for declarations.

## API overview

All modules are exported from `src/index.ts`. Functions are grouped below by feature area.

### Arabic helpers (`src/arabic.ts`)

| Function | Description |
| --- | --- |
| `arabicNumeralToNumber` | Convert Arabic-Indic numerals (٠-٩) embedded in a string into a JavaScript number. |
| `cleanExtremeArabicUnderscores` | Remove decorative tatweel/underscores at line edges without touching Hijri date suffixes. |
| `convertUrduSymbolsToArabic` | Map Urdu variants such as ھ → ه and ی → ي. |
| `getArabicScore` | Return the ratio of Arabic letters to total non-space, non-digit characters (0 → 1). |
| `fixTrailingWow` | Collapse stray "و" separators in greetings (e.g. `عليكم و رحمة` → `عليكم ورحمة`). |
| `addSpaceBetweenArabicTextAndNumbers` | Insert a space between Arabic text segments and following numbers. |
| `removeNonIndexSignatures` | Drop single-digit indices and dangling dashes surrounded by Arabic text. |
| `removeSingularCodes` | Strip single Arabic letters or digits enclosed in (), [], or «». |
| `removeSolitaryArabicLetters` | Remove isolated Arabic letters (excluding Hijri "ه"). |
| `replaceEnglishPunctuationWithArabic` | Replace ASCII `?` and `;` with Arabic equivalents (`؟`, `؛`) and normalise commas. |
| `countWords` | Count words in text by splitting on whitespace. Works for both Arabic and English. |
| `estimateTokenCount` | LLM-aware token estimation supporting multiple providers (OpenAI, Gemini, Claude, Grok). Uses fertility rates based on BPE tokenization research. |
| `findLastPunctuation` | Find the index of the last punctuation character in a string. |

### Cleaning & tolerant matching (`src/cleaning.ts`, `src/sanitization.ts`)

| Function | Description |
| --- | --- |
| `escapeRegex` | Safely escape special characters for inclusion in regular expression sources. |
| `makeDiacriticInsensitiveRegex` | Build a `RegExp` tolerant of Arabic diacritics, tatweel, whitespace variants, and letter equivalences. |
| `makeDiacriticInsensitive` | Produce a pattern string (no delimiters) for diacritic-insensitive matching of Arabic text. |
| `cleanSymbolsAndPartReferences` | Remove bracketed part markers, Arabic ornaments, and numeric references. |
| `cleanTrailingPageNumbers` | Drop `-[123]-` page markers. |
| `replaceLineBreaksWithSpaces` | Collapse whitespace and newline runs to single spaces. |
| `stripAllDigits` | Remove ASCII digits. |
| `removeDeathYear` | Strip `(d. ####H)`/`[d. ####h]` style death-year mentions. |
| `removeNumbersAndDashes` | Remove digits and dash characters everywhere. |
| `removeSingleDigitReferences` | Delete single digit markers like `(1)`, `[2]`, `«3»`. |
| `removeUrls` | Remove `http(s)` URLs. |
| `removeMarkdownFormatting` | Drop markdown bold/italic/link/list/header/backtick syntax. |
| `truncate` | Trim strings to a maximum length with ellipsis (`…`). |
| `truncateMiddle` | Preserve start/end segments while truncating the middle with ellipsis. |
| `unescapeSpaces` | Convert escaped spaces (`\ `) back to regular spaces and trim ends. |

### Formatting & typography (`src/formatting.ts`)

| Function | Description |
| --- | --- |
| `insertLineBreaksAfterPunctuation` | Add line breaks after `.`, `!`, `?`, and `؟`. |
| `addSpaceBeforeAndAfterPunctuation` | Normalise spacing around punctuation while respecting quotes and ayah markers. |
| `applySmartQuotes` | Convert straight quotes to smart quotes and fix opening quotes. |
| `cleanLiteralNewLines` | Replace literal `\n`/`\r` sequences with actual newlines. |
| `cleanMultilines` | Trim trailing spaces per line. |
| `hasWordInSingleLine` | Detect whether a line contains a single standalone word. |
| `isOnlyPunctuation` | Check whether a string consists solely of punctuation/digits. |
| `cleanSpacesBeforePeriod` | Remove stray spaces before punctuation marks. |
| `condenseAsterisks` | Collapse multiple `*` into a single asterisk. |
| `condenseColons` | Normalise colon clusters like `.:.` → `:`. |
| `condenseDashes` | Reduce consecutive dashes to a single dash. |
| `condenseEllipsis` | Convert runs of periods to a single ellipsis character. |
| `reduceMultilineBreaksToDouble` | Limit blank lines to at most two consecutive newlines. |
| `reduceMultilineBreaksToSingle` | Collapse multiple blank lines to a single newline. |
| `condensePeriods` | Normalise spaced dot sequences (`. . .`). |
| `condenseUnderscores` | Collapse repeated underscores and tatweel runs. |
| `doubleToSingleBrackets` | Replace doubled parentheses/brackets with single ones. |
| `ensureSpaceBeforeBrackets` | Guarantee a single space before bracketed notes. |
| `ensureSpaceBeforeQuotes` | Ensure spacing before Arabic guillemets « ». |
| `fixBracketTypos` | Repair mismatched bracket pairs (e.g. `(«` or `)3)`). |
| `fixCurlyBraces` | Normalise `{}` curly brace mismatches. |
| `fixMismatchedQuotationMarks` | Fix malformed Arabic guillemets and parentheses combos. |
| `formatStringBySentence` | Reflow paragraphs while keeping numbered footnotes on separate lines. |
| `isAllUppercase` | Detect text containing only uppercase letters (ignoring non-letters). |
| `normalizeSlashInReferences` | Convert spaced fractions `127 / 11` → `127/11`. |
| `normalizeSpaces` | Collapse spaces/tabs to single spaces. |
| `removeRedundantPunctuation` | Remove redundant punctuation following Arabic `؟`/`!`. |
| `removeSpaceInsideBrackets` | Trim internal spaces inside brackets/parentheses. |
| `replaceDoubleBracketsWithArrows` | Turn `((text))` into `«text»`. |
| `stripBoldStyling` | Remove bold stylisation by decomposing Unicode. |
| `stripItalicsStyling` | Replace italic Unicode letters with plain equivalents. |
| `stripStyling` | Convenience combo of bold + italics stripping. |
| `toTitleCase` | Convert strings to title case, respecting Unicode letters. |
| `trimSpaceInsideQuotes` | Remove spaces immediately inside quotes/guillemets. |

### Parsing helpers (`src/parsing.ts`)

| Function | Description |
| --- | --- |
| `normalizeJsonSyntax` | Convert pseudo-JSON with numeric keys/single quotes into valid JSON. |
| `isJsonStructureValid` | Detect JSON-like key/value blobs that can be normalised. |
| `splitByQuotes` | Split by spaces while keeping quoted substrings intact. |
| `isBalanced` | Ensure quotes and brackets are balanced and properly nested. |
| `parsePageRanges` | Expand mixed range/list strings (e.g., `1-3,5,7-9`) into numeric arrays. |

### Transliteration (`src/transliteration.ts`)

| Function | Description |
| --- | --- |
| `normalizeArabicPrefixesToAl` | Normalise Arabic definite article prefixes to `al-`. |
| `normalizeDoubleApostrophes` | Collapse duplicated Arabic apostrophes (`ʿʿ`, `ʾʾ`). |
| `replaceSalutationsWithSymbol` | Replace salutations like "sallallahu alayhi wasallam" with ﷺ. |
| `normalize` | Strip diacritics, apostrophes, and dashes from transliterated text. |
| `removeArabicPrefixes` | Remove prefixes such as `al-`, `wa-`, `bi-`, `fī`, `li-`. |
| `normalizeTransliteratedEnglish` | Combine prefix removal + diacritic stripping. |
| `extractInitials` | Extract the first letters from up to two words (after normalisation). |

### Preformatting pipeline (`src/preformat.ts`)

| Function | Description |
| --- | --- |
| `preformatArabicText` | High-performance Arabic preformatting pipeline (single-pass, optimized for large datasets). Accepts a single string or an array of strings. |

## Token Estimation

For LLM-based workflows, `estimateTokenCount` provides Arabic-aware token estimation with **LLM-specific configurations**.

### Usage

```typescript
import { estimateTokenCount, LLMProvider } from 'bitaboom';

// Default (Generic) estimation
estimateTokenCount('بسم الله الرحمن الرحيم');

// Provider-specific estimation
estimateTokenCount('بسم الله الرحمن الرحيم', LLMProvider.OpenAI);
estimateTokenCount('بسم الله الرحمن الرحيم', LLMProvider.Gemini);
estimateTokenCount('بسم الله الرحمن الرحيم', LLMProvider.Claude);
estimateTokenCount('بسم الله الرحمن الرحيm', LLMProvider.Grok);
```

### Research Findings

Modern LLMs use **Byte Pair Encoding (BPE)** tokenization, which behaves differently for Arabic vs English:

| Aspect | English | Arabic | Impact |
|--------|---------|--------|--------|
| Characters per token | ~4 | ~1.3 (OpenAI) | Arabic uses 3x more tokens |
| UTF-8 bytes per char | 1 | 2 | Double byte overhead |
| Diacritics | N/A | Merged with base letters | NOT separate tokens |
| Morphology | Simple | Rich (prefixes/suffixes) | More subword splits |

**Provider Efficiency** (tokens for same Arabic content):
- **Gemini**: Most efficient (~25% fewer tokens than OpenAI)
- **OpenAI**: Standard BPE baseline
- **Grok**: Similar to OpenAI
- **Claude**: Least efficient for Arabic

### Algorithm

The estimation uses **fertility rates** (characters per token) rather than per-character weights:

```typescript
tokens = arabicChars / arabicCharsPerToken
       + latinChars / latinCharsPerToken
       + numerals / numeralGroupSize
       + diacriticOverhead (multiplicative)
       + latinDiacriticOverhead (for ā, ī, ū, etc.)
```

**Provider Configurations:**

| Provider | Latin chars/token | Arabic chars/token | Diacritic overhead |
|----------|-------------------|--------------------|--------------------|
| OpenAI   | 4.0 | 1.3 | +15% |
| Gemini   | 4.0 | 1.6 | +10% |
| Claude   | 3.5 | 1.1 | +20% |
| Grok     | 4.0 | 1.3 | +15% |
| Generic  | 4.0 | 1.5 | +15% |

### Character Type Handling

- **Arabic base characters**: Count towards Arabic fertility rate
- **Arabic diacritics (tashkeel)**: Merged by BPE, adds overhead percentage
- **Tatweel**: Often removed in preprocessing, minimal impact
- **Latin diacritics (ā, ī, ū, ḥ)**: Used in transliteration, has separate overhead
- **Numerals**: Grouped (1-3 digits often = 1 token)
- **Whitespace**: Typically absorbed into following token

## Build & development

| Task | Command |
| --- | --- |
| Build library | `bun run build` (invokes the in-repo `scripts/tsdown.ts` pipeline, which bundles via `bun build` then emits declarations through `tsc`). |
| Run tests | `bun test` |
| Lint | `bun run lint` |
| Format | `bun run format` |
| Continuous lint | `bun run lint:ci` |

The custom `tsdown` script ensures reproducible builds without relying on `tsup`. It cleans the `dist/` directory, bundles `src/index.ts` with Bun's bundler (minified ESM output + sourcemap), and finally emits `.d.ts` files using `tsc --emitDeclarationOnly`.

## Contributing

1. Fork the repository and clone it locally.
2. Install Bun (`curl -fsSL https://bun.sh/install | bash`).
3. Run tests with `bun test` and format with `bun run format` before opening a pull request.

Issues and PRs are welcome—please include tests whenever you add or change behaviour.

## License

MIT © Ragaeeb Haq
