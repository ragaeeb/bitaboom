import {
    ABBREVIATION_REGEX,
    ENGLISH_PHRASE_REGEX,
    PARENTHETICAL_REGEX,
    SALUTATION_SYMBOL,
    SYMBOL_CLEANUP_REGEX,
} from './constants';
import { normalizeSpaces } from './formatting';
import {
    buildNormalizedArabic,
    buildNormalizedLatin,
    expandArabicDiacritics,
    findArabicMatches,
    findLatinMatches,
    mapRangeToOriginal,
} from './utils/salutation';

/**
 * Replaces common Arabic prefixes (like 'Al-', 'Ar-', 'Ash-', etc.) with 'al-' in the text.
 * Handles different variations of prefixes such as Ash- and Al- but not when the second word
 * does not start with 'S'.
 * Example: 'Ash-Shafiee' becomes 'al-Shafiee'.
 *
 * @param {string} text - The input text containing Arabic prefixes.
 * @returns {string} - The modified text with standardized 'al-' prefixes.
 */
export const normalizeArabicPrefixesToAl = (text: string) => {
    return text
        .replace(/(\b|\W)(Al |Al-|Ar-|As-|Adh-|Ad-|Ats-|Ath |Ath-|Az |Az-|az-|adh-|as-|ar-)/g, '$1al-')
        .replace(/(\b|\W)(Ash-S|ash-S)/g, '$1al-S')
        .replace(/al- (.+?)\b/g, 'al-$1');
};

/**
 * Removes double occurrences of Arabic apostrophes such as ʿʿ or ʾʾ in the text.
 * Example: 'ʿulamāʾʾ' becomes 'ʿulamāʾ'.
 *
 * @param {string} text - The input text containing double apostrophes.
 * @returns {string} - The modified text with condensed apostrophes.
 */
export const normalizeDoubleApostrophes = (text: string) => {
    return text.replace(/ʿʿ/g, 'ʿ').replace(/ʾʾ/g, 'ʾ');
};

/**
 * Replaces common salutations with the ﷺ symbol.
 *
 * Handles 130+ variations including:
 * - Arabic script (with and without diacritics)
 * - Latin transliterations (various romanization schemes)
 * - Abbreviations (PBUH, SAWS, SAW, etc.)
 * - English phrases ("peace and blessings be upon him")
 * - Parenthetical forms
 *
 * @param text - The input text containing salutations
 * @returns The modified text with salutations replaced by ﷺ
 */
export const replaceSalutationsWithSymbol = (text: string) => {
    if (!text) {
        return '';
    }

    let result = text;

    // 1. Handle parenthetical salutations first (contextual patterns)
    result = result.replace(PARENTHETICAL_REGEX, (_match, prefix) => {
        return prefix ? `${prefix} ${SALUTATION_SYMBOL}` : ` ${SALUTATION_SYMBOL}`;
    });

    // 2. Replace abbreviations (exact word matches)
    result = result.replace(ABBREVIATION_REGEX, SALUTATION_SYMBOL);

    // 3. Replace Latin transliteration patterns using token-FSM matching
    const latinNormalized = buildNormalizedLatin(result);
    const latinMatches = findLatinMatches(latinNormalized.normalized);
    if (latinMatches.length > 0) {
        for (let i = latinMatches.length - 1; i >= 0; i--) {
            const mapped = mapRangeToOriginal(latinNormalized.map, latinMatches[i].start, latinMatches[i].end);
            if (!mapped) {
                continue;
            }
            result = result.slice(0, mapped.origStart) + ` ${SALUTATION_SYMBOL} ` + result.slice(mapped.origEnd);
        }
    }

    // 4. Replace Arabic salutation patterns using token matching
    const arabicNormalized = buildNormalizedArabic(result);
    const arabicMatches = findArabicMatches(arabicNormalized.normalized);
    if (arabicMatches.length > 0) {
        for (let i = arabicMatches.length - 1; i >= 0; i--) {
            const mapped = mapRangeToOriginal(arabicNormalized.map, arabicMatches[i].start, arabicMatches[i].end);
            if (!mapped) {
                continue;
            }
            const expanded = expandArabicDiacritics(result, mapped.origStart, mapped.origEnd);
            result = result.slice(0, expanded.origStart) + ` ${SALUTATION_SYMBOL} ` + result.slice(expanded.origEnd);
        }
    }

    // 5. Replace English phrases
    result = result.replace(ENGLISH_PHRASE_REGEX, ` ${SALUTATION_SYMBOL} `);

    // 6. Clean up symbol with surrounding dashes/punctuation
    result = result.replace(SYMBOL_CLEANUP_REGEX, ` ${SALUTATION_SYMBOL} `);

    // 7. Clean up parentheses around the symbol (from patterns like (SAW))
    result = result.replace(/\([ \t]*ﷺ[ \t]*\)/g, SALUTATION_SYMBOL);

    // 8. Clean up commas around the symbol
    result = result.replace(/,[ \t]*ﷺ[ \t]*,?/g, ` ${SALUTATION_SYMBOL}`);
    result = result.replace(/,?[ \t]*ﷺ[ \t]*,/g, ` ${SALUTATION_SYMBOL}`);

    // 8. Clean up horizontal whitespace without flattening line breaks
    result = result.replace(/[ \t]+/g, ' ').replace(/^[ \t]+|[ \t]+$/g, '');

    return result;
};

/**
 * Normalizes the text by removing diacritics, apostrophes, and dashes.
 * Example: 'Al-Jadwal' becomes 'AlJadwal'.
 *
 * @param {string} input - The input text to normalize.
 * @returns {string} - The normalized text.
 */
export const normalize = (input: string) => {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/`|ʾ|ʿ|-/g, '');
};

/**
 * Strips common Arabic prefixes like 'al-', 'bi-', 'fī', 'wa-', etc. from the beginning of words.
 * Example: 'al-Bukhari' becomes 'Bukhari'.
 *
 * @param {string} text - The input text containing Arabic prefixes.
 * @returns {string} - The modified text with prefixes stripped.
 */
export const removeArabicPrefixes = (text: string) => {
    return normalizeSpaces(text.replace(/(\bal-|\bli-|\bbi-|\bfī|\bwa[-\s]+|\bl-|\bliʿl|\Bʿalá|\Bʿan|\bb\.)/gi, ''));
};

/**
 * Simplifies English transliterations by removing diacritics, apostrophes, and common prefixes.
 * Example: 'Al-Jadwal' becomes 'Jadwal', and 'āḍġḥīṣṭū' becomes 'adghistu'.
 *
 * @param {string} text - The input text to simplify.
 * @returns {string} - The simplified text.
 */
export const normalizeTransliteratedEnglish = (text: string) => normalize(removeArabicPrefixes(text));

/**
 * Extracts the initials from the input string, typically used for names or titles.
 * Example: 'Nayl al-Awtar' becomes 'NA'.
 *
 * @param {string} text - The input text to extract initials from.
 * @returns {string} - The extracted initials.
 */
export const extractInitials = (fullName: string) => {
    const initials = normalizeTransliteratedEnglish(fullName)
        .trim()
        .split(/[ -]/)
        .slice(0, 2)
        .map((word) => {
            return word.charAt(0).toUpperCase();
        })
        .join('');
    return initials;
};
