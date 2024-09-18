/**
 * Gets rid of the ـ character at the end of Arabic strings
If the text is "some textـ", it will be replaced to "some text".

Input:  "ـThis is a textـ"
Output: "This is a text"

Input:  "ـAnother example with 1422هـ"
Output: "Another example with 1422هـ"

Input:  "ـA multiline stringـ\nـwith several linesـ\n1423هـ"
Output: "A multiline string\nwith several lines\n1423هـ"

Input:  "This is a normal line\nـAnd this one starts with the characterـ\nAnd 1424هـ remains unchanged"
Output: "This is a normal line\nAnd this one starts with the character\nAnd 1424هـ remains unchanged"

Input:  "ـJustـ anotherـ exampleـ\n1425هـ is a Hijri yearـ"
Output: "Just another example\n1425هـ is a Hijri year"
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const cleanExtremeArabicUnderscores = (text: string): string => {
    return text.replace(/(?<!\d ?ه|اه)ـ(?=\r?$)|^ـ(?!اهـ)/gm, '');
};

export const convertUrduSymbolsToArabic = (text: string): string => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
};

/**
 * Replaces English comma with Arabic one.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const englishToArabicComma = (text: string): string => {
    return text.replace(/,|-،/g, '،');
};

/**
 * Fixes "عليكم و رحمة" to "عليكم ورحمة". This can be improved since it won't work for beginning of sentences, etc,
 * but for now it's a best effort.

it('should fix trailing wow', () => {
    const { formatted, cleaned } = deepClean('السلام عليكم و رحمة الله وبركاته الطرخون او ورق و');
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const fixTrailingWow = (text: string): string => {
    return text.replace(/ و /g, ' و');
};

/**
 * Adds a space in between Arabic text and a number.
الآية37
should become الآية 37

قال29
should become قال 29.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const insertSpaceBetweenArabicTextAndNumber = (text: string): string => {
    return text.replace(/([\u0600-\u06FF]+)(\d+)/g, '$1 $2');
};

/**
 * Removes English letters and symbols from the text.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeEnglishLettersAndSymbols = (text: string): string => {
    return text.replace(/[a-zA-Z]+[0-9]*|[¬§`ﷺ=]|\/{2,}|&/g, ' ');
};

/**
 * match all single-digit numbers that are found in between two arabic texts.  * Replaces numbers in a sequence surrounded by Arabic text such as:
سنه 695 6 واكثر
(?<![0-9] ?)- will match a dash not preceded by a number.
\b\d(\s\d+)*\b(?=[\u0600-\u06FF]) will match sequences of numbers separated by spaces followed by Arabic text.
(?<=[\u0600-\u06FF])\b\d(\s\d+)*\b will match sequences of numbers separated by spaces preceded by Arabic text.
For example:
"وهب 3 وقال" should remove the "3". But "لوحه 121 الجرح" should not remove the 121 since it is not a single digit.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeNonIndexSignatures = (text: string): string => {
    return text
        .replace(/(?<![0-9] ?)-|(?<=[\u0600-\u06FF])\s?\d\s?(?=[\u0600-\u06FF])/g, ' ')
        .replace(/(?<=[\u0600-\u06FF]\s)(\d+\s)+\d+(?=(\s[\u0600-\u06FF]|$))/g, ' ');
};

/**
 * The function removeSingularCodes aims to remove characters that are enclosed in square brackets [] or parentheses () and are within the range of Arabic letters (\u0621-\u064A) or Arabic-Indic numerals (\u0660-\u0669).
should remove [س] and (س)
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeSingularCodes = (text: string): string => {
    return text.replace(/[\[\({][\u0621-\u064A\u0660-\u0669][\]\)}]/g, '');
};

/**
 * Applies the removeSolitaryArabicLetters rule to the input text.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeSolitaryArabicLetters = (text: string): string => {
    return text.replace(/(^| )[\u0621-\u064A]( |$)/g, ' ');
};

/**
 * This replaces the 'tah marbutah' (ة) with the regular 'ha' (ه).
Example:
Input: مدرسة
Output: مدرسه
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeTaMarbutah = (text: string): string => {
    return text.replace(/[ة]/g, 'ه');
};

/**
 * This replaces various Arabic diacritics (tashkeel) and the tatweel (elongation character).
Example:
Input: مُحَمَّدٌ
Output: محمد

sanitize('أبـــتِـــكَةُ'); // returns 'ابتكه'

 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeTashkeel = (text: string): string => {
    return text.replace(
        /[\u0610\u0611\u0612\u0613\u0614\u0615\u0616\u0617\u0618\u0619\u061A\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0653\u0654\u0655\u0656\u0657\u0658\u065A\u065B\u065C\u065D\u065E\u0640]/g,
        '',
    );
};

/**
 * For plain-text Arabic content, removing Zero-Width Joiners (ZWJ) and other zero-width characters might still have some implications, but they would typically be less severe compared to rich text or text with mixed languages and complex scripts. Here are a few considerations:

1. Ligature Formation:
In Arabic scripts, the Zero Width Joiner (U+200D) can be used to control ligature formation. While this is more relevant in rich text with specific formatting requirements, even in plain text, removing ZWJ can lead to changes in ligature formation and potentially affect the visual presentation of the text.

2. Word Breaking:
Zero Width Space (U+200B) can be used to indicate permissible breakpoints within Arabic words. Removing it can affect word breaking and wrapping in user interfaces displaying the plain text.

3. Bi-Directional Text:
If your plain-text Arabic content has embedded Latin scripts or numbers, removing certain control characters may still affect the presentation due to changes in bi-directional rendering rules.

4. Special Cases:
In some specialized contexts or for specific use cases, zero-width characters might be used for unique formatting or encoding purposes in plain-text Arabic content, and removing them could impact those cases.

Consideration:
While removing zero-width characters can help in streamlining text processing and analysis tasks, it’s crucial to consider the context in which the text will be used and to review whether these characters serve a functional purpose in that context. If the text is purely for analysis, and the visual representation is not a concern, removing these characters might not cause significant issues. However, if the text is intended for display, especially in UI components, you might want to test thoroughly to ensure that removing these characters does not adversely affect the text's readability and appearance.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeZeroWidthJoiners = (text: string): string => {
    return text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, ' ');
};

/**
 * This replaces the Arabic letter 'alif maqsurah' (ى) with the regular 'ya' (ي).
Example:
Input: رؤيى
Output: رؤيي
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const replaceAlifMaqsurah = (text: string): string => {
    return text.replace(/[ىي]/g, 'ي');
};

/**
 * Replaces English question mark to Arabic one or an Arabic question mark with a period to just the question mark.
 * Also replaces English semicolon with Arabic one.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const replaceEnglishPunctuationWithArabic = (text: string): string => {
    return text.replace(/\?|؟\./g, '؟').replace(/(;|؛)\s*(\1\s*)*/g, '؛');
};

/**
 * This replaces all forms of "alif" that are not the simple 'ا' with the simple 'ا'.
Example:
Input: أنا إلى الآفاق
Output: انا الى الافاق
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const simplifyAlif = (text: string): string => {
    return text.replace(/[أإآ]/g, 'ا');
};
