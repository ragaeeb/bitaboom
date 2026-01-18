type NormalizedWithMap = {
    normalized: string;
    map: number[];
};

type NormalizedMatch = { start: number; end: number };

type WordToken = { value: string; start: number; end: number };

/**
 * Checks whether a character is a lowercase Latin letter.
 */
export const isLatinLetter = (char: string) => char >= 'a' && char <= 'z';

/**
 * Checks whether a character is an Arabic letter.
 */
export const isArabicLetter = (char: string) => {
    const code = char.charCodeAt(0);
    return code >= 0x0600 && code <= 0x06ff;
};

/**
 * Checks whether a Unicode codepoint is an Arabic diacritic.
 */
export const isArabicDiacritic = (code: number) =>
    (code >= 0x064b && code <= 0x0652) ||
    code === 0x0670 ||
    (code >= 0x0617 && code <= 0x061a) ||
    (code >= 0x06d6 && code <= 0x06ed);

/**
 * Normalizes Latin text into a lightweight stream and preserves an index map
 * so we can replace in the original string without greedy over-capture.
 */
export const buildNormalizedLatin = (text: string): NormalizedWithMap => {
    const normalizedChars: string[] = [];
    const map: number[] = [];
    let lastWasSpace = true;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const folded = char.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

        for (let j = 0; j < folded.length; j++) {
            const lower = folded[j].toLowerCase();
            if (isLatinLetter(lower)) {
                normalizedChars.push(lower);
                map.push(i);
                lastWasSpace = false;
                continue;
            }

            if (lower === '3') {
                continue;
            }

            if (!lastWasSpace) {
                normalizedChars.push(' ');
                map.push(i);
                lastWasSpace = true;
            }
        }
    }

    return { normalized: normalizedChars.join(''), map };
};

/**
 * Normalizes Arabic text into a lightweight stream and preserves an index map
 * so we can replace in the original string without greedy over-capture.
 */
export const buildNormalizedArabic = (text: string): NormalizedWithMap => {
    const normalizedChars: string[] = [];
    const map: number[] = [];
    let lastWasSpace = true;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const code = char.charCodeAt(0);

        if (isArabicDiacritic(code)) {
            continue;
        }

        let normalized = char;
        if (char === 'أ' || char === 'إ' || char === 'آ') {
            normalized = 'ا';
        } else if (char === 'ى') {
            normalized = 'ي';
        } else if (char === 'ة') {
            normalized = 'ه';
        }

        if (isArabicLetter(normalized)) {
            normalizedChars.push(normalized);
            map.push(i);
            lastWasSpace = false;
            continue;
        }

        if (!lastWasSpace) {
            normalizedChars.push(' ');
            map.push(i);
            lastWasSpace = true;
        }
    }

    return { normalized: normalizedChars.join(''), map };
};

/**
 * Advances past consecutive spaces starting at the provided index.
 */
export const skipSpaces = (text: string, index: number) => {
    let i = index;
    while (i < text.length && text[i] === ' ') {
        i++;
    }
    return i;
};

/**
 * Consumes a normalized "salla..." prefix and returns the next index, or -1 if absent.
 */
export const consumeSalla = (text: string, index: number) => {
    let i = index;
    if (text[i] !== 's') {
        return -1;
    }
    i++;
    if (text[i] === 'a') {
        i++;
    }
    let lCount = 0;
    while (text[i] === 'l') {
        lCount++;
        i++;
    }
    if (lCount < 1) {
        return -1;
    }
    if (text[i] === 'a') {
        i++;
        if (text[i] === 'a') {
            i++;
        }
    }
    if (text[i] === 'l' && (!isLatinLetter(text[i + 1]) || text[i + 1] === ' ')) {
        i++;
    }
    if (text[i] === 'a' && text[i + 1] === 'h' && (text[i + 2] === 'u' || text[i + 2] === 'o')) {
        i += 3;
    } else if (text[i] === 'h') {
        i++;
        if (text[i] === 'u' || text[i] === 'o') {
            i++;
        }
    }
    return i;
};

