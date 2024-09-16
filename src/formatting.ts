export const addLineBreaksAfterPunctuation = (text: string): string => {
    // Define the punctuation marks that should trigger a new line
    const punctuation = /([.?!؟])/g;

    // Replace occurrences of punctuation marks followed by a space with the punctuation mark, a newline, and the space
    const formattedText = text.replace(punctuation, '$1\n').replace(/\n\s+/g, '\n').trim();

    return formattedText;
};

/**
 * Turns regular double quotes surrounding a body of text into fancy smart quotes. Then it looks for the character `”` (a closing double quotation mark) at the beginning of a string.
 * If found, it replaces it with the character `“` (an opening double quotation mark).
 * This rule ensures that if a string starts with a closing quotation mark (which is typically an error or oversight), it gets corrected to start with an opening quotation mark.
 * The `^` in the regex pattern signifies the beginning of a string. The rule only matches if the closing quotation mark is the very first character in the string.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const applySmartQuotes = (text: string): string => {
    return text
        .replace(/[“”]/g, '"')
        .replace(/"([^"]*)"/g, '“$1”')
        .replace(/^”/g, '“');
};

export const formatStringBySentence = (input: string): string => {
    const footnoteRegex = /^\((?:\d+|۱|۲|۳|۴|۵|۶|۷|۸|۹)\)\s/;
    const sentences: string[] = [];
    const lines = input.split('\n');
    let currentSentence = '';

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        const isFootnote = footnoteRegex.test(trimmedLine);
        const isNumber = /^\(\d+\/\d+\)/.test(trimmedLine);

        if (isFootnote && !isNumber) {
            if (currentSentence) {
                sentences.push(currentSentence.trim());
                currentSentence = '';
            }
            sentences.push(trimmedLine);
        } else {
            currentSentence += `${trimmedLine} `;
            const lastChar = currentSentence.trim().slice(-1);
            if (/[.!؟]/.test(lastChar)) {
                sentences.push(currentSentence.trim());
                currentSentence = '';
            }
        }
    });

    // Add any remaining text to the output
    if (currentSentence) {
        sentences.push(currentSentence.trim());
    }

    return sentences.join('\n');
};

/**
 * remove trailing spaces on multilines
Trims each line in a paragraph. For example something like
" This is the first line  \n    This is the second line    "
 would turn into "This is the first line\nThis is the second line".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const cleanMultilines = (text: string): string => {
    return text.replace(/^ +| +$/gm, '');
};

/**
 * Cleans unnecessary spaces before punctuation from text.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const cleanSpacesBeforePeriod = (text: string): string => {
    return text.replace(/\s+([.؟!,،؛:?])/g, '$1');
};

/**
 * Reduces multiple (3 or more) consecutive line breaks to exactly 2 line breaks.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const condenseMultilinesToDouble = (text: string): string => {
    return text.replace(/(\n\s*){3,}/g, '\n\n');
};

/**
 * Reduces multiple (2 or more) consecutive line breaks to exactly 1 line break.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const condenseMultilinesToSingle = (text: string): string => {
    return text.replace(/(\n\s*){2,}/g, '\n');
};

/**
 * Replaces multiple spaces or tabs by a single space.

For example something like "This is a   text" would turn into "This is a text"
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const reduceSpaces = (text: string): string => {
    return text.replace(/[ \t]+/g, ' ');
};

export const removeItalics = (text: string): string => {
    const italicMap: Record<string, string> = {
        '\uD835\uDC46': 'A',
        '\uD835\uDC47': 'B',
        '\uD835\uDC48': 'C',
        '\uD835\uDC49': 'D',
        '\uD835\uDC4A': 'E',
        '\uD835\uDC4B': 'F',
        '\uD835\uDC4C': 'G',
        '\uD835\uDC4D': 'H',
        '\uD835\uDC4E': 'I',
        '\uD835\uDC4F': 'J',
        '\uD835\uDC50': 'K',
        '\uD835\uDC51': 'L',
        '\uD835\uDC52': 'M',
        '\uD835\uDC53': 'N',
        '\uD835\uDC54': 'O',
        '\uD835\uDC55': 'P',
        '\uD835\uDC56': 'Q',
        '\uD835\uDC57': 'R',
        '\uD835\uDC58': 'S',
        '\uD835\uDC59': 'T',
        '\uD835\uDC5A': 'U',
        '\uD835\uDC5B': 'V',
        '\uD835\uDC5C': 'W',
        '\uD835\uDC5D': 'X',
        '\uD835\uDC5E': 'Y',
        '\uD835\uDC5F': 'Z',
        '\uD835\uDC62': 'a',
        '\uD835\uDC63': 'b',
        '\uD835\uDC64': 'c',
        '\uD835\uDC65': 'd',
        '\uD835\uDC66': 'e',
        '\uD835\uDC67': 'f',
        '\uD835\uDC68': 'g',
        '\uD835\uDC69': 'h',
        '\uD835\uDC6A': 'i',
        '\uD835\uDC6B': 'j',
        '\uD835\uDC6C': 'k',
        '\uD835\uDC6D': 'l',
        '\uD835\uDC6E': 'm',
        '\uD835\uDC6F': 'n',
        '\uD835\uDC70': 'o',
        '\uD835\uDC71': 'p',
        '\uD835\uDC72': 'q',
        '\uD835\uDC73': 'r',
        '\uD835\uDC74': 's',
        '\uD835\uDC75': 't',
        '\uD835\uDC76': 'u',
        '\uD835\uDC77': 'v',
        '\uD835\uDC78': 'w',
        '\uD835\uDC79': 'x',
        '\uD835\uDC7A': 'y',
        '\uD835\uDC7B': 'z',
        '\u{1D63C}': '!',
        '\u{1D63D}': '?',
        '\u{1D63F}': ',',
        '\u{1D640}': '.',
        '\u{1D647}': '-',
    };

    return text.replace(/[\uD835\uDC62-\uD835\uDC7B\uD835\uDC46-\uD835\uDC5F\u{1D63C}-\u{1D647}]/gu, (match) => {
        return italicMap[match] || match;
    });
};

export const removeBoldStyling = (text: string): string => {
    // Normalize the string to NFKD form
    const normalizedString = text.normalize('NFKD');

    // Remove combining marks (diacritics) and stylistic characters from the string
    return normalizedString.replace(/[\u0300-\u036f]/g, '').trim();
};

export const removeStyling = (text: string): string => {
    return removeItalics(removeBoldStyling(text));
};
