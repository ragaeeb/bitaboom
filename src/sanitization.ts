/**
 * some example texts that would be affected by the cleanSymbols function:

Text with numerical markers in parentheses:
Input: "This is a text (1) (2/3)"
Output: "This is a text"

Text with numerical markers in square brackets:
Input: "Another example [1] [1/2]"
Output: "Another example"

Text with part references:
Input: "Part references 1/2 2/3/4"
Output: "Part references"

Text with various symbols:
Input: "Hello، world! {test} <example> …"
Output: "Hello world test example"

Text with mixed elements:
Input: "Mixed (1) [2] «3» 1/2 [1/2] ;.,!"
Output: "Mixed"

Text with backslashes and forward slashes:
Input: "File path is C:\\folder\\file / Unix path is /usr/bin/"
Output: "File path is C folder file Unix path is usr bin"

Text with Arabic symbols and characters:
Input: "Arabic example: ﴿س﴾ ۝"
Output: "Arabic example"
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const cleanSymbolsAndPartReferences = (text: string): string => {
    return text.replace(
        / *\(?:\d+(?:\/\d+){0,2}\)? *| *\[\d+(?:\/\d+)?\] *| *«\d+» *|\d+\/\d+(?:\/\d+)?|[،§{}۝؍‎﴿﴾<>;_؟»«:!،؛\[\]…ـ¬\.\\\/\*\(\)"]/g,
        ' ',
    );
};

/**
 * removes -[46]-
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const cleanTrailingPageNumbers = (text: string): string => {
    return text.replace(/-\[\d+\]-/g, '');
};

/**
 * replaces one or more consecutive line breaks (either carriage returns \r or newlines \n) with a single space.
replaces two or more consecutive whitespace characters (which include spaces, tabs, line breaks, etc.) with a single space.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const lineBreaksToSpaces = (text: string): string => {
    return text.replace(/\s+/g, ' ');
};

/**
 * Removes all numeric digits from texts.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeAllDigits = (text: string): string => {
    return text.replace(/[0-9]/g, '');
};

/**
 * Removes text like "(d. 390H)" and "[d. 100h]"
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeDeathYear = (text: string): string => {
    return text.replace(/\[(d)\.\s*\d{1,4}[hH]\]\s*|\((d)\.\s*\d{1,4}[hH]\)\s*/g, '');
};

/**
 * Removes digits and dashes from the text.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeNumbersAndDashes = (text: string): string => {
    return text.replace(/[\d-]/g, '');
};

/**
 * Removes single digit references like (1), «2», [3].
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeSingleDigitReferences = (text: string): string => {
    return text.replace(/\(\d{1}\)|\[\d{1}\]|«\d»/g, '');
};

/**
 * removeUrls
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const removeUrls = (text: string): string => {
    return text.replace(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
        '',
    );
};
