import { describe, expect, it } from 'bun:test';

import {
    buildNormalizedArabic,
    buildNormalizedLatin,
    consumeAla,
    consumeAlayhi,
    consumeAllahu,
    consumeFamilyExtension,
    consumeSalla,
    consumeSallam,
    consumeWa,
    expandArabicDiacritics,
    findArabicMatches,
    findLatinMatches,
    isArabicAla,
    isArabicAlihi,
    isArabicAllah,
    isArabicAlayhi,
    isArabicDiacritic,
    isArabicLetter,
    isArabicSalam,
    isArabicSalat,
    isArabicSalawat,
    isArabicSalla,
    isArabicSallam,
    isArabicTaala,
    isArabicWa,
    isLatinLetter,
    mapRangeToOriginal,
    matchArabicAlternative,
    matchArabicPrimary,
    matchArabicReverse,
    matchArabicSalawat,
    matchLatinAt,
    skipSpaces,
    tokenizeArabic,
} from './salutation';

describe('salutation utils', () => {
    it('should detect Latin letters', () => {
        expect(isLatinLetter('a')).toBe(true);
        expect(isLatinLetter('Z')).toBe(false);
    });

    it('should detect Arabic letters', () => {
        expect(isArabicLetter('ص')).toBe(true);
        expect(isArabicLetter('a')).toBe(false);
    });

    it('should detect Arabic diacritics', () => {
        expect(isArabicDiacritic(0x064e)).toBe(true);
        expect(isArabicDiacritic(0x0061)).toBe(false);
    });

    it('should normalize Latin text with a map', () => {
        const { normalized, map } = buildNormalizedLatin("Sallāhu 'alayhi 3wasallam");
        expect(normalized).toBe('sallahu alayhi wasallam');
        expect(map[0]).toBe(0);
    });

    it('should normalize Arabic text with diacritics removed', () => {
        const { normalized } = buildNormalizedArabic('صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ');
        expect(normalized).toBe('صلي الله عليه وسلم');
    });

    it('should skip over consecutive spaces', () => {
        expect(skipSpaces('   abc', 0)).toBe(3);
    });

    it('should consume the salla prefix', () => {
        expect(consumeSalla('sallahu', 0)).toBe(7);
    });

    it('should consume the allahu chunk', () => {
        expect(consumeAllahu('allahu', 0)).toBe(6);
    });

    it('should consume the alayhi chunk', () => {
        expect(consumeAlayhi('alayhi', 0)).toBe(6);
    });

    it('should consume the wa connector', () => {
        expect(consumeWa('wa', 0)).toBe(2);
        expect(consumeWa('w', 0)).toBe(1);
    });

    it('should consume the ala chunk', () => {
        expect(consumeAla('ala', 0)).toBe(3);
    });

    it('should consume the sallam chunk', () => {
        expect(consumeSallam('sallam', 0)).toBe(6);
    });

    it('should consume the family extension', () => {
        expect(consumeFamilyExtension('wa alihi', 0)).toBe(8);
    });

    it('should match a Latin salutation at the start', () => {
        const text = 'sallahu alayhi wa sallam';
        expect(matchLatinAt(text, 0)).toBe(text.length);
    });

    it('should find multiple Latin matches', () => {
        const normalized = buildNormalizedLatin('sallahu alayhi wa sallam and sallahu alayhi wa sallam').normalized;
        expect(findLatinMatches(normalized)).toHaveLength(2);
    });

    it('should tokenize Arabic and split waw', () => {
        const tokens = tokenizeArabic('وآله');
        expect(tokens.map((token) => token.value)).toEqual(['و', 'آله']);
    });

    it('should classify Arabic salla tokens', () => {
        expect(isArabicSalla('صلى')).toBe(true);
        expect(isArabicSalla('سلام')).toBe(false);
    });

    it('should classify Arabic Allah tokens', () => {
        expect(isArabicAllah('الله')).toBe(true);
        expect(isArabicAllah('سلام')).toBe(false);
    });

    it('should classify Arabic taala tokens', () => {
        expect(isArabicTaala('تعالى')).toBe(true);
        expect(isArabicTaala('تعالي')).toBe(true);
    });

    it('should classify Arabic alayhi tokens', () => {
        expect(isArabicAlayhi('عليه')).toBe(true);
        expect(isArabicAlayhi('علي')).toBe(false);
    });

    it('should classify Arabic waw tokens', () => {
        expect(isArabicWa('و')).toBe(true);
        expect(isArabicWa('سلام')).toBe(false);
    });

    it('should classify Arabic ala tokens', () => {
        expect(isArabicAla('على')).toBe(true);
        expect(isArabicAla('علي')).toBe(true);
        expect(isArabicAla('سلام')).toBe(false);
    });

    it('should classify Arabic alihi tokens', () => {
        expect(isArabicAlihi('آله')).toBe(true);
        expect(isArabicAlihi('اله')).toBe(true);
    });

    it('should classify Arabic sallam tokens', () => {
        expect(isArabicSallam('سلام')).toBe(true);
        expect(isArabicSallam('صلى')).toBe(false);
    });

    it('should classify Arabic salat tokens', () => {
        expect(isArabicSalat('الصلاه')).toBe(true);
        expect(isArabicSalat('صلاه')).toBe(true);
    });

    it('should classify Arabic salam tokens', () => {
        expect(isArabicSalam('السلام')).toBe(true);
        expect(isArabicSalam('سلامه')).toBe(true);
    });

    it('should classify Arabic salawat tokens', () => {
        expect(isArabicSalawat('صلوات')).toBe(true);
        expect(isArabicSalawat('سلام')).toBe(false);
    });

    it('should match the primary Arabic structure', () => {
        const normalized = buildNormalizedArabic('صلى الله عليه وسلم').normalized;
        const tokens = tokenizeArabic(normalized);
        expect(matchArabicPrimary(tokens, 0)).toBe(tokens.length - 1);
    });

    it('should match the alternative Arabic structure', () => {
        const normalized = buildNormalizedArabic('عليه الصلاة والسلام').normalized;
        const tokens = tokenizeArabic(normalized);
        expect(matchArabicAlternative(tokens, 0)).toBe(tokens.length - 1);
    });

    it('should match the salawat Arabic structure', () => {
        const normalized = buildNormalizedArabic('صلوات الله وسلامه عليه').normalized;
        const tokens = tokenizeArabic(normalized);
        expect(matchArabicSalawat(tokens, 0)).toBe(tokens.length - 1);
    });

    it('should match the reverse Arabic structure', () => {
        const normalized = buildNormalizedArabic('صلى وسلم عليه هللا').normalized;
        const tokens = tokenizeArabic(normalized);
        expect(matchArabicReverse(tokens, 0)).toBe(tokens.length - 1);
    });

    it('should find multiple Arabic matches', () => {
        const normalized = buildNormalizedArabic('صلى الله عليه وسلم ثم صلى الله عليه وسلم').normalized;
        expect(findArabicMatches(normalized)).toHaveLength(2);
    });

    it('should map normalized ranges to original offsets', () => {
        expect(mapRangeToOriginal([0, 2, 4], 1, 3)).toEqual({ origStart: 2, origEnd: 5 });
    });

    it('should return null for invalid mapping ranges', () => {
        expect(mapRangeToOriginal([0, 2, 4], 3, 3)).toBeNull();
    });

    it('should expand Arabic diacritics around a span', () => {
        const text = 'صَلَّى';
        const expanded = expandArabicDiacritics(text, 0, 1);
        expect(expanded.origEnd).toBeGreaterThan(1);
    });
});
