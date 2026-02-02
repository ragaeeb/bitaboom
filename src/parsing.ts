/**
 * Converts a string that resembles JSON but with numeric keys and single-quoted values
 * into valid JSON format. This function replaces numeric keys with quoted numeric keys
 * and ensures all values are double-quoted as required by JSON.
 *
 * @param {string} str - The input string that needs to be fixed into valid JSON.
 * @returns {string} - A valid JSON string.
 *
 * @example
 * const result = normalizeJsonSyntax("{10: 'abc', 20: 'def'}");
 * console.log(result); // '{"10": "abc", "20": "def"}'
 */
export const normalizeJsonSyntax = (str: string) => {
    let input = str.replace(/(\b\d+\b)(?=:)/g, '"$1"');
    input = input.replace(/:\s*'([^']+)'/g, ': "$1"');
    input = input.replace(/:\s*"([^"]+)"/g, ': "$1"');

    return JSON.stringify(JSON.parse(input));
};

/**
 * Checks if a given string resembles a JSON object with numeric or quoted keys and values
 * that are single or double quoted. This is useful for detecting malformed JSON-like
 * structures that can be fixed by the `normalizeJsonSyntax` function.
 *
 * @param {string} str - The input string to check.
 * @returns {boolean} - Returns true if the string is JSON-like, false otherwise.
 *
 * @example
 * const result = isJsonStructureValid("{10: 'abc', 'key': 'value'}");
 * console.log(result); // true
 */
export const isJsonStructureValid = (str: string) => {
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
 * const result = splitByQuotes('"This is" "a part of the" "string and"');
 * console.log(result); // ["This is", "a part of the", "string and"]
 */
export const splitByQuotes = (query: string): string[] => {
    const regex = /(?:[^\s"]+|"(.*?)")+/g;
    return (query.match(regex) || []).map((s: string) => (s.startsWith('"') ? s.slice(1, -1) : s));
};

/**
 * Checks if all double quotes in a string are balanced (even count).
 * A string has balanced quotes if every opening quote has a corresponding closing quote.
 *
 * @param str - The string to check for balanced quotes
 * @returns True if quotes are balanced (even count), false otherwise
 *
 * @example
 * ```typescript
 * areQuotesBalanced('Hello "world"') // Returns: true
 * areQuotesBalanced('Hello "world') // Returns: false
 * areQuotesBalanced('No quotes') // Returns: true
 * ```
 */
const areQuotesBalanced = (str: string) => {
    let quoteCount = 0;
    for (const char of str) {
        if (char === '"') {
            quoteCount++;
        }
    }
    return quoteCount % 2 === 0;
};

const brackets = { '(': ')', '[': ']', '{': '}' };
const openBrackets = new Set(['(', '[', '{']);
const closeBrackets = new Set([')', ']', '}']);

/**
 * Checks if all brackets in a string are properly balanced and matched.
 * This function validates that every opening bracket has a corresponding closing bracket
 * in the correct order and of the matching type.
 *
 * Supported bracket types: parentheses (), square brackets [], curly braces {}
 *
 * @param str - The string to check for balanced brackets
 * @returns True if all brackets are properly balanced and matched, false otherwise
 *
 * @example
 * ```typescript
 * areBracketsBalanced('(hello [world])') // Returns: true
 * areBracketsBalanced('(hello [world)') // Returns: false (mismatched)
 * areBracketsBalanced('((hello))') // Returns: true
 * areBracketsBalanced('(hello') // Returns: false (unclosed)
 * ```
 */

const areBracketsBalanced = (str: string) => {
    const stack: string[] = [];

    for (const char of str) {
        if (openBrackets.has(char)) {
            stack.push(char);
        } else if (closeBrackets.has(char)) {
            const lastOpen = stack.pop();
            if (!lastOpen || brackets[lastOpen as keyof typeof brackets] !== char) {
                return false;
            }
        }
    }

    return stack.length === 0;
};

/**
 * Checks if both quotes and brackets are balanced in a string.
 * This function combines quote balance checking and bracket balance checking
 * to ensure the entire string has properly balanced punctuation.
 *
 * A string is considered balanced when:
 * - All double quotes have matching pairs (even count)
 * - All brackets (parentheses, square brackets, curly braces) are properly matched and nested
 *
 * @param str - The string to check for balanced quotes and brackets
 * @returns True if both quotes and brackets are balanced, false otherwise
 *
 * @example
 * ```typescript
 * isBalanced('He said "Hello (world)!"') // Returns: true
 * isBalanced('He said "Hello (world!"') // Returns: false (unbalanced quote)
 * isBalanced('He said "Hello (world)"') // Returns: false (unbalanced quote)
 * isBalanced('Hello (world) [test]') // Returns: true
 * ```
 */
export const isBalanced = (str: string) => {
    return areQuotesBalanced(str) && areBracketsBalanced(str);
};

/**
 * Parses page input string into array of page numbers, supporting ranges and lists
 * @param pageInput - Page specification string (e.g., "1-5" or "1,3,5")
 * @returns Array of page numbers
 * @throws Error when start page exceeds end page in range
 */
export const parsePageRanges = (pageInput: string): number[] => {
    const parts = pageInput.split(',');
    const result: number[] = [];

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) {
            continue;
        }

        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(Number);

            if (start > end) {
                throw new Error('Start page cannot be greater than end page');
            }

            for (let i = start; i <= end; i++) {
                result.push(i);
            }
        } else {
            result.push(Number(trimmed));
        }
    }

    return result;
};

/**
 * Converts a time string to seconds
 * @param str - Time string in "HH:MM:SS", "MM:SS", or number format
 * @returns Total seconds as a number
 */
export const timeToSeconds = (str: string) => {
    const parts = str.split(':').map((p) => parseInt(p, 10));

    if (parts.length === 3) {
        return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
    }

    if (parts.length === 2) {
        return parts[0]! * 60 + parts[1]!;
    }
    return parseInt(str, 10) || 0;
};
