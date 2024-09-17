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