/**
 * Consumes a normalized "allahu" chunk and returns the next index, or -1 if absent.
 */
export const consumeAllahu = (text: string, index: number) => {
    let i = index;
    let sawH = false;
    if (text[i] === 'a') {
        i++;
    }
    let lCount = 0;
    while (text[i] === 'l') {
        lCount++;
        i++;
    }
    if (lCount < 1) {
        return -1;
    }
    if (text[i] === 'a') {
        i++;
        if (text[i] === 'a') {
            i++;
        }
    }
    if (text[i] === 'h') {
        sawH = true;
        i++;
    }
    if (text[i] === 'u' || text[i] === 'o') {
        i++;
    }
    if (!sawH) {
        return -1;
    }
    if (lCount === 1) {
        const nextChar = text[i];
        if (nextChar === 'i' || nextChar === 'y') {
            return -1;
        }
    }
    return i;
};

/**
 * Consumes a normalized "alayhi" chunk and returns the next index, or -1 if absent.
 */
export const consumeAlayhi = (text: string, index: number) => {
    let i = index;
    if (text[i] === 'a') {
        i++;
        if (text[i] === 'a') {
            i++;
        }
    }
    if (text[i] !== 'l') {
        return -1;
    }
    i++;
    const start = i;
    const limit = Math.min(text.length, i + 6);
    while (i < limit && isLatinLetter(text[i])) {
        i++;
    }
    const chunk = text.slice(start, i);
    if (!chunk.includes('h')) {
        return -1;
    }
    if (!/[iy]/.test(chunk)) {
        return -1;
    }
    return i;
};

/**
 * Consumes a normalized "wa" connector and returns the next index, or -1 if absent.
 */
export const consumeWa = (text: string, index: number) => {
    if (text[index] !== 'w') {
        return -1;
    }
    return text[index + 1] === 'a' ? index + 2 : index + 1;
};

/**
 * Consumes a normalized "ala" chunk and returns the next index, or -1 if absent.
 */
export const consumeAla = (text: string, index: number) => {
    let i = index;
    if (text[i] !== 'a' || text[i + 1] !== 'l') {
        return -1;
    }
    i += 2;
    if (text[i] !== 'a') {
        return -1;
    }
    i++;
    if (text[i] === 'a') {
        i++;
    }
    return i;
};

/**
 * Consumes a normalized "sallam/salam" chunk and returns the next index, or -1 if absent.
 */
export const consumeSallam = (text: string, index: number) => {
    let i = index;
    if (text[i] !== 's') {
        return -1;
    }
    if (text[i + 1] === 's') {
        i++;
    }
    i++;
    if (text[i] !== 'a') {
        return -1;
    }
    i++;
    if (text[i] !== 'l') {
        return -1;
    }
    i++;
    if (text[i] === 'l') {
        i++;
    }
    if (text[i] !== 'a') {
        return -1;
    }
    i++;
    if (text[i] === 'a') {
        i++;
    }
    if (text[i] !== 'm') {
        return -1;
    }
    return i + 1;
};

/**
 * Consumes the optional family extension chunk (wa ala alihi) if present.
 */
export const consumeFamilyExtension = (text: string, index: number) => {
    let i = index;
    const waPos = consumeWa(text, i);
    if (waPos < 0) {
        return -1;
    }
    i = skipSpaces(text, waPos);
    const alaPos = consumeAla(text, i);
    if (alaPos >= 0) {
        i = skipSpaces(text, alaPos);
    }
    const alihiPos = consumeAlayhi(text, i);
    if (alihiPos < 0) {
        return -1;
    }
    return alihiPos;
};

/**
 * Attempts to match a full Latin salutation at the specified index.
 */
