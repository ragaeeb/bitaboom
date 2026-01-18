import { PATTERN_ENDS_WITH_PUNCTUATION } from './constants';

/**
 * Converts Arabic-Indic numerals (٠-٩) to a JavaScript number.
 *
 * This function finds all Arabic-Indic digits in the input string and converts them
 * to their corresponding Arabic (Western) digits, then parses the result as an integer.
 *
 * Arabic-Indic digits mapping:
 * - ٠ → 0, ١ → 1, ٢ → 2, ٣ → 3, ٤ → 4
 * - ٥ → 5, ٦ → 6, ٧ → 7, ٨ → 8, ٩ → 9
 *
 * @param arabic - The string containing Arabic-Indic numerals to convert
 * @returns The parsed integer value of the converted numerals
 *
 * @example
 * ```typescript
 * arabicNumeralToNumber("١٢٣"); // returns 123
 * arabicNumeralToNumber("٥٠"); // returns 50
 * arabicNumeralToNumber("abc١٢٣xyz"); // returns 123 (non-digits ignored)
 * arabicNumeralToNumber(""); // returns NaN
 * ```
 *
 * Returns NaN if no valid Arabic-Indic digits are found
 */
export const arabicNumeralToNumber = (arabic: string) => {
    return parseInt(
        arabic.replace(/[\u0660-\u0669]/g, (c) => (c.charCodeAt(0) - 0x0660).toString()),
        10,
    );
};

/**
 * Removes extreme Arabic underscores (ـ) that appear at the beginning or end of a line or in text.
 * Does not affect Hijri dates (e.g., 1424هـ) or specific Arabic terms.
 * Example: "ـThis is a textـ" will be changed to "This is a text".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with extreme underscores removed.
 */
export const cleanExtremeArabicUnderscores = (text: string) => {
    return text.replace(/(?<!\d ?ه|اه)ـ(?=\r?$)|^ـ(?!اهـ)/gm, '');
};

/**
 * Converts Urdu symbols to their Arabic equivalents.
 * Example: 'ھذا' will be changed to 'هذا', 'ی' to 'ي'.
 * @param {string} text - The input text containing Urdu symbols.
 * @returns {string} - The modified text with Urdu symbols converted to Arabic symbols.
 */
export const convertUrduSymbolsToArabic = (text: string) => {
    return text.replace(/ھ/g, 'ه').replace(/ی/g, 'ي');
};

/**
 * Calculates the proportion of Arabic characters in text relative to total non-whitespace, non-digit characters.
 * Digits (ASCII and Arabic-Indic variants) are excluded from both numerator and denominator.
 * @param text - The input text to analyze
 * @returns A decimal between 0-1 representing the Arabic character ratio (0 = no Arabic, 1 = all Arabic)
 */
export const getArabicScore = (text: string) => {
    if (!text) {
        return 0;
    }
    // Arabic letters (letters/ranges only)
    const arabicLettersPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    // ASCII digits + Arabic-Indic digits + Extended Arabic-Indic digits
    const allDigitPattern = /[0-9\u0660-\u0669\u06F0-\u06F9]/g;
    // Counted characters exclude whitespace and all listed digits
    const countedCharsPattern = /[^\s0-9\u0660-\u0669\u06F0-\u06F9]/g;
    const cleaned = text.replace(allDigitPattern, '');
    const arabicMatches = cleaned.match(arabicLettersPattern) || [];
    const totalMatches = cleaned.match(countedCharsPattern) || [];
    return totalMatches.length === 0 ? 0 : arabicMatches.length / totalMatches.length;
};

/**
 * Finds the position of the last punctuation character in a string
 *
 * @param text - The text to search through
 * @returns The index of the last punctuation character, or -1 if none found
 *
 * @example
 * ```typescript
 * const text = "Hello world! How are you?";
 * const lastPuncIndex = findLastPunctuation(text);
 * // Result: 24 (position of the last '?')
 *
 * const noPuncText = "Hello world";
 * const notFound = findLastPunctuation(noPuncText);
 * // Result: -1 (no punctuation found)
 * ```
 */
export const findLastPunctuation = (text: string) => {
    for (let i = text.length - 1; i >= 0; i--) {
        if (PATTERN_ENDS_WITH_PUNCTUATION.test(text[i])) {
            return i;
        }
    }

    return -1;
};

