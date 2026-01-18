import { describe, expect, it } from 'bun:test';

import { replaceSalutationsWithSymbol } from './transliteration';

const SALUTATIONS = [
    'sallallahu alayhi wa sallam',
    'صلى الله عليه وسلم',
    'PBUH',
    '(s. a. w. s.)',
    'peace and blessings of Allah be upon him',
    'sallAllahu alayhi wa Salam',
    '– SallAllāhu alayhi wa sallam –',
];

const FILLER_WORDS = [
    'The',
    'Prophet',
    'said',
    'that',
    'people',
    'should',
    'remember',
    'to',
    'be',
    'kind',
    'and',
    'patient',
    'in',
    'their',
    'speech',
    'and',
    'actions',
];

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min)) + min;

const generateParagraph = (targetLength: number): string => {
    const parts: string[] = [];
    while (parts.join(' ').length < targetLength) {
        if (Math.random() < 0.08) {
            parts.push(SALUTATIONS[randomInt(0, SALUTATIONS.length)]);
            continue;
        }
        parts.push(FILLER_WORDS[randomInt(0, FILLER_WORDS.length)]);
    }
    return parts.join(' ');
};

const generateSamples = (count: number, targetLength: number): string[] => {
    const samples: string[] = [];
    for (let i = 0; i < count; i++) {
        samples.push(generateParagraph(targetLength));
    }
    return samples;
};

describe('replaceSalutationsWithSymbol Performance', () => {
    const sizes = [
        { label: 'small', length: 1_000, count: 500 },
        { label: 'medium', length: 10_000, count: 120 },
    ];

    if (process.env.BITABOOM_HEAVY_TESTS === '1') {
        sizes.push({ label: 'large', length: 100_000, count: 10 });
    }

    for (const size of sizes) {
        it(`should benchmark ${size.label} inputs`, () => {
            const samples = generateSamples(size.count, size.length);

            const start = performance.now();
            for (const sample of samples) {
                replaceSalutationsWithSymbol(sample);
            }
            const duration = performance.now() - start;
            const perSecond = (size.count / duration) * 1000;

            console.log(
                `\n🧪 replaceSalutations (${size.label}): ${size.count} samples ` +
                    `@ ${size.length} chars → ${duration.toFixed(2)}ms (${perSecond.toFixed(1)} ops/s)`,
            );

            expect(duration).toBeGreaterThan(0);
        });
    }
});
