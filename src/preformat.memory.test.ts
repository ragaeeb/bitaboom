import { describe, expect, it } from 'bun:test';

import { preformatArabicTextBuffer, preformatArabicTextConcat } from './preformat-core';
import { preformatArabicText } from './preformat';

/**
 * Build a large synthetic Arabic-ish input string for stress testing.
 *
 * @param targetCodeUnits Target string length in UTF-16 code units
 * @returns Generated string
 */
const buildLargeArabicInput = (targetCodeUnits: number): string => {
    const chunk =
        'بِسْمِ  اللَّهِ ( الرَّحْمَنِ ) 127 / 11 قَالَ ... وَإِيَّاكَ  نَسْتَعِينُ ؟ ؛ , ((text))  —  ___  **  \n';
    const repeats = Math.ceil(targetCodeUnits / chunk.length);
    return chunk.repeat(repeats).slice(0, targetCodeUnits);
};

/**
 * Snapshot process memory stats when available.
 *
 * @returns Memory snapshot or null if unavailable in the current runtime
 */
const getMemorySnapshot = () => {
    if (typeof process?.memoryUsage !== 'function') {
        return null;
    }
    const m = process.memoryUsage();
    return {
        rss: m.rss,
        heapUsed: m.heapUsed,
        heapTotal: m.heapTotal,
    };
};

describe('preformatArabicText memory characteristics', () => {
    it('buffer and concat builders should match for a moderately large input', () => {
        const input = buildLargeArabicInput(1_000_000); // ~2MB UTF-16
        const a = preformatArabicTextConcat(input);
        const b = preformatArabicTextBuffer(input);
        expect(b).toEqual(a);
    });

    const itHeavy = process.env.BITABOOM_HEAVY_TESTS === '1' ? it : it.skip;

    itHeavy('should process a 100MB+ input and report memory (heavy)', () => {
        // 120MB in UTF-16 code units (~2 bytes/code unit) as a realistic stress target.
        const targetMb = Number(process.env.BITABOOM_HEAVY_MB ?? '120');
        const targetCodeUnits = Math.floor((targetMb * 1024 * 1024) / 2);

        const input = buildLargeArabicInput(targetCodeUnits);

        const before = getMemorySnapshot();

        const outDefault = preformatArabicText(input);
        expect(outDefault.length).toBeGreaterThan(0);

        const outConcat = preformatArabicTextConcat(input);
        const outBuffer = preformatArabicTextBuffer(input);

        expect(outDefault).toEqual(outConcat);
        expect(outDefault).toEqual(outBuffer);

        const after = getMemorySnapshot();

        // This is intentionally informational (no hard assertions due to environment variance).
        console.log('\n🧠 MEMORY PROFILE (heavy):');
        console.log(`   Input code units: ${input.length.toLocaleString()}`);
        console.log(`   Output code units: ${outDefault.length.toLocaleString()}`);
        if (before && after) {
            console.log(`   RSS before: ${(before.rss / 1024 / 1024).toFixed(1)} MB`);
            console.log(`   RSS after:  ${(after.rss / 1024 / 1024).toFixed(1)} MB`);
            console.log(`   Heap before: ${(before.heapUsed / 1024 / 1024).toFixed(1)} MB`);
            console.log(`   Heap after:  ${(after.heapUsed / 1024 / 1024).toFixed(1)} MB`);
        } else {
            console.log('   process.memoryUsage() unavailable in this runtime.');
        }
    });
});


