/**
 * Adds line breaks after punctuation marks such as periods, exclamation points, and question marks.
 * Example: 'Text.' becomes 'Text.\n'.
 * @param {string} text - The input text containing punctuation.
 * @returns {string} - The modified text with line breaks added after punctuation.
 */
export const insertLineBreaksAfterPunctuation = (text: string): string => {
    // Define the punctuation marks that should trigger a new line
    const punctuation = /([.?!؟])/g;

    // Replace occurrences of punctuation marks followed by a space with the punctuation mark, a newline, and the space
    const formattedText = text.replace(punctuation, '$1\n').replace(/\n\s+/g, '\n').trim();

    return formattedText;
};

/**
 * Adds spaces before and after punctuation, except for certain cases like quoted text or ayah references.
 * Example: 'Text,word' becomes 'Text, word'.
 * @param {string} text - The input text containing punctuation.
 * @returns {string} - The modified text with spaces added before and after punctuation.
 */
export const addSpaceBeforeAndAfterPunctuation = (text: string): string => {
    return text
        .replace(/( ?)([.!?,،؟;؛])((?![ '”“\)"\]\n])|(?=\s{2,}))/g, '$1$2 ')
        .replace(/\s([.!?,،؟;؛])\s*([ '”“\)"\]\n])/g, '$1$2')
        .replace(/([^\s\w\d'”“\)"\]]+)\s+([.!?,،؟;؛])|([.!?,،؟;؛])\s+$/g, '$1$2$3')
        .replace(/(?<=\D)( ?: ?)(?!(\d+:)|(:\d+))|(?<=\d) ?: ?(?=\D)|(?<=\D) ?: ?(?=\d)/g, ': ');
};

/**
 * Turns regular double quotes surrounding a body of text into smart quotes.
 * Also fixes incorrect starting quotes by ensuring the string starts with an opening quote if needed.
 * Example: 'The "quick brown" fox' becomes 'The “quick brown” fox'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with smart quotes applied.
 */
export const applySmartQuotes = (text: string): string => {
    return text
        .replace(/[“”]/g, '"')
        .replace(/"([^"]*)"/g, '“$1”')
        .replace(/^”/g, '“');
};

/**
 * Replaces literal new line characters (\n) and carriage returns (\r) with actual line breaks.
 * Example: 'A\\nB' becomes 'A\nB'.
 * @param {string} text - The input text containing literal new lines.
 * @returns {string} - The modified text with actual line breaks.
 */
export const cleanLiteralNewLines = (text: string): string => {
    return text.replace(/\\n|\r/g, '\n');
};

/**
 * Removes trailing spaces from each line in a multiline string.
 * Example: " This is a line   \nAnother line   " becomes "This is a line\nAnother line".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with trailing spaces removed.
 */
export const cleanMultilines = (text: string): string => {
    return text.replace(/^ +| +$/gm, '');
};

/**
 * Checks if the input string consists of only punctuation characters.
 * @param {string} text - The input text to check.
 * @returns {boolean} - Returns true if the string contains only punctuation, false otherwise.
 */
export const isOnlyPunctuation = (text: string): boolean => {
    const regex = /^[\u0020-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007e0-9٠-٩]+$/;
    return regex.test(text);
};

export const cleanJunkFromText = (text: string): string => {
    const newBody = cleanMultilines(text);
    const lines = newBody.split('\n').filter((line) => {
        return !line || (line.length > 1 && !isOnlyPunctuation(line));
    });

    return lines.join('\n').trim();
};

/**
 * Cleans unnecessary spaces before punctuation marks such as periods, commas, and question marks.
 * Example: 'This is a sentence , with extra space .' becomes 'This is a sentence, with extra space.'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with cleaned spaces before punctuation.
 */
export const cleanSpacesBeforePeriod = (text: string): string => {
    return text.replace(/\s+([.؟!,،؛:?])/g, '$1');
};

/**
 * Condenses multiple asterisks (*) into a single one.
 * Example: '***' becomes '*'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed asterisks.
 */
export const condenseAsterisks = (text: string): string => {
    return text.replace(/(\*\s*)+/g, '*');
};

/**
 * Replaces occurrences of colons surrounded by periods (e.g., '.:.' or ':') with a single colon.
 * Example: 'This.:. is a test' becomes 'This: is a test'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed colons.
 */
export const condenseColons = (text: string): string => {
    return text.replace(/[\.-]?:[\.-]?/g, ':');
};

/**
 * Condenses two or more dashes (--) into a single dash (-).
 * Example: 'This is some ---- text' becomes 'This is some - text'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed dashes.
 */
export const condenseDashes = (text: string): string => {
    return text.replace(/-{2,}/g, '-');
};

/**
 * Replaces sequences of two or more periods (e.g., '...') with an ellipsis character (…).
 * Example: 'This is a test...' becomes 'This is a test…'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with ellipses condensed.
 */
export const condenseEllipsis = (text: string): string => {
    return text.replace(/\.{2,}/g, '…');
};

/**
 * Reduces multiple consecutive line breaks (3 or more) to exactly 2 line breaks.
 * Example: 'This is line 1\n\n\n\nThis is line 2' becomes 'This is line 1\n\nThis is line 2'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed line breaks.
 */
export const reduceMultilineBreaksToDouble = (text: string): string => {
    return text.replace(/(\n\s*){3,}/g, '\n\n');
};

/**
 * Reduces multiple consecutive line breaks (2 or more) to exactly 1 line break.
 * Example: 'This is line 1\n\nThis is line 2' becomes 'This is line 1\nThis is line 2'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed line breaks.
 */
export const reduceMultilineBreaksToSingle = (text: string): string => {
    return text.replace(/(\n\s*){2,}/g, '\n');
};

/**
 * Condenses multiple periods separated by spaces (e.g., '. . .') into a single period.
 * Example: 'This . . . is a test' becomes 'This. is a test'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed periods.
 */
export const condensePeriods = (text: string): string => {
    return text.replace(/\. +\./g, '.');
};

/**
 * Condenses multiple underscores (__) or Arabic Tatweel characters (ـــــ) into a single underscore or Tatweel.
 * Example: 'This is ـــ some text __' becomes 'This is ـ some text _'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed underscores.
 */
export const condenseUnderscores = (text: string): string => {
    return text.replace(/ـ{2,}/g, 'ـ').replace(/_+/g, '_');
};

/**
 * Replaces double parentheses or brackets with single ones.
 * Example: '((text))' becomes '(text)'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with condensed brackets.
 */
export const doubleToSingleBrackets = (text: string): string => {
    return text.replace(/(\(|\)){2,}|(\[|\]){2,}/g, '$1$2');
};

/**
 * Formats a multiline string by joining sentences and maintaining footnotes on their own lines.
 * Footnotes are identified by Arabic and English numerals.
 * Example: 'Sentence one.\n(1) A footnote.\nSentence two.' remains the same, while regular sentences are joined.
 * @param {string} input - The input text containing sentences and footnotes.
 * @returns {string} - The formatted text.
 */
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
 * Removes unnecessary spaces around slashes in references.
 * Example: '127 / 11' becomes '127/11'.
 * @param {string} text - The input text containing references.
 * @returns {string} - The modified text with spaces removed around slashes.
 */
export const normalizeSlashInReferences = (text: string): string => {
    return text.replace(/(\d+)\s?\/\s?(\d+)/g, '$1/$2');
};

/**
 * Reduces multiple spaces or tabs to a single space.
 * Example: 'This   is a   text' becomes 'This is a text'.
 * @param {string} text - The input text containing extra spaces.
 * @returns {string} - The modified text with reduced spaces.
 */
export const normalizeSpaces = (text: string): string => {
    return text.replace(/[ \t]+/g, ' ');
};

/**
 * Removes spaces inside brackets, parentheses, or square brackets.
 * Example: '( a b )' becomes '(a b)'.
 * @param {string} text - The input text with spaces inside brackets.
 * @returns {string} - The modified text with spaces removed inside brackets.
 */
export const removeSpaceInsideBrackets = (text: string): string => {
    return text.replace(/([\[\(])\s*(.*?)\s*([\]\)])/g, '$1$2$3');
};

/**
 * Removes bold styling from text by normalizing the string and removing stylistic characters.
 * @param {string} text - The input text containing bold characters.
 * @returns {string} - The modified text with bold styling removed.
 */
export const stripBoldStyling = (text: string): string => {
    // Normalize the string to NFKD form
    const normalizedString = text.normalize('NFKD');

    // Remove combining marks (diacritics) and stylistic characters from the string
    return normalizedString.replace(/[\u0300-\u036f]/g, '').trim();
};

/**
 * Removes italicized characters by replacing italic Unicode characters with their normal counterparts.
 * Example: '𝘼𝘽𝘾' becomes 'ABC'.
 * @param {string} text - The input text containing italicized characters.
 * @returns {string} - The modified text with italics removed.
 */
export const stripItalicsStyling = (text: string): string => {
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

/**
 * Removes all bold and italic styling from the input text.
 * @param {string} text - The input text to remove styling from.
 * @returns {string} - The modified text with all styling removed.
 */
export const stripStyling = (text: string): string => {
    return stripItalicsStyling(stripBoldStyling(text));
};

/**
 * Removes unnecessary spaces inside quotes.
 * Example: '“ Text ”' becomes '“Text”'.
 * @param {string} text - The input text with spaces inside quotes.
 * @returns {string} - The modified text with spaces removed inside quotes.
 */
export const trimSpaceInsideQuotes = (text: string): string => {
    return text.replace(/([“”"]|«) *(.*?) *([“”"]|»)/g, '$1$2$3');
};