export const matchLatinAt = (text: string, start: number) => {
    let i = consumeSalla(text, start);
    if (i < 0) {
        return -1;
    }
    i = skipSpaces(text, i);
    const allahuPos = consumeAllahu(text, i);
    if (allahuPos >= 0) {
        i = skipSpaces(text, allahuPos);
    }
    const alayhiPos = consumeAlayhi(text, i);
    if (alayhiPos < 0) {
        return -1;
    }
    i = skipSpaces(text, alayhiPos);
    const familyPos = consumeFamilyExtension(text, i);
    if (familyPos >= 0) {
        i = skipSpaces(text, familyPos);
    }
    const waPos = consumeWa(text, i);
    if (waPos >= 0) {
        i = skipSpaces(text, waPos);
    }
    if (text[i] === 's' && text[i + 1] === ' ') {
        i = skipSpaces(text, i + 1);
    }
    const sallamPos = consumeSallam(text, i);
    if (sallamPos < 0) {
        return -1;
    }
    if (sallamPos < text.length && isLatinLetter(text[sallamPos])) {
        return -1;
    }
    return sallamPos;
};

/**
 * Finds all Latin salutation matches in the normalized stream.
 */
export const findLatinMatches = (normalized: string): NormalizedMatch[] => {
    const matches: NormalizedMatch[] = [];

    for (let i = 0; i < normalized.length; i++) {
        if (normalized[i] !== 's') {
            continue;
        }
        if (i > 0 && isLatinLetter(normalized[i - 1])) {
            continue;
        }
        const end = matchLatinAt(normalized, i);
        if (end > 0) {
            matches.push({ start: i, end });
            i = end - 1;
        }
    }

    return matches;
};

/**
 * Splits normalized Arabic text into word tokens, splitting leading و (waw) into its own token.
 */
export const tokenizeArabic = (normalized: string): WordToken[] => {
    const tokens: WordToken[] = [];
    let i = 0;

    while (i < normalized.length) {
        if (normalized[i] === ' ') {
            i++;
            continue;
        }
        const start = i;
        while (i < normalized.length && normalized[i] !== ' ') {
            i++;
        }
        const word = normalized.slice(start, i);
        if (word.startsWith('و') && word.length > 1) {
            tokens.push({ value: 'و', start, end: start + 1 });
            tokens.push({ value: word.slice(1), start: start + 1, end: i });
        } else {
            tokens.push({ value: word, start, end: i });
        }
    }

    return tokens;
};

/**
 * Checks if a normalized Arabic word is a form of "salla".
 */
export const isArabicSalla = (word: string) => word.startsWith('صل') && word.length <= 4;

/**
 * Checks if a normalized Arabic word is "Allah".
 */
export const isArabicAllah = (word: string) => word === 'الله' || word === 'هللا';

/**
 * Checks if a normalized Arabic word is "ta'ala".
 */
export const isArabicTaala = (word: string) => word === 'تعالى' || word === 'تعالي';

/**
 * Checks if a normalized Arabic word is "alayhi".
 */
export const isArabicAlayhi = (word: string) => word === 'عليه' || (word.endsWith('ليه') && word.length <= 4);

/**
 * Checks if a normalized Arabic word is the connector waw.
 */
export const isArabicWa = (word: string) => word === 'و';

/**
 * Checks if a normalized Arabic word is "ala".
 */
export const isArabicAla = (word: string) => word === 'على' || word === 'علي';

/**
 * Checks if a normalized Arabic word is "alihi/aalihi".
 */
export const isArabicAlihi = (word: string) => word === 'اله' || word === 'آله';

/**
 * Checks if a normalized Arabic word is a "sallam/salam" form.
 */
export const isArabicSallam = (word: string) => word === 'سلم' || word === 'سلام' || word === 'سلامه';

/**
 * Checks if a normalized Arabic word is "salat".
 */
export const isArabicSalat = (word: string) => word === 'الصلاه' || word === 'صلاه';

/**
 * Checks if a normalized Arabic word is "salam".
 */
export const isArabicSalam = (word: string) => word === 'السلام' || word === 'سلام' || word === 'سلامه';

/**
 * Checks if a normalized Arabic word is "salawat".
 */
