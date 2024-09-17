export const convertUrduSymbolsToArabic = (text: string): string => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
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
 * Applies the removeSolitaryArabicLetters rule to the input text.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeSolitaryArabicLetters = (text: string): string => {
    return text.replace(/(^| )[\u0621-\u064A]( |$)/g, ' ');
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