/**
 * Fixes the trailing "و" (wow) in phrases such as "عليكم و رحمة" to "عليكم ورحمة".
 * This function attempts to correct phrases where "و" appears unnecessarily, particularly in greetings.
 * Example: 'السلام عليكم و رحمة' will be changed to 'السلام عليكم ورحمة'.
 * @param {string} text - The input text containing the "و" character.
 * @returns {string} - The modified text with unnecessary trailing "و" characters corrected.
 */
export const fixTrailingWow = (text: string) => {
    return text.replace(/ و /g, ' و');
};

/**
 * Inserts a space between Arabic text and numbers.
 * Example: 'الآية37' will be changed to 'الآية 37'.
 * @param {string} text - The input text containing Arabic text followed by numbers.
 * @returns {string} - The modified text with spaces inserted between Arabic text and numbers.
 */
export const addSpaceBetweenArabicTextAndNumbers = (text: string) => {
    return text.replace(/([\u0600-\u06FF]+)(\d+)/g, '$1 $2');
};

/**
 * Removes single-digit numbers surrounded by Arabic text. Also removes dashes (-) not followed by a number.
 * For example, removes '3' from 'وهب 3 وقال' but does not remove '121' from 'لوحه 121 الجرح'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with non-index numbers and dashes removed.
 */
export const removeNonIndexSignatures = (text: string) => {
    return text
        .replace(/(?<![0-9] ?)-|(?<=[\u0600-\u06FF])\s?\d\s?(?=[\u0600-\u06FF])/g, ' ')
        .replace(/(?<=[\u0600-\u06FF]\s)(\d+\s)+\d+(?=(\s[\u0600-\u06FF]|$))/g, ' ');
};

/**
 * Removes characters enclosed in square brackets [] or parentheses () if they are Arabic letters or Arabic-Indic numerals.
 * Example: '[س]' or '(س)' will be removed.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with singular codes removed.
 */
export const removeSingularCodes = (text: string) => {
    return text.replace(/[[({][\u0621-\u064A\u0660-\u0669][\])}]/g, '');
};

/**
 * Removes solitary Arabic letters unless they are the 'ha' letter, which is used in Hijri years.
 * Example: "ب ا الكلمات ت" will be changed to "ا الكلمات".
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with solitary Arabic letters removed.
 */
export const removeSolitaryArabicLetters = (text: string) => {
    return text.replace(/(^| )[\u0621-\u064A]( |$)/g, ' ');
};

/**
 * Replaces English punctuation (question mark and semicolon) with their Arabic equivalents.
 * Example: '?' will be replaced with '؟', and ';' with '؛'.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text with English punctuation replaced by Arabic punctuation.
 */
export const replaceEnglishPunctuationWithArabic = (text: string) => {
    return text
        .replace(/\?|؟\./g, '؟')
        .replace(/(;|؛)\s*(\1\s*)*/g, '؛')
        .replace(/,|-،/g, '،');
};

/**
 * Counts words in text by splitting on whitespace.
 * Works for both Arabic and English text.
 *
 * @param text - The text to count words in
 * @returns Number of words in the text
 */

