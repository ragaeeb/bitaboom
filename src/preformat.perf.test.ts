import { describe, expect, it } from 'bun:test';

import {
    addSpaceBeforeAndAfterPunctuation,
    addSpaceBetweenArabicTextAndNumbers,
    cleanLiteralNewLines,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    condenseAsterisks,
    condenseColons,
    condenseDashes,
    condenseEllipsis,
    condensePeriods,
    condenseUnderscores,
    ensureSpaceBeforeBrackets,
    ensureSpaceBeforeQuotes,
    fixTrailingWow,
    normalizeSlashInReferences,
    normalizeSpaces,
    reduceMultilineBreaksToSingle,
    removeRedundantPunctuation,
    removeSpaceInsideBrackets,
    replaceDoubleBracketsWithArrows,
    replaceEnglishPunctuationWithArabic,
    trimSpaceInsideQuotes,
} from './index';

import { preformatArabicText } from './preformat';
import { preformatArabicTextBuffer, preformatArabicTextConcat } from './preformat-core';

// ==============================================================================
// ARABIC TEXT GENERATOR
// ==============================================================================

/**
 * Common Arabic words with full diacritics for realistic text generation
 */
const ARABIC_WORDS_WITH_DIACRITICS = [
    'بِسْمِ',
    'اللَّهِ',
    'الرَّحْمَنِ',
    'الرَّحِيمِ',
    'الْحَمْدُ',
    'لِلَّهِ',
    'رَبِّ',
    'الْعَالَمِينَ',
    'مَالِكِ',
    'يَوْمِ',
    'الدِّينِ',
    'إِيَّاكَ',
    'نَعْبُدُ',
    'وَإِيَّاكَ',
    'نَسْتَعِينُ',
    'اهْدِنَا',
    'الصِّرَاطَ',
    'الْمُسْتَقِيمَ',
    'صِرَاطَ',
    'الَّذِينَ',
    'أَنْعَمْتَ',
    'عَلَيْهِمْ',
    'غَيْرِ',
    'الْمَغْضُوبِ',
    'وَلَا',
    'الضَّالِّينَ',
    'قَالَ',
    'رَسُولُ',
    'صَلَّى',
    'اللهُ',
    'عَلَيْهِ',
    'وَسَلَّمَ',
    'مَنْ',
    'كَانَ',
    'يُؤْمِنُ',
    'بِاللَّهِ',
    'وَالْيَوْمِ',
    'الْآخِرِ',
    'فَلْيَقُلْ',
    'خَيْرًا',
    'أَوْ',
    'لِيَصْمُتْ',
    'عَنْ',
    'أَبِي',
    'هُرَيْرَةَ',
    'رَضِيَ',
    'اللَّهُ',
    'عَنْهُ',
    'وَمِنَ',
    'النَّاسِ',
];

/**
 * Punctuation patterns commonly found in Arabic texts
 */
const PUNCTUATION_PATTERNS = [' .', ' ؟', ' ،', '  ؛', '...', ' :', '  !', '.', '،', '؛', '؟', ' ? ', ' ; ', ' , '];

/**
 * Bracket patterns commonly found in Arabic texts
 */
const BRACKET_PATTERNS = ['((', '))', '( )', '[ ]', '« »', '(«', '»)'];

/**
 * Generates a random integer between min (inclusive) and max (exclusive)
 *
 * @param min Inclusive lower bound
 * @param max Exclusive upper bound
 * @returns Random integer in [min, max)
 */
const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Generates a single Arabic paragraph with full diacritics
 * Includes various formatting issues that the pipeline should fix
 *
 * @param wordCount Approximate word count for the generated paragraph
 * @returns Generated paragraph
 */
