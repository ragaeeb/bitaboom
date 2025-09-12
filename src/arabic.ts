/**
 * Converts Arabic-Indic numerals (٠-٩) to a JavaScript number.
 *
 * This function finds all Arabic-Indic digits in the input string and converts them
 * to their corresponding Arabic (Western) digits, then parses the result as an integer.
 *
 * Arabic-Indic digits mapping:
 * - ٠ → 0, ١ → 1, ٢ → 2, ٣ → 3, ٤ → 4
 * - ٥ → 5, ٦ → 6, ٧ → 7, ٨ → 8, ٩ → 9
 *
 * @param arabic - The string containing Arabic-Indic numerals to convert
 * @returns The parsed integer value of the converted numerals
 *
 * @example
 * ```typescript
 * arabicNumeralToNumber("١٢٣"); // returns 123
 * arabicNumeralToNumber("٥٠"); // returns 50
 * arabicNumeralToNumber("abc١٢٣xyz"); // returns 123 (non-digits ignored)
 * arabicNumeralToNumber(""); // returns NaN
 * ```
 *
 * @throws Will return NaN if no valid Arabic-Indic digits are found
 */
export const arabicNumeralToNumber = (arabic: string) => {
    return parseInt(
        arabic.replace(/[\u0660-\u0669]/g, (c) => (c.charCodeAt(0) - 0x0660).toString()),
        10,
    );
};

/**
 * Removes extreme Arabic underscores (ـ) that appear at the beginning or end of a line or in text.
 * Does not affect Hijri dates (e.g., 1424هـ) or specific Arabic terms.
 * Example: "ـThis is a textـ" will be changed to "This is a text".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with extreme underscores removed.
 */
export const cleanExtremeArabicUnderscores = (text: string) => {
    return text.replace(/(?<!\d ?ه|اه)ـ(?=\r?$)|^ـ(?!اهـ)/gm, '');
};

/**
 * Converts Urdu symbols to their Arabic equivalents.
 * Example: 'ھذا' will be changed to 'هذا', 'ی' to 'ي'.
 * @param {string} text - The input text containing Urdu symbols.
 * @returns {string} - The modified text with Urdu symbols converted to Arabic symbols.
 */
export const convertUrduSymbolsToArabic = (text: string) => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
};

/**
 * Calculates the proportion of Arabic characters in text relative to total non-whitespace, non-digit characters.
 * Digits (ASCII and Arabic-Indic variants) are excluded from both numerator and denominator.
 * @param text - The input text to analyze
 * @returns A decimal between 0-1 representing the Arabic character ratio (0 = no Arabic, 1 = all Arabic)
 */
export const getArabicScore = (text: string) => {
    if (!text) {
        return 0;
    }
    // Arabic letters (letters/ranges only)
    const arabicLettersPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    // ASCII digits + Arabic-Indic digits + Extended Arabic-Indic digits
    const allDigitPattern = /[0-9\u0660-\u0669\u06F0-\u06F9]/g;
    // Counted characters exclude whitespace and all listed digits
    const countedCharsPattern = /[^\s0-9\u0660-\u0669\u06F0-\u06F9]/g;
    const cleaned = text.replace(allDigitPattern, '');
    const arabicMatches = cleaned.match(arabicLettersPattern) || [];
    const totalMatches = cleaned.match(countedCharsPattern) || [];
    return totalMatches.length === 0 ? 0 : arabicMatches.length / totalMatches.length;
};

/**
 * Fixes the trailing "و" (wow) in phrases such as "عليكم و رحمة" to "عليكم ورحمة".
 * This function attempts to correct phrases where "و" appears unnecessarily, particularly in greetings.
 * Example: 'السلام عليكم و رحمة' will be changed to 'السلام عليكم ورحمة'.
 * @param {string} text - The input text containing the "و" character.
 * @returns {string} - The modified text with unnecessary trailing "و" characters corrected.
 */
export const fixTrailingWow = (text: string) => {
    return text.replace(/ و /g, ' و');
};

/**
 * Inserts a space between Arabic text and numbers.
 * Example: 'الآية37' will be changed to 'الآية 37'.
 * @param {string} text - The input text containing Arabic text followed by numbers.
 * @returns {string} - The modified text with spaces inserted between Arabic text and numbers.
 */
export const addSpaceBetweenArabicTextAndNumbers = (text: string) => {
    return text.replace(/([\u0600-\u06FF]+)(\d+)/g, '$1 $2');
};

/**
 * Removes single-digit numbers surrounded by Arabic text. Also removes dashes (-) not followed by a number.
 * For example, removes '3' from 'وهب 3 وقال' but does not remove '121' from 'لوحه 121 الجرح'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with non-index numbers and dashes removed.
 */
export const removeNonIndexSignatures = (text: string) => {
    return text
        .replace(/(?<![0-9] ?)-|(?<=[\u0600-\u06FF])\s?\d\s?(?=[\u0600-\u06FF])/g, ' ')
        .replace(/(?<=[\u0600-\u06FF]\s)(\d+\s)+\d+(?=(\s[\u0600-\u06FF]|$))/g, ' ');
};

/**
 * Removes characters enclosed in square brackets [] or parentheses () if they are Arabic letters or Arabic-Indic numerals.
 * Example: '[س]' or '(س)' will be removed.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with singular codes removed.
 */
export const removeSingularCodes = (text: string) => {
    return text.replace(/[[({][\u0621-\u064A\u0660-\u0669][\])}]/g, '');
};

/**
 * Removes solitary Arabic letters unless they are the 'ha' letter, which is used in Hijri years.
 * Example: "ب ا الكلمات ت" will be changed to "ا الكلمات".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with solitary Arabic letters removed.
 */
export const removeSolitaryArabicLetters = (text: string) => {
    return text.replace(/(^| )[\u0621-\u064A]( |$)/g, ' ');
};

/**
 * Replaces English punctuation (question mark and semicolon) with their Arabic equivalents.
 * Example: '?' will be replaced with '؟', and ';' with '؛'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with English punctuation replaced by Arabic punctuation.
 */
export const replaceEnglishPunctuationWithArabic = (text: string) => {
    return text
        .replace(/\?|؟\./g, '؟')
        .replace(/(;|؛)\s*(\1\s*)*/g, '؛')
        .replace(/,|-،/g, '،');
};
