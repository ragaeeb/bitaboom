/**
 * Removes extreme Arabic underscores (ـ) that appear at the beginning or end of a line or in text.
 * Does not affect Hijri dates (e.g., 1424هـ) or specific Arabic terms.
 * Example: "ـThis is a textـ" will be changed to "This is a text".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with extreme underscores removed.
 */
export const cleanExtremeArabicUnderscores = (text: string): string => {
    return text.replace(/(?<!\d ?ه|اه)ـ(?=\r?$)|^ـ(?!اهـ)/gm, '');
};

/**
 * Converts Urdu symbols to their Arabic equivalents.
 * Example: 'ھذا' will be changed to 'هذا', 'ی' to 'ي'.
 * @param {string} text - The input text containing Urdu symbols.
 * @returns {string} - The modified text with Urdu symbols converted to Arabic symbols.
 */
export const convertUrduSymbolsToArabic = (text: string): string => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
};

/**
 * Fixes the trailing "و" (wow) in phrases such as "عليكم و رحمة" to "عليكم ورحمة".
 * This function attempts to correct phrases where "و" appears unnecessarily, particularly in greetings.
 * Example: 'السلام عليكم و رحمة' will be changed to 'السلام عليكم ورحمة'.
 * @param {string} text - The input text containing the "و" character.
 * @returns {string} - The modified text with unnecessary trailing "و" characters corrected.
 */
export const fixTrailingWow = (text: string): string => {
    return text.replace(/ و /g, ' و');
};

/**
 * Inserts a space between Arabic text and numbers.
 * Example: 'الآية37' will be changed to 'الآية 37'.
 * @param {string} text - The input text containing Arabic text followed by numbers.
 * @returns {string} - The modified text with spaces inserted between Arabic text and numbers.
 */
export const addSpaceBetweenArabicTextAndNumbers = (text: string): string => {
    return text.replace(/([\u0600-\u06FF]+)(\d+)/g, '$1 $2');
};

/**
 * Removes English letters and symbols from the text, including ampersands, slashes, and other symbols.
 * Example: 'أحب & لنفسي' will be changed to 'أحب   لنفسي'.
 * @param {string} text - The input text containing English letters and symbols.
 * @returns {string} - The modified text with English letters and symbols removed.
 */
export const stripEnglishCharactersAndSymbols = (text: string): string => {
    return text.replace(/[a-zA-Z]+[0-9]*|[¬§`ﷺ=]|\/{2,}|&/g, ' ');
};

/**
 * Removes single-digit numbers surrounded by Arabic text. Also removes dashes (-) not followed by a number.
 * For example, removes '3' from 'وهب 3 وقال' but does not remove '121' from 'لوحه 121 الجرح'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with non-index numbers and dashes removed.
 */
export const removeNonIndexSignatures = (text: string): string => {
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
export const removeSingularCodes = (text: string): string => {
    return text.replace(/[\[\({][\u0621-\u064A\u0660-\u0669][\]\)}]/g, '');
};

/**
 * Removes solitary Arabic letters unless they are the 'ha' letter, which is used in Hijri years.
 * Example: "ب ا الكلمات ت" will be changed to "ا الكلمات".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with solitary Arabic letters removed.
 */
export const removeSolitaryArabicLetters = (text: string): string => {
    return text.replace(/(^| )[\u0621-\u064A]( |$)/g, ' ');
};

/**
 * Replaces the 'tah marbutah' (ة) character with 'ha' (ه).
 * Example: 'مدرسة' will be changed to 'مدرسه'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with 'ta marbutah' replaced by 'ha'.
 */
export const replaceTaMarbutahWithHa = (text: string): string => {
    return text.replace(/[ة]/g, 'ه');
};

/**
 * Removes Arabic diacritics (tashkeel) and the tatweel (elongation) character.
 * Example: 'مُحَمَّدٌ' will be changed to 'محمد'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with diacritics and tatweel removed.
 */
export const stripDiacritics = (text: string): string => {
    return text.replace(
        /[\u0610\u0611\u0612\u0613\u0614\u0615\u0616\u0617\u0618\u0619\u061A\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0653\u0654\u0655\u0656\u0657\u0658\u065A\u065B\u065C\u065D\u065E\u0640]/g,
        '',
    );
};

/**
 * Removes zero-width joiners (ZWJ) and other zero-width characters from the input text.
 * Zero-width characters include U+200B to U+200F, U+202A to U+202E, U+2060 to U+2064, and U+FEFF.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with zero-width characters removed.
 */
export const stripZeroWidthCharacters = (text: string): string => {
    return text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, ' ');
};

/**
 * Replaces the 'alif maqsurah' (ى) character with the regular 'ya' (ي).
 * Example: 'رؤيى' will be changed to 'رؤيي'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with 'alif maqsurah' replaced by 'ya'.
 */
export const replaceAlifMaqsurah = (text: string): string => {
    return text.replace(/[ىي]/g, 'ي');
};

/**
 * Replaces English punctuation (question mark and semicolon) with their Arabic equivalents.
 * Example: '?' will be replaced with '؟', and ';' with '؛'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with English punctuation replaced by Arabic punctuation.
 */
export const replaceEnglishPunctuationWithArabic = (text: string): string => {
    return text
        .replace(/\?|؟\./g, '؟')
        .replace(/(;|؛)\s*(\1\s*)*/g, '؛')
        .replace(/,|-،/g, '،');
};

/**
 * Simplifies all forms of 'alif' (أ, إ, and آ) to the basic 'ا'.
 * Example: 'أنا إلى الآفاق' will be changed to 'انا الى الافاق'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with simplified 'alif' characters.
 */
export const normalizeAlifVariants = (text: string): string => {
    return text.replace(/[أإآ]/g, 'ا');
};
