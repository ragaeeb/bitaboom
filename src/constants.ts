/** Matches text ending with common punctuation marks */
export const PATTERN_ENDS_WITH_PUNCTUATION = /[.!?؟؛]$/;

/** The salutation symbol (ﷺ - Unicode U+FDFA) used to replace salutation phrases. */
export const SALUTATION_SYMBOL = 'ﷺ';

/** Arabic diacritics (tashkeel) pattern - matches all Arabic vowel marks. */
export const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670\u0617-\u061A\u06D6-\u06ED]/g;

/** Abbreviation patterns that should be matched as whole words (case-insensitive). */
export const ABBREVIATION_REGEX =
    /\b(PBUH|SAWS|SAW|SAAS|sws|pbuh)\b|\(s\.\s*a\.\s*w\.\s*s\.?\s*\)|\bp\.b\.u\.h(?:\.)?(?=\s|$|[.,!?;:)\]])/gi;

/** English phrase patterns for salutation. */
export const ENGLISH_PHRASE_REGEX =
    /,?\s*(?:peace\s+and\s+blessings|blessings\s+and\s+peace)\s+(?:of\s+)?(?:All(?:a|ā)a?h\s+)?be\s+upon\s+him\s*,?/gi;

/** Parenthetical forms of salutations used after common titles. */
export const PARENTHETICAL_REGEX =
    /\(peace be upon him\)|(Messenger of (?:Allah|Allāh)|Messenger|Prophet|Mu[hḥ]ammad)\s*\(\s*(s[^)]*m|peace[^)]*him|May[^)]*him|may[^)]*him)\s*\)/gi;

/** Symbol cleanup patterns - handles already-present symbol with surrounding chars. */
export const SYMBOL_CLEANUP_REGEX = /[‒–—―-][ \t]*ﷺ[ \t]*[‒–—―-]?|ﷺ[ \t]*[‒–—―-]/g;