const generateArabicParagraph = (wordCount: number = 50): string => {
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
        // Add a random Arabic word
        words.push(ARABIC_WORDS_WITH_DIACRITICS[randomInt(0, ARABIC_WORDS_WITH_DIACRITICS.length)]);

        // Randomly add formatting issues to simulate messy input
        if (Math.random() < 0.1) {
            // Add extra spaces
            words.push(' '.repeat(randomInt(2, 4)));
        }

        if (Math.random() < 0.05) {
            // Add punctuation with spacing issues
            words.push(PUNCTUATION_PATTERNS[randomInt(0, PUNCTUATION_PATTERNS.length)]);
        }

        if (Math.random() < 0.02) {
            // Add bracket patterns
            words.push(BRACKET_PATTERNS[randomInt(0, BRACKET_PATTERNS.length)]);
        }

        if (Math.random() < 0.03) {
            // Add numbers adjacent to text
            words.push(randomInt(1, 200).toString());
        }

        if (Math.random() < 0.02) {
            // Add " و " pattern
            words.push(' و ');
        }

        if (Math.random() < 0.01) {
            // Add reference pattern like 127 / 11
            words.push(`${randomInt(1, 200)} / ${randomInt(1, 50)}`);
        }
    }

    return words.join(' ').trim();
};

/**
 * Generates multiple pages of Arabic text
 * @param pageCount Number of pages to generate
 * @param wordsPerPage Average words per page
 * @returns Array of generated pages
 */
const generateArabicPages = (pageCount: number, wordsPerPage: number = 300): string[] => {
    const pages: string[] = [];
    for (let i = 0; i < pageCount; i++) {
        pages.push(generateArabicParagraph(wordsPerPage));
    }
    return pages;
};

// ==============================================================================
// ORIGINAL PIPELINE (FOR BASELINE)
// ==============================================================================

type TextTransformer = (text: string) => string;

const pastePipeline: TextTransformer[] = [
    cleanSpacesBeforePeriod,
    normalizeSlashInReferences,
    removeSpaceInsideBrackets,
    trimSpaceInsideQuotes,
    replaceEnglishPunctuationWithArabic,
    addSpaceBetweenArabicTextAndNumbers,
    ensureSpaceBeforeBrackets,
    ensureSpaceBeforeQuotes,
    fixTrailingWow,
    condenseColons,
    cleanLiteralNewLines,
    condenseUnderscores,
    condenseDashes,
    condenseAsterisks,
    replaceDoubleBracketsWithArrows,
    condensePeriods,
    condenseEllipsis,
    removeRedundantPunctuation,
    reduceMultilineBreaksToSingle,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    normalizeSlashInReferences,
    addSpaceBeforeAndAfterPunctuation,
    normalizeSpaces,
];

/**
 * Original pipeline implementation for baseline comparison
 *
 * @param text Input text
 * @returns Preformatted text using the original multi-pass pipeline
 */
const preformatArabicTextOriginal = (text: string): string => {
    let result = text;
    for (const func of pastePipeline) {
        result = func(result);
    }
    return result.trim();
};

// ==============================================================================
// PERFORMANCE TESTS
// ==============================================================================

