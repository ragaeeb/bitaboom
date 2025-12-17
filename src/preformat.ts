/**
 * Hyperoptimized Arabic text preformatting entry point.
 *
 * The implementation lives in `src/preformat-core.ts` to keep the public surface
 * area small while allowing internal benchmarking (buffer vs concat builders).
 *
 * @module preformat
 */

import { preformatArabicTextBuffer, preformatArabicTextConcat } from './preformat-core';

/**
 * Preformat a single string.
 *
 * This is the internal implementation used by the public {@link preformatArabicText} API.
 * The builder can be forced for experiments via `BITABOOM_PREFORMAT_BUILDER`.
 *
 * @param text Input string
 * @returns Preformatted string
 */
const preformatOne = (text: string): string => {
    // Allow forcing a builder for benchmarks/debugging without changing public API.
    const forced = process.env.BITABOOM_PREFORMAT_BUILDER;
    if (forced === 'concat') {
        return preformatArabicTextConcat(text);
    }
    if (forced === 'buffer') {
        return preformatArabicTextBuffer(text);
    }

    // Default: the concat builder is typically faster in Bun/V8 for common page-sized inputs.
    // For experiments on extremely large inputs, force `BITABOOM_PREFORMAT_BUILDER=buffer`.
    return preformatArabicTextConcat(text);
};

// ==============================================================================
// PUBLIC API
// ==============================================================================

type PreformatArabicText = {
    (text: string): string;
    (texts: string[]): string[];
};

/**
 * High-performance Arabic preformatting pipeline.
 *
 * Consolidates common formatting steps (spacing, punctuation normalization, reference formatting,
 * bracket/quote cleanup, ellipsis condensation, newline normalization) into a single-pass formatter.
 *
 * @param text Input string or an array of strings
 * @returns Preformatted string or array of strings (matching input shape)
 */
export const preformatArabicText: PreformatArabicText = (text: string | string[]): string | string[] => {
    if (Array.isArray(text)) {
        return text.map(preformatOne);
    }
    return preformatOne(text);
};
