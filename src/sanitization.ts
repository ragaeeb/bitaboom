/**
 * Removes various symbols, part references, and numerical markers from the text.
 * Example: '(1) (2/3)' becomes ''.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with symbols and part references removed.
 */
export const cleanSymbolsAndPartReferences = (text: string): string => {
    return text.replace(
        / *\(?:\d+(?:\/\d+){0,2}\)? *| *\[\d+(?:\/\d+)?\] *| *«\d+» *|\d+\/\d+(?:\/\d+)?|[،§{}۝؍‎﴿﴾<>;_؟»«:!،؛\[\]…ـ¬\.\\\/\*\(\)"]/g,
        ' ',
    );
};

/**
 * Removes trailing page numbers formatted as '-[46]-' from the text.
 * Example: 'This is some -[46]- text' becomes 'This is some text'.
 * @param {string} text - The input text with trailing page numbers.
 * @returns {string} - The modified text with page numbers removed.
 */
export const cleanTrailingPageNumbers = (text: string): string => {
    return text.replace(/-\[\d+\]-/g, '');
};

/**
 * Replaces consecutive line breaks and whitespace characters with a single space.
 * Example: 'a\nb' becomes 'a b'.
 * @param {string} text - The input text containing line breaks or multiple spaces.
 * @returns {string} - The modified text with spaces.
 */
export const replaceLineBreaksWithSpaces = (text: string): string => {
    return text.replace(/\s+/g, ' ');
};

/**
 * Removes all numeric digits from the text.
 * Example: 'abc123' becomes 'abc'.
 * @param {string} text - The input text containing digits.
 * @returns {string} - The modified text with digits removed.
 */
export const stripAllDigits = (text: string): string => {
    return text.replace(/[0-9]/g, '');
};

/**
 * Removes death year references like "(d. 390H)" and "[d. 100h]" from the text.
 * Example: 'Sufyān ibn ‘Uyaynah (d. 198h)' becomes 'Sufyān ibn ‘Uyaynah'.
 * @param {string} text - The input text containing death year references.
 * @returns {string} - The modified text with death years removed.
 */
export const removeDeathYear = (text: string): string => {
    return text.replace(/\[(d)\.\s*\d{1,4}[hH]\]\s*|\((d)\.\s*\d{1,4}[hH]\)\s*/g, '');
};

/**
 * Removes numeric digits and dashes from the text.
 * Example: 'ABC 123-Xyz' becomes 'ABC Xyz'.
 * @param {string} text - The input text containing digits and dashes.
 * @returns {string} - The modified text with numbers and dashes removed.
 */
export const removeNumbersAndDashes = (text: string): string => {
    return text.replace(/[\d-]/g, '');
};

/**
 * Removes single digit references like (1), «2», [3] from the text.
 * Example: 'Ref (1), Ref «2», Ref [3]' becomes 'Ref , Ref , Ref '.
 * @param {string} text - The input text containing single digit references.
 * @returns {string} - The modified text with single digit references removed.
 */
export const removeSingleDigitReferences = (text: string): string => {
    return text.replace(/\(\d{1}\)|\[\d{1}\]|«\d»/g, '');
};

/**
 * Removes URLs from the text.
 * Example: 'Visit https://example.com' becomes 'Visit '.
 * @param {string} text - The input text containing URLs.
 * @returns {string} - The modified text with URLs removed.
 */
export const removeUrls = (text: string): string => {
    return text.replace(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
        '',
    );
};
