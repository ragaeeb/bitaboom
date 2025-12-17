/** Character class for Arabic diacritics (tashkīl/harakāt). */
const DIACRITICS_CLASS = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]';
/** Tatweel (kashīda) class. */
const TATWEEL_CLASS = '\\u0640';

/**
 * Escape a string so it can be safely embedded into a RegExp source.
 *
 * @param s Any string
 * @returns Escaped string
 */
export const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Optional equivalence toggles for {@link makeDiacriticInsensitiveRegex}. */
type EquivOptions = {
    /** Treat ا/أ/إ/آ as equivalent. @default true */
    alif?: boolean;
    /** Treat ة/ه as equivalent. @default true */
    taMarbutahHa?: boolean;
    /** Treat ى/ي as equivalent. @default true */
    alifMaqsurahYa?: boolean;
};

/** Options for {@link makeDiacriticInsensitiveRegex}. */
export type MakeRegexOptions = {
    /**
     * Character equivalences to allow.
     * @default { alif: true, taMarbutahHa: true, alifMaqsurahYa: true }
     */
    equivalences?: EquivOptions;

    /**
     * Allow tatweel between letters (tolerate decorative elongation).
     * @default true
     */
    allowTatweel?: boolean;

    /**
     * Ignore diacritics by inserting a `DIACRITICS_CLASS*` after each letter.
     * @default true
     */
    ignoreDiacritics?: boolean;

    /**
     * Treat any whitespace in the needle as `\s+` for flexible matching.
     * @default true
     */
    flexWhitespace?: boolean;

    /**
     * RegExp flags to use.
     * @default 'u'
     */
    flags?: string;
};

/**
 * Build a **diacritic-insensitive**, **tatweel-tolerant** RegExp for Arabic text matching.
 *
 * Features:
 * - Optional character equivalences: ا~أ~إ~آ, ة~ه, ى~ي.
 * - Optional tolerance for tatweel between characters.
 * - Optional diacritic-insensitivity (by inserting a diacritics class after each char).
 * - Optional flexible whitespace (needle whitespace becomes `\s+`).
 *
 * @param needle The Arabic text to match
 * @param opts See {@link MakeRegexOptions}
 * @returns A `RegExp` matching the needle with the desired tolerances
 *
 * @example
 * const rx = makeDiacriticInsensitiveRegex('أنا إلى الآفاق');
 * rx.test('انا الي الافاق'); // true
 * rx.test('اَنا إلى الآفاق'); // true
 */
export const makeDiacriticInsensitiveRegex = (needle: string, opts: MakeRegexOptions = {}): RegExp => {
    const {
        equivalences = { alif: true, taMarbutahHa: true, alifMaqsurahYa: true },
        allowTatweel = true,
        ignoreDiacritics = true,
        flexWhitespace = true,
        flags = 'u',
    } = opts;

    // Safety guard against extremely large inputs causing excessive pattern sizes
    if (needle.length > 5000) {
        throw new Error('makeDiacriticInsensitiveRegex: needle too long');
    }

    const charClass = (ch: string): string => {
        switch (ch) {
            case 'ا':
            case 'أ':
            case 'إ':
            case 'آ':
                return equivalences.alif ? '[اأإآ]' : 'ا';
            case 'ة':
            case 'ه':
                return equivalences.taMarbutahHa ? '[هة]' : escapeRegex(ch);
            case 'ى':
            case 'ي':
                return equivalences.alifMaqsurahYa ? '[ىي]' : escapeRegex(ch);
            default:
                return escapeRegex(ch);
        }
    };

    const after = `${ignoreDiacritics ? `${DIACRITICS_CLASS}*` : ''}${allowTatweel ? `${TATWEEL_CLASS}*` : ''}`;

    let pattern = '';
    for (const ch of Array.from(needle)) {
        if (/\s/.test(ch)) {
            pattern += flexWhitespace ? '\\s+' : '\\s*';
        } else {
            pattern += `${charClass(ch)}${after}`;
        }
    }

    return new RegExp(pattern, flags);
};

/**
 * Remove simple HTML/XML-like tags from a string.
 *
 * This is intentionally lightweight and does not attempt to parse HTML; it simply drops
 * substrings that look like `<...>`.
 *
 * @param content Input string
 * @returns String with tags removed
 */
export const removeAllTags = (content: string) => content.replace(/<[^>]*>/g, '');
