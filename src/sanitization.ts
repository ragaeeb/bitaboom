/**
 * Removes various symbols, part references, and numerical markers from the text.
 * Example: '(1) (2/3)' becomes ''.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with symbols and part references removed.
 */
export const cleanSymbolsAndPartReferences = (text: string) => {
    return text.replace(
        / *\(?:\d+(?:\/\d+){0,2}\)? *| *\[\d+(?:\/\d+)?\] *| *«\d+» *|\d+\/\d+(?:\/\d+)?|[،§{}۝؍‎﴿﴾<>;_؟»«:!،؛[\]…ـ¬.\\/*()"]/g,
        ' ',
    );
};

/**
 * Removes trailing page numbers formatted as '-[46]-' from the text.
 * Example: 'This is some -[46]- text' becomes 'This is some text'.
 * @param {string} text - The input text with trailing page numbers.
 * @returns {string} - The modified text with page numbers removed.
 */
export const cleanTrailingPageNumbers = (text: string) => {
    return text.replace(/-\[\d+\]-/g, '');
};

/**
 * Replaces consecutive line breaks and whitespace characters with a single space.
 * Example: 'a\nb' becomes 'a b'.
 * @param {string} text - The input text containing line breaks or multiple spaces.
 * @returns {string} - The modified text with spaces.
 */
export const replaceLineBreaksWithSpaces = (text: string) => {
    return text.replace(/\s+/g, ' ');
};

/**
 * Removes all numeric digits from the text.
 * Example: 'abc123' becomes 'abc'.
 * @param {string} text - The input text containing digits.
 * @returns {string} - The modified text with digits removed.
 */
export const stripAllDigits = (text: string) => {
    return text.replace(/[0-9]/g, '');
};

/**
 * Removes death year references like "(d. 390H)" and "[d. 100h]" from the text.
 * Example: 'Sufyān ibn ‘Uyaynah (d. 198h)' becomes 'Sufyān ibn ‘Uyaynah'.
 * @param {string} text - The input text containing death year references.
 * @returns {string} - The modified text with death years removed.
 */
export const removeDeathYear = (text: string) => {
    return text.replace(/\[(d)\.\s*\d{1,4}[hH]\]\s*|\((d)\.\s*\d{1,4}[hH]\)\s*/g, '');
};

/**
 * Removes numeric digits and dashes from the text.
 * Example: 'ABC 123-Xyz' becomes 'ABC Xyz'.
 * @param {string} text - The input text containing digits and dashes.
 * @returns {string} - The modified text with numbers and dashes removed.
 */
export const removeNumbersAndDashes = (text: string) => {
    return text.replace(/[\d-]/g, '');
};

/**
 * Removes single digit references like (1), «2», [3] from the text.
 * Example: 'Ref (1), Ref «2», Ref [3]' becomes 'Ref , Ref , Ref '.
 * @param {string} text - The input text containing single digit references.
 * @returns {string} - The modified text with single digit references removed.
 */
export const removeSingleDigitReferences = (text: string) => {
    return text.replace(/\(\d{1}\)|\[\d{1}\]|«\d»/g, '');
};

/**
 * Removes URLs from the text.
 * Example: 'Visit https://example.com' becomes 'Visit '.
 * @param {string} text - The input text containing URLs.
 * @returns {string} - The modified text with URLs removed.
 */
export const removeUrls = (text: string) => {
    return text.replace(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
        '',
    );
};

/**
 * Removes common Markdown formatting syntax from text
 * @param text - The input text containing Markdown formatting
 * @returns Text with Markdown formatting removed (bold, italics, headers, lists, backticks)
 */
export const removeMarkdownFormatting = (text: string) => {
    return (
        text
            // Remove bold first (**text**) - must come before italics
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            // Remove bold with underscores (__text__)
            .replace(/__([^_]+)__/g, '$1')
            // Remove italics (*text*)
            .replace(/\*([^*]+)\*/g, '$1')
            // Remove italics with underscores (_text_)
            .replace(/_([^_]+)_/g, '$1')
            // Remove strikethrough (~~text~~)
            .replace(/~~([^~]+)~~/g, '$1')
            // Remove blockquotes
            .replace(/^\s*>\s?/gm, '')
            // Remove images ![alt](url)
            .replace(/!\[[^\]]*]\([^)]*\)/g, '')
            // Convert links [text](url) -> text
            .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
            // Remove headers (# ## ### etc.)
            .replace(/^#+\s*/gm, '')
            // Remove unordered list markers (- * +)
            .replace(/^\s*[-*+]\s+/gm, '')
            // Remove ordered list markers (1. 2. etc.)
            .replace(/^\s*\d+\.\s+/gm, '')
            // Remove backticks
            .replace(/`/gm, '')
    );
};

/**
 * Truncates a string to a specified length, adding an ellipsis if truncated.
 *
 * @param val - The string to truncate
 * @param n - Maximum length of the string (default: 150)
 * @returns The truncated string with ellipsis if needed, otherwise the original string
 *
 * @example
 * ```javascript
 * truncate('The quick brown fox jumps over the lazy dog', 20);
 * // Output: 'The quick brown fox…'
 *
 * truncate('Short text', 50);
 * // Output: 'Short text'
 * ```
 */
export const truncate = (val: string, n = 150): string => (val.length > n ? `${val.substring(0, n - 1)}…` : val);

/**
 * Truncates a string from the middle, preserving both the beginning and end portions.
 *
 * @param text - The string to truncate
 * @param maxLength - Maximum length of the resulting string (default: 50)
 * @param endLength - Number of characters to preserve at the end (default: 1/3 of maxLength, minimum 3)
 * @returns The truncated string with ellipsis in the middle if needed, otherwise the original string
 *
 * @example
 * ```javascript
 * truncateMiddle('The quick brown fox jumps right over the lazy dog', 20);
 * // Output: 'The quick bro…zy dog'
 *
 * truncateMiddle('The quick brown fox jumps right over the lazy dog', 25, 8);
 * // Output: 'The quick brown …lazy dog'
 *
 * truncateMiddle('Short text', 50);
 * // Output: 'Short text'
 * ```
 */
export const truncateMiddle = (text: string, maxLength: number = 50, endLength?: number) => {
    if (text.length <= maxLength) {
        return text;
    }

    // Default end length is roughly 1/3 of max length, minimum 3 characters
    const defaultEndLength = Math.max(3, Math.floor(maxLength / 3));
    const actualEndLength = endLength ?? defaultEndLength;

    // Reserve space for the ellipsis character (1 char)
    const availableLength = maxLength - 1;

    // Calculate start length (remaining space after end portion)
    const startLength = availableLength - actualEndLength;

    // Ensure we have at least some characters at the start
    if (startLength < 1) {
        // If we can't fit both start and end, just truncate normally
        return `${text.substring(0, maxLength - 1)}…`;
    }

    const startPortion = text.substring(0, startLength);
    const endPortion = text.substring(text.length - actualEndLength);

    return `${startPortion}…${endPortion}`;
};

/**
 * Unescapes backslash-escaped spaces and trims whitespace from both ends.
 * Commonly used to clean file paths that have been escaped when pasted into terminals.
 *
 * @param input - The string to unescape and clean
 * @returns The cleaned string with escaped spaces converted to regular spaces and trimmed
 *
 * @example
 * ```javascript
 * unescapeSpaces('My\\ Folder\\ Name');
 * // Output: 'My Folder Name'
 *
 * unescapeSpaces('  /path/to/My\\ Document.txt  ');
 * // Output: '/path/to/My Document.txt'
 *
 * unescapeSpaces('regular text');
 * // Output: 'regular text'
 * ```
 */
export const unescapeSpaces = (input: string) => input.replace(/\\ /g, ' ').trim();

/**
 * Arabic diacritics (Tashkeel/Harakat).
 */
const DIACRITICS_CLASS = '[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]';

/**
 * Groups of equivalent Arabic characters — any character in a group should match
 * any other character in the same group.
 */
const EQUIV_GROUPS: string[][] = [
    ['\u0627', '\u0622', '\u0623', '\u0625'], // ا, آ, أ, إ
    ['\u0629', '\u0647'], // ة <-> ه
    ['\u0649', '\u064A'], // ى <-> ي
];

/** Escape regex special characters (if the search word contains punctuation). */
const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Return a character class for a char if it belongs to an equivalence group. */
const getEquivClass = (ch: string): string => {
    for (const group of EQUIV_GROUPS) {
        if (group.includes(ch)) {
            // join the group's members into a character class
            return `[${group.map((c) => escapeForRegex(c)).join('')}]`;
        }
    }
    // not in equivalence groups -> return escaped character
    return escapeForRegex(ch);
};

/** Small safe normalization: NFC, remove ZWJ/ZWNJ, collapse spaces. */
const normalizeArabicLight = (str: string) => {
    return str
        .normalize('NFC')
        .replace(/[\u200C\u200D]/g, '') // remove ZWJ/ZWNJ
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Creates a diacritic-insensitive regex pattern for Arabic text matching.
 * Normalizes text, handles character equivalences (ا/آ/أ/إ, ة/ه, ى/ي),
 * and makes each character tolerant of Arabic diacritics (Tashkeel/Harakat)
 * @param text - Input Arabic text to make diacritic-insensitive
 * @returns Regex pattern string that matches the text with or without diacritics and character variants
 */
export const makeDiacriticInsensitive = (text: string) => {
    const diacriticsMatcher = `${DIACRITICS_CLASS}*`;
    const norm = normalizeArabicLight(text);
    // Use Array.from to iterate grapheme-safe over the string (works fine for Arabic letters)
    return Array.from(norm)
        .map((ch) => getEquivClass(ch) + diacriticsMatcher)
        .join('');
};
