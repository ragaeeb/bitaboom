/**
 * Converts a string that resembles JSON but with numeric keys and single-quoted values
 * into valid JSON format. This function replaces numeric keys with quoted numeric keys
 * and ensures all values are double-quoted as required by JSON.
 *
 * @param {string} str - The input string that needs to be fixed into valid JSON.
 * @returns {string} - A valid JSON string.
 *
 * @example
 * const result = fixJson("{10: 'abc', 20: 'def'}");
 * console.log(result); // '{"10": "abc", "20": "def"}'
 */
export const fixJson = (str: string): string => {
    let input = str.replace(/(\b\d+\b)(?=:)/g, '"$1"');
    input = input.replace(/:\s*'([^']+)'/g, ': "$1"');
    input = input.replace(/:\s*"([^"]+)"/g, ': "$1"');

    return JSON.stringify(JSON.parse(input));
};

/**
 * Checks if a given string resembles a JSON object with numeric or quoted keys and values
 * that are single or double quoted. This is useful for detecting malformed JSON-like
 * structures that can be fixed by the `fixJson` function.
 *
 * @param {string} str - The input string to check.
 * @returns {boolean} - Returns true if the string is JSON-like, false otherwise.
 *
 * @example
 * const result = isJsonLike("{10: 'abc', 'key': 'value'}");
 * console.log(result); // true
 */
export const isJsonLike = (str: string): boolean => {
    // Checks for a pattern with numeric keys or quoted keys and values in quotes
    const jsonLikePattern =
        /^{(\s*(\d+|'[^']*'|"[^"]*")\s*:\s*('|")[^'"]*\3\s*,)*(?:\s*(\d+|'[^']*'|"[^"]*")\s*:\s*('|")[^'"]*\5\s*)}$/;
    return jsonLikePattern.test(str.trim());
};

/**
 * Splits a string by spaces and quoted substrings.
 *
 * This function takes an input string and splits it into parts where substrings
 * enclosed in double quotes are treated as a single part. Other substrings
 * separated by spaces are split normally.
 *
 * @param {string} query - The input string to be split.
 * @returns {string[]} An array of strings, with quoted substrings kept intact.
 *
 * @example
 * // Example usage:
 * const result = splitByQuotes('"This is" "a part of the" "string and"');
 * console.log(result); // ["This is", "a part of the", "string and"]
 */
export const splitByQuotes = (query: string): string[] => {
    const regex = /(?:[^\s"]+|"(.*?)")+/g;
    return (query.match(regex) || []).map((s: string) => (s.startsWith('"') ? s.slice(1, -1) : s));
};
