import { normalizeSpaces } from './formatting';

/**
 * Replaces common Arabic prefixes (like 'Al-', 'Ar-', 'Ash-', etc.) with 'al-' in the text.
 * Handles different variations of prefixes such as Ash- and Al- but not when the second word
 * does not start with 'S'.
 * Example: 'Ash-Shafiee' becomes 'al-Shafiee'.
 *
 * @param {string} text - The input text containing Arabic prefixes.
 * @returns {string} - The modified text with standardized 'al-' prefixes.
 */
export const normalizeArabicPrefixesToAl = (text: string): string => {
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
export const normalizeDoubleApostrophes = (text: string): string => {
    return text.replace(/ʿʿ/g, 'ʿ').replace(/ʾʾ/g, 'ʾ');
};

/**
 * Replaces common salutations such as "sallahu alayhi wasallam" with "ﷺ" in the text.
 * It also handles variations of the salutation phrase, including 'peace and blessings be upon him'.
 * Example: 'Then Muḥammad (sallahu alayhi wasallam)' becomes 'Then Muḥammad ﷺ'.
 *
 * @param {string} text - The input text containing salutations.
 * @returns {string} - The modified text with salutations replaced.
 */
export const replaceSalutationsWithSymbol = (text: string): string => {
    return text
        .replace(
            /\(peace be upon him\)|(Messenger of (Allah|Allāh)|Messenger|Prophet|Mu[hḥ]ammad) *\((s[^)]*m|peace[^)]*him|May[^)]*him|may[^)]*him)\)*/gi,
            '$1 ﷺ',
        )
        .replace(/,\s*ﷺ\s*,/g, ' ﷺ');
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
 * Replaces various apostrophe characters (‛, ’, ‘) with the standard apostrophe (').
 * Example: '‛ulama’ al-su‘' becomes ''ulama' al-su''.
 *
 * @param {string} text - The input text containing different apostrophe characters.
 * @returns {string} - The modified text with normalized apostrophes.
 */
export const normalizeApostrophes = (text: string): string => {
    return text.replace(/‛|’|‘/g, "'");
};

/**
 * Strips common Arabic prefixes like 'al-', 'bi-', 'fī', 'wa-', etc. from the beginning of words.
 * Example: 'al-Bukhari' becomes 'Bukhari'.
 *
 * @param {string} text - The input text containing Arabic prefixes.
 * @returns {string} - The modified text with prefixes stripped.
 */
export const removeArabicPrefixes = (text: string): string => {
    return normalizeSpaces(text.replace(/(\bal-|\bli-|\bbi-|\bfī|\bwa[-\s]+|\bl-|\bliʿl|\Bʿalá|\Bʿan|\bb\.)/gi, ''));
};

/**
 * Simplifies English transliterations by removing diacritics, apostrophes, and common prefixes.
 * Example: 'Al-Jadwal' becomes 'Jadwal', and 'āḍġḥīṣṭū' becomes 'adghistu'.
 *
 * @param {string} text - The input text to simplify.
 * @returns {string} - The simplified text.
 */
export const normalizeTransliteratedEnglish = (text: string): string => normalize(removeArabicPrefixes(text));

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