export const isArabicSalawat = (word: string) => word === 'صلوات';

/**
 * Matches the primary Arabic salutation structure and returns the end token index.
 */
export const matchArabicPrimary = (tokens: WordToken[], start: number) => {
    let i = start;
    if (!isArabicSalla(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicAllah(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (isArabicTaala(tokens[i]?.value ?? '')) {
        i++;
    }
    if (!isArabicAlayhi(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (isArabicWa(tokens[i]?.value ?? '')) {
        let pos = i + 1;
        if (isArabicAla(tokens[pos]?.value ?? '')) {
            pos++;
        }
        if (isArabicAlihi(tokens[pos]?.value ?? '')) {
            i = pos + 1;
        }
    }
    if (isArabicWa(tokens[i]?.value ?? '')) {
        i++;
    }
    if (!isArabicSallam(tokens[i]?.value ?? '')) {
        return -1;
    }
    return i;
};

/**
 * Matches the alternative Arabic "alayhi al-salat wa al-salam" structure.
 */
export const matchArabicAlternative = (tokens: WordToken[], start: number) => {
    let i = start;
    if (!isArabicAlayhi(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicSalat(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (isArabicWa(tokens[i]?.value ?? '')) {
        i++;
    }
    if (!isArabicSalam(tokens[i]?.value ?? '')) {
        return -1;
    }
    return i;
};

/**
 * Matches the Arabic "salawat Allah wa salamuhu alayhi" structure.
 */
export const matchArabicSalawat = (tokens: WordToken[], start: number) => {
    let i = start;
    if (!isArabicSalawat(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicAllah(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (isArabicWa(tokens[i]?.value ?? '')) {
        i++;
    }
    if (!isArabicSalam(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicAlayhi(tokens[i]?.value ?? '')) {
        return -1;
    }
    return i;
};

/**
 * Matches the Arabic "salla wa sallam alayhi Allah" reverse structure.
 */
export const matchArabicReverse = (tokens: WordToken[], start: number) => {
    let i = start;
    if (!isArabicSalla(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (isArabicWa(tokens[i]?.value ?? '')) {
        i++;
    }
    if (!isArabicSallam(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicAlayhi(tokens[i]?.value ?? '')) {
        return -1;
    }
    i++;
    if (!isArabicAllah(tokens[i]?.value ?? '')) {
        return -1;
    }
    return i;
};

/**
 * Finds all Arabic salutation matches in the normalized stream.
 */
export const findArabicMatches = (normalized: string): NormalizedMatch[] => {
    const tokens = tokenizeArabic(normalized);
    const matches: NormalizedMatch[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const matchers = [matchArabicPrimary, matchArabicAlternative, matchArabicSalawat, matchArabicReverse];
        for (const matcher of matchers) {
            const endIndex = matcher(tokens, i);
            if (endIndex >= 0) {
                matches.push({ start: tokens[i].start, end: tokens[endIndex].end });
                i = endIndex;
                break;
            }
        }
    }

    return matches;
};

/**
 * Maps a normalized range to an original text span using the index map.
 * Returns null if the range is invalid or outside the map bounds.
 */
export const mapRangeToOriginal = (map: number[], start: number, end: number) => {
    if (start < 0 || end <= start || end > map.length) {
        return null;
    }
    const origStart = map[start];
    const lastIndex = map[end - 1];
    if (origStart === undefined || lastIndex === undefined) {
        return null;
    }
    return { origStart, origEnd: lastIndex + 1 };
};

/**
 * Expands a mapped Arabic span to include adjacent diacritics in the original text.
 */
export const expandArabicDiacritics = (text: string, start: number, end: number) => {
    let origStart = start;
    let origEnd = end;
    while (origStart > 0 && isArabicDiacritic(text.charCodeAt(origStart - 1))) {
        origStart--;
    }
    while (origEnd < text.length && isArabicDiacritic(text.charCodeAt(origEnd))) {
        origEnd++;
    }
    return { origStart, origEnd };
};
