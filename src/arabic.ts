export const convertUrduSymbolsToArabic = (text: string): string => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
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