export const countWords = (text: string) => {
    if (!text) {
        return 0;
    }
    return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Supported LLM providers for token estimation.
 * Each provider has different tokenization characteristics based on their BPE implementation.
 */
export enum LLMProvider {
    /** OpenAI GPT models (GPT-3.5, GPT-4, GPT-4o) - uses tiktoken */
    OpenAI = 'openai',
    /** Google Gemini models - uses SentencePiece, 25% more efficient for multilingual */
    Gemini = 'gemini',
    /** Anthropic Claude models - less efficient for Arabic */
    Claude = 'claude',
    /** xAI Grok models - similar to OpenAI */
    Grok = 'grok',
    /** Generic/default estimation - balanced middle ground */
    Generic = 'generic',
}

/**
 * Token estimation configuration per LLM provider.
 * Based on research into BPE tokenization behavior for Arabic and English text.
 */
interface TokenConfig {
    /** Characters per token for Latin/ASCII text */
    latinCharsPerToken: number;
    /** Characters per token for Arabic base characters */
    arabicCharsPerToken: number;
    /** Percentage overhead when Arabic diacritics (tashkeel) are present */
    diacriticOverhead: number;
    /** Percentage overhead for Latin diacritics (ā, ī, ū, ḥ, etc.) */
    latinDiacriticOverhead: number;
    /** Digits per token for numerals */
    numeralGroupSize: number;
}

/**
 * Provider-specific token estimation configurations.
 *
 * Research findings:
 * - OpenAI: ~4 chars/token English, ~1.3 chars/token Arabic (3x inflation)
 * - Gemini: 25% more efficient than OpenAI for Arabic (SentencePiece-based)
 * - Claude: ~3.5 chars/token English, less efficient for Arabic
 * - Grok: Similar to OpenAI (standard BPE)
 */
const TOKEN_CONFIG: Record<LLMProvider, TokenConfig> = {
    [LLMProvider.OpenAI]: {
        latinCharsPerToken: 4,
        arabicCharsPerToken: 1.3,
        diacriticOverhead: 0.15,
        latinDiacriticOverhead: 0.3,
        numeralGroupSize: 2.5,
    },
    [LLMProvider.Gemini]: {
        latinCharsPerToken: 4,
        arabicCharsPerToken: 1.6,
        diacriticOverhead: 0.1,
        latinDiacriticOverhead: 0.15,
        numeralGroupSize: 2.5,
    },
    [LLMProvider.Claude]: {
        latinCharsPerToken: 3.5,
        arabicCharsPerToken: 1.1,
        diacriticOverhead: 0.2,
        latinDiacriticOverhead: 0.25,
        numeralGroupSize: 2.5,
    },
    [LLMProvider.Grok]: {
        latinCharsPerToken: 4,
        arabicCharsPerToken: 1.3,
        diacriticOverhead: 0.15,
        latinDiacriticOverhead: 0.3,
        numeralGroupSize: 2.5,
    },
    [LLMProvider.Generic]: {
        latinCharsPerToken: 4,
        arabicCharsPerToken: 1.5,
        diacriticOverhead: 0.15,
        latinDiacriticOverhead: 0.25,
        numeralGroupSize: 3,
    },
};

// Character class patterns
const ARABIC_DIACRITICS_RANGES = [
    [0x064b, 0x0652], // Tashkeel
    [0x0670, 0x0670], // Dagger alif
    [0x0617, 0x061a], // Small koranic symbols
    [0x06d6, 0x06dc], // Small high ligatures
    [0x06df, 0x06e4], // Small high ligatures
    [0x06e7, 0x06e8], // Small high forms
    [0x06ea, 0x06ed], // Empty centre low stops
];

const LATIN_DIACRITICS_RANGES = [
    [0x00c0, 0x00ff], // Latin-1 Supplement (é, à, etc.) - CRITICAL missing range added
    [0x0100, 0x017f], // Latin Extended-A
    [0x0180, 0x024f], // Latin Extended-B
    [0x1e00, 0x1eff], // Latin Extended Additional
    [0x02b9, 0x02ff], // Spacing Modifier Letters
];

/**
 * LLM-aware token estimation with provider-specific configurations.
 *
 * Refactored to use a Single-Pass O(N) classifier for performance and correctness.
 *
 * algorithm:
 * - Single pass iteration over code points (avoiding memory spikes from match() arrays)
 * - Exclusive classification (preventing double-counting overlaps)
 * - Additive overhead application (preventing overhead bleeding into other scripts)
 * - Run-length encoding approximation for numerals (better BPE simulation)
 *
 * @param text - The input text to estimate tokens for
 * @param provider - The LLM provider (defaults to Generic)
 * @returns Estimated token count
 */
export const estimateTokenCount = (text: string, provider: LLMProvider = LLMProvider.Generic): number => {
    if (!text) {
        return 0;
    }

    const config = TOKEN_CONFIG[provider];

    // Counters
    let arabicBase = 0;
    let arabicDiacritics = 0;
    let tatweel = 0;
    let arabicIndicNumerals = 0;
    let westernNumerals = 0;
    let latinBase = 0;
    let latinDiacritics = 0;
    let otherChars = 0;

    // Numeral run tracking (for BPE grouping approximation)
    let currentNumeralRun = 0;
    let currentNumeralType: 'none' | 'arabic-indic' | 'western' = 'none';

    // Helper to commit numeral runs
    const commitNumeralRun = () => {
        if (currentNumeralRun > 0) {
            // Logarithmic decay or linear blocking for numerals?
            // BPE typically keeps 1-3 digits per token.
            // We'll use the config.numeralGroupSize approximation on the run.
            const tokens = Math.ceil(currentNumeralRun / config.numeralGroupSize);
            if (currentNumeralType === 'arabic-indic') {
                arabicIndicNumerals += tokens;
            } else {
                westernNumerals += tokens;
            }
            currentNumeralRun = 0;
            currentNumeralType = 'none';
        }
    };

    // Single pass iteration
    for (const char of text) {
        const code = char.codePointAt(0) ?? 0;
        let isNumeral = false;

        // 1. Whitespace
        // Typically absorbed or 1 token. We track it but don't count it rigidly yet.
        // For now, we treat it as a separator that breaks numeral runs.
        if (code <= 0x0020 || code === 0x00a0) {
            commitNumeralRun();
            continue;
        }

        // 2. Arabic Block
        if ((code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f)) {
            // Tatweel
            if (code === 0x0640) {
                tatweel++;
            }
            // Numerals
            else if ((code >= 0x0660 && code <= 0x0669) || (code >= 0x06f0 && code <= 0x06f9)) {
                if (currentNumeralType !== 'arabic-indic') {
                    commitNumeralRun();
                }
                currentNumeralType = 'arabic-indic';
                currentNumeralRun++;
                isNumeral = true;
            }
            // Diacritics
            else {
                let isDiacritic = false;
                for (const range of ARABIC_DIACRITICS_RANGES) {
                    if (code >= range[0] && code <= range[1]) {
                        arabicDiacritics++;
                        isDiacritic = true;
                        break;
                    }
                }
                // Base
                if (!isDiacritic) {
                    arabicBase++;
                }
            }
        }
        // 3. Western Numerals
        else if (code >= 0x0030 && code <= 0x0039) {
            if (currentNumeralType !== 'western') {
                commitNumeralRun();
            }
            currentNumeralType = 'western';
            currentNumeralRun++;
            isNumeral = true;
        }
        // 4. Latin Block
        else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
            latinBase++;
        }
        // 5. Latin Diacritics & Extended
        else {
            let isLatinDiacritic = false;
            for (const range of LATIN_DIACRITICS_RANGES) {
                if (code >= range[0] && code <= range[1]) {
                    latinDiacritics++;
                    isLatinDiacritic = true;
                    break;
                }
            }
            if (isLatinDiacritic) {
                // handled in if
            } else {
                // Punctuation, symbols, CJK, etc.
                // Treat as "other" - usually closer to Latin tokenization (1 char/token or similar)
                // or sometimes UTF-8 bytes. We'll map to Latin for simplicity but keep separate.
                otherChars++;
            }
        }

        if (!isNumeral) {
            commitNumeralRun();
        }
    }
    commitNumeralRun(); // Final flush

    // Calculation with Additive Overhead
    let tokens = 0;

    // Arabic Tokens
    if (arabicBase > 0 || tatweel > 0) {
        // Base text tokens
        const baseTokens = (arabicBase + tatweel) / config.arabicCharsPerToken;
        tokens += baseTokens;

        // Diacritics are now additive per-instance rather than a global multiplier.
        // This fixes the bug where a single diacritic inflates the cost of the entire text.
        // Assuming fully voweled text has ~1 diacritic per char and adds ~15-20% token cost (config.diacriticOverhead).
        // Cost per diacritic ≈ config.diacriticOverhead tokens.
        // (e.g., 0.15 tokens per diacritic).
        if (arabicDiacritics > 0) {
            tokens += arabicDiacritics * config.diacriticOverhead;
        }
    }

    // Latin Tokens
    if (latinBase > 0) {
        tokens += latinBase / config.latinCharsPerToken;
    }

    // Latin Diacritics
    if (latinDiacritics > 0) {
        // Latin diacritics (like ā, ī) often break tokens or are separate tokens.
        // We treat them as having a higher cost than plain letters.
        // Cost = (Count / CharsPerToken) * Multiplier
        tokens += (latinDiacritics / config.latinCharsPerToken) * (1 + config.latinDiacriticOverhead);
    }

    // Numerals (already grouped into token counts)
    tokens += arabicIndicNumerals + westernNumerals;

    // Other Chars (Punctuation, etc.)
    // Fallback to Latin rate (conservative)
    if (otherChars > 0) {
        tokens += otherChars / config.latinCharsPerToken;
    }

    return Math.max(0, Math.ceil(tokens));
};