describe('preformatArabicText Performance', () => {
    // Generate test data upfront
    const WORDS_PER_PAGE = 300;

    it('should establish baseline performance with original pipeline', () => {
        // Generate smaller sample for quick test
        const samplePages = generateArabicPages(1000, WORDS_PER_PAGE);

        const startTime = performance.now();

        for (const page of samplePages) {
            preformatArabicTextOriginal(page);
        }

        const endTime = performance.now();
        const durationMs = endTime - startTime;
        const pagesPerSecond = (1000 / durationMs) * 1000;

        console.log(`\n📊 BASELINE PERFORMANCE (1000 pages):`);
        console.log(`   Duration: ${durationMs.toFixed(2)}ms`);
        console.log(`   Pages/second: ${pagesPerSecond.toFixed(0)}`);
        console.log(`   Avg per page: ${(durationMs / 1000).toFixed(3)}ms`);

        // Store baseline for comparison
        expect(durationMs).toBeGreaterThan(0);
    });

    it('should measure optimized function performance', () => {
        const samplePages = generateArabicPages(1000, WORDS_PER_PAGE);

        const startTime = performance.now();

        for (const page of samplePages) {
            preformatArabicText(page);
        }

        const endTime = performance.now();
        const durationMs = endTime - startTime;
        const pagesPerSecond = (1000 / durationMs) * 1000;

        console.log(`\n⚡ OPTIMIZED PERFORMANCE (1000 pages):`);
        console.log(`   Duration: ${durationMs.toFixed(2)}ms`);
        console.log(`   Pages/second: ${pagesPerSecond.toFixed(0)}`);
        console.log(`   Avg per page: ${(durationMs / 1000).toFixed(3)}ms`);

        expect(durationMs).toBeGreaterThan(0);
    });

    it('should measure batch processing performance', () => {
        const samplePages = generateArabicPages(1000, WORDS_PER_PAGE);

        const startTime = performance.now();

        // Batch process all pages at once
        const results = preformatArabicText(samplePages);

        const endTime = performance.now();
        const durationMs = endTime - startTime;
        const pagesPerSecond = (1000 / durationMs) * 1000;

        console.log(`\n🚀 BATCH PERFORMANCE (1000 pages):`);
        console.log(`   Duration: ${durationMs.toFixed(2)}ms`);
        console.log(`   Pages/second: ${pagesPerSecond.toFixed(0)}`);
        console.log(`   Avg per page: ${(durationMs / 1000).toFixed(3)}ms`);

        expect(results.length).toBe(1000);
        expect(durationMs).toBeGreaterThan(0);
    });

    it('should benchmark concat vs buffer builders (internal)', () => {
        const samplePages = generateArabicPages(1000, WORDS_PER_PAGE);

        const concatStart = performance.now();
        for (const page of samplePages) {
            preformatArabicTextConcat(page);
        }
        const concatDuration = performance.now() - concatStart;

        const bufferStart = performance.now();
        for (const page of samplePages) {
            preformatArabicTextBuffer(page);
        }
        const bufferDuration = performance.now() - bufferStart;

        console.log(`\n🧪 BUILDER COMPARISON (1000 pages):`);
        console.log(`   Concat: ${concatDuration.toFixed(2)}ms`);
        console.log(`   Buffer: ${bufferDuration.toFixed(2)}ms`);

        // Correctness check on representative sample (avoid O(N) equality on full set).
        const testInput = samplePages[0] ?? '';
        expect(preformatArabicTextBuffer(testInput)).toEqual(preformatArabicTextConcat(testInput));
    });

    it('should compare baseline vs optimized directly', () => {
        const samplePages = generateArabicPages(1000, WORDS_PER_PAGE);

        // Baseline
        const baselineStart = performance.now();
        for (const page of samplePages) {
            preformatArabicTextOriginal(page);
        }
        const baselineDuration = performance.now() - baselineStart;

        // Optimized
        const optimizedStart = performance.now();
        for (const page of samplePages) {
            preformatArabicText(page);
        }
        const optimizedDuration = performance.now() - optimizedStart;

        // Batch
        const batchStart = performance.now();
        preformatArabicText(samplePages);
        const batchDuration = performance.now() - batchStart;

        const improvementVsBaseline = ((baselineDuration - optimizedDuration) / baselineDuration) * 100;
        const batchImprovementVsBaseline = ((baselineDuration - batchDuration) / baselineDuration) * 100;

        console.log(`\n📈 PERFORMANCE COMPARISON:`);
        console.log(`   Baseline:   ${baselineDuration.toFixed(2)}ms`);
        console.log(
            `   Optimized:  ${optimizedDuration.toFixed(2)}ms (${improvementVsBaseline.toFixed(1)}% improvement)`,
        );
        console.log(
            `   Batch:      ${batchDuration.toFixed(2)}ms (${batchImprovementVsBaseline.toFixed(1)}% improvement)`,
        );

        // Performance should be significantly better
        expect(improvementVsBaseline).toBeGreaterThan(70);
    });

    it('should verify output correctness for sample text', () => {
        const testInput = 'بِسْمِ  اللَّهِ ( الرَّحْمَنِ ) 127 / 11 قَالَ ...';

        const originalResult = preformatArabicTextOriginal(testInput);
        const optimizedResult = preformatArabicText(testInput);

        // Verify transformations were applied
        expect(originalResult).not.toContain('  '); // No double spaces
        expect(originalResult).toContain('127/11'); // Normalized reference
        expect(originalResult).toContain('…'); // Ellipsis condensed

        // Verify optimized matches original
        expect(optimizedResult).toEqual(originalResult);
    });

    it('should verify batch output matches individual processing', () => {
        const samplePages = generateArabicPages(100, WORDS_PER_PAGE);

        const individualResults = samplePages.map((page) => preformatArabicText(page));
        const batchResults = preformatArabicText(samplePages);

        expect(batchResults).toEqual(individualResults);
    });
});
