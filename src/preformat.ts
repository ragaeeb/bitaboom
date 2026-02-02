/**
 * Internal implementation for `preformatArabicText`.
 *
 * This file intentionally exports additional helpers for benchmarking/testing,
 * but it is NOT exported from `src/index.ts` (public API).
 */

// ==============================================================================
// CONSTANTS & LOOKUP TABLE
// ==============================================================================

const F_SPACE = 1;
const F_NO_SPACE_BEFORE = 2; // Punctuation/Closing that consumes preceding spaces
const F_OPENING = 4; // Opening brackets/quotes
const F_CLOSING = 8; // Closing brackets/quotes
const F_DIGIT = 16;
const F_ARABIC = 32;
const F_SPECIAL = 64; // Needs specific handling (transform, condense, etc)
const F_PUNCT = 128; // Punctuation that might need spacing after

const CHAR_MAP = new Uint8Array(65536);

/**
 * Mark a set of characters with the given bit flags in {@link CHAR_MAP}.
 *
 * @param chars A string of individual characters to mark
 * @param flags Bitmask to OR into the lookup table for each character
 */
const setFlags = (chars: string, flags: number) => {
    for (let i = 0; i < chars.length; i++) {
        CHAR_MAP[chars.charCodeAt(i)] |= flags;
    }
};

// Initialize Map
// Standard whitespace + comprehensive Unicode horizontal whitespace
// Includes: tab, space, non-breaking space, thin space, hair space, zero-width space,
// narrow non-breaking space, medium mathematical space, ideographic space
setFlags(' \t\u00A0\u2009\u200A\u200B\u202F\u205F\u3000', F_SPACE);
setFlags('\n\r', F_SPECIAL); // Newlines are special

// Digits
for (let i = 48; i <= 57; i++) {
    CHAR_MAP[i] |= F_DIGIT; // 0-9
}

// Arabic Letters (Common ranges)
for (let i = 0x0600; i <= 0x06ff; i++) {
    CHAR_MAP[i] |= F_ARABIC;
}
for (let i = 0x0750; i <= 0x077f; i++) {
    CHAR_MAP[i] |= F_ARABIC;
}

// Punctuation & Brackets
// No Space Before: . ! ? , : ; and Arabic equivalents
setFlags('.!?,:;', F_NO_SPACE_BEFORE | F_PUNCT | F_SPECIAL);
setFlags('،؛؟', F_NO_SPACE_BEFORE | F_PUNCT | F_SPECIAL);

// Opening: ( [ { " ' « “
setFlags('([{"\'«“', F_OPENING | F_SPECIAL);

// Closing: ) ] } " ' » ”
setFlags(')]}"\'»”', F_CLOSING | F_NO_SPACE_BEFORE | F_SPECIAL);

// Specific Specials (including tatweel ـ U+0640)
setFlags('-_*و/ـ', F_SPECIAL);

// Codes for fast comparison
const C_TAB = 9;
const C_SPACE = 32;
const C_NEWLINE = 10;
const C_CR = 13;
const C_DOT = 46;
const C_COLON = 58;
const C_SEMICOLON = 59;
const C_Q_MARK = 63;
const C_EXCLAM = 33;
const C_SLASH = 47;
const C_DASH = 45;
const C_UNDERSCORE = 95;
const C_ASTERISK = 42;
const C_L_PAREN = 40;
const C_R_PAREN = 41;
const C_L_GUILLEMET = 171; // «
const C_R_GUILLEMET = 187; // »
const C_DQUOTE = 34; // "
const C_SQUOTE = 39; // '
const C_RDQUOTE = 8221; // ”
const C_WOW = 1608; // و
const C_AR_COMMA = 1548; // ،
const C_AR_SEMICOLON = 1563; // ؛
const C_AR_Q_MARK = 1567; // ؟
const C_TATWEEL = 1600; // ـ
const C_ELLIPSIS = 8230; // …

/**
 * Check whether a code unit should be treated as trim whitespace for final output.
 * Uses the F_SPACE flag from CHAR_MAP to include all registered whitespace characters,
 * plus newline/CR for line ending handling.
 *
 * @param code UTF-16 code unit
 * @returns True if the code unit is a trim-whitespace character
 */
const isTrimWhitespace = (code: number) => (CHAR_MAP[code] & F_SPACE) !== 0 || code === C_NEWLINE || code === C_CR;

/**
 * Growable UTF-16 output buffer used by the buffer-backed preformat implementation.
 *
 * Note: This builder stores UTF-16 code units; it assumes all emitted characters are within
 * the BMP (which is true for the transformations this pipeline performs).
 */
class Utf16Builder {
    private buffer: Uint16Array;
    public length: number;

    public constructor(initialCapacity: number) {
        this.buffer = new Uint16Array(Math.max(16, initialCapacity));
        this.length = 0;
    }

    /**
     * Return the last written UTF-16 code unit, or 0 if empty.
     */
    public last() {
        return this.length > 0 ? this.buffer[this.length - 1] : 0;
    }

    /**
     * Return the second-to-last written UTF-16 code unit, or 0 if not available.
     */
    public secondLast() {
        return this.length > 1 ? this.buffer[this.length - 2] : 0;
    }

    /**
     * Append a UTF-16 code unit to the buffer.
     */
    public push(code: number) {
        this.ensureCapacity(1);
        this.buffer[this.length] = code;
        this.length++;
    }

    /**
     * Remove the last UTF-16 code unit (no-op if empty).
     */
    public pop() {
        if (this.length > 0) {
            this.length--;
        }
    }

    private ensureCapacity(extra: number) {
        const needed = this.length + extra;
        if (needed <= this.buffer.length) {
            return;
        }
        let nextCap = this.buffer.length * 2;
        if (nextCap < needed) {
            nextCap = needed;
        }
        const next = new Uint16Array(nextCap);
        next.set(this.buffer.subarray(0, this.length));
        this.buffer = next;
    }

    /**
     * Convert the buffer to a string, trimming leading/trailing whitespace (space/tab/newline/CR).
     *
     * Uses chunked `String.fromCharCode` to avoid stack limits on large outputs.
     */
    public toStringTrimmed(): string {
        let start = 0;
        let end = this.length;

        while (start < end && isTrimWhitespace(this.buffer[start])) {
            start++;
        }
        while (end > start && isTrimWhitespace(this.buffer[end - 1])) {
            end--;
        }

        if (start >= end) {
            return '';
        }

        // Chunked string creation
        const CHUNK_SIZE = 8192;
        let out = '';
        for (let i = start; i < end; i += CHUNK_SIZE) {
            const limit = Math.min(i + CHUNK_SIZE, end);
            const slice = this.buffer.subarray(i, limit);
            out += String.fromCharCode(...slice);
        }
        return out;
    }
}

/**
 * Interface to abstract the difference between string concatenation and buffer storage.
 */
interface PreformatWriter {
    push(code: number): void;
    pop(): void;
    last(): number;
    secondLast(): number;
    getResult(): string;
}

/**
 * Writer implementation using simple string concatenation.
 */
class StringWriter implements PreformatWriter {
    public res = '';

    push(code: number) {
        this.res += String.fromCharCode(code);
    }

    pop() {
        if (this.res.length > 0) {
            this.res = this.res.slice(0, -1);
        }
    }

    last() {
        return this.res.charCodeAt(this.res.length - 1) || 0;
    }

    secondLast() {
        return this.res.charCodeAt(this.res.length - 2) || 0;
    }

    getResult() {
        return this.res.trim();
    }
}

/**
 * Writer implementation wrapping Utf16Builder.
 */
class BufferWriter implements PreformatWriter {
    constructor(private builder: Utf16Builder) {}

    push(code: number) {
        this.builder.push(code);
    }

    pop() {
        this.builder.pop();
    }

    last() {
        return this.builder.last();
    }

    secondLast() {
        return this.builder.secondLast();
    }

    getResult() {
        return this.builder.toStringTrimmed();
    }
}

/**
 * Core logic for preformatting Arabic text.
 * Encapsulates state and logic to reduce complexity and duplication.
 */
class Preformatter {
    private i = 0;
    private len: number;
    private lastCode = 0;
    private pendingSpaces = 0;
    private code = 0;
    private flags = 0;

    constructor(
        private text: string,
        private writer: PreformatWriter,
    ) {
        this.len = text.length;
    }

    public process() {
        while (this.i < this.len) {
            this.code = this.text.charCodeAt(this.i);
            this.flags = CHAR_MAP[this.code];

            // 1. Handle Whitespace
            if (this.flags & F_SPACE) {
                this.pendingSpaces++;
                this.i++;
                continue;
            }

            // 2. Handle Special Characters
            if (this.flags & F_SPECIAL) {
                if (this.handleSpecialCharacters()) {
                    continue;
                }
            }

            // 3. Resolve Pending Spaces
            this.handlePendingSpaces();

            // 4. Insert Missing Spaces
            this.handleMissingSpaces();

            // 5. Emit
            this.writer.push(this.code);
            this.lastCode = this.code;
            this.i++;
        }

        return this.writer.getResult();
    }

    /**
     * Handles complex special characters logic.
     * @returns true if the loop should `continue` (skip remaining processing for this iteration).
     */
    private handleSpecialCharacters() {
        // Newlines
        if (this.code === C_NEWLINE || this.code === C_CR) {
            return this.handleNewlines();
        }

        // Transforms (modifies this.code)
        this.handleTransforms();

        // Condense Colons
        if (this.code === C_COLON) {
            this.handleCondenseColons();
        }

        // Double Brackets
        else if (this.isDoubleBracket()) {
            return false; // code modified, fall through to emit
        }

        // Ellipsis
        else if (this.code === C_DOT) {
            if (this.handleEllipsis()) {
                return true;
            }
        }

        // Trailing Wow using pendingSpaces
        else if (this.code === C_WOW && this.pendingSpaces > 0) {
            if (this.handleTrailingWow()) {
                return true;
            }
        }

        // Repeats
        else if (this.handleRepeats()) {
            return true;
        }

        // Redundant Punctuation
        if (this.handleRedundantPunctuation()) {
            return true;
        }

        return false;
    }

    private handleNewlines() {
        this.pendingSpaces = 0;
        if (this.lastCode !== C_NEWLINE) {
            this.writer.push(C_NEWLINE);
            this.lastCode = C_NEWLINE;
        }
        // Skip subsequent whitespace (including Unicode whitespace)
        this.i++;
        while (this.i < this.len) {
            const next = this.text.charCodeAt(this.i);
            if ((CHAR_MAP[next] & F_SPACE) !== 0 || next === C_NEWLINE || next === C_CR) {
                this.i++;
            } else {
                break;
            }
        }
        return true;
    }

    private handleTransforms() {
        this.code = this.code === C_Q_MARK ? C_AR_Q_MARK : this.code === C_SEMICOLON ? C_AR_SEMICOLON : this.code;
    }

    private handleCondenseColons() {
        if (this.lastCode === C_DOT || this.lastCode === C_DASH) {
            this.writer.pop();
            this.lastCode = this.writer.last();
        }
        const next = this.text.charCodeAt(this.i + 1);
        if (next === C_DOT || next === C_DASH) {
            this.i++;
        }
    }

    private isDoubleBracket() {
        if (this.code === C_L_PAREN && this.text.charCodeAt(this.i + 1) === C_L_PAREN) {
            this.code = C_L_GUILLEMET;
            this.i++;
            return true;
        }
        if (this.code === C_R_PAREN && this.text.charCodeAt(this.i + 1) === C_R_PAREN) {
            this.code = C_R_GUILLEMET;
            this.i++;
            return true;
        }
        return false;
    }

    private handleEllipsis() {
        if (this.lastCode === C_ELLIPSIS) {
            this.i++;
            return true;
        }
        if (this.lastCode === C_DOT) {
            this.writer.pop(); // remove previous dot
            this.writer.push(C_ELLIPSIS);
            this.lastCode = C_ELLIPSIS;
            this.i++;
            return true;
        }
        return false;
    }

    private handleTrailingWow() {
        // Peek ahead to see if there's a space after wow (including Unicode whitespace)
        let nextIdx = this.i + 1;
        let hasTrailingSpace = false;
        while (nextIdx < this.len) {
            const next = this.text.charCodeAt(nextIdx);
            if ((CHAR_MAP[next] & F_SPACE) !== 0) {
                hasTrailingSpace = true;
                nextIdx++;
            } else {
                break;
            }
        }
        if (hasTrailingSpace) {
            if (!this.shouldSuppressSpace()) {
                this.writer.push(C_SPACE);
            }
            this.writer.push(C_WOW);
            this.lastCode = C_WOW;
            this.pendingSpaces = 0;
            this.i = nextIdx;
            return true;
        }
        return false;
    }

    private handleRepeats() {
        if (
            (this.code === C_TATWEEL && this.lastCode === C_TATWEEL) ||
            (this.code === C_UNDERSCORE && this.lastCode === C_UNDERSCORE) ||
            (this.code === C_DASH && this.lastCode === C_DASH) ||
            (this.code === C_ASTERISK && this.lastCode === C_ASTERISK)
        ) {
            this.i++;
            return true;
        }
        return false;
    }

    private handleRedundantPunctuation() {
        if (
            (this.lastCode === C_AR_Q_MARK || this.lastCode === C_EXCLAM) &&
            (this.code === C_DOT || this.code === C_AR_COMMA)
        ) {
            this.i++;
            return true;
        }
        return false;
    }

    private handlePendingSpaces() {
        if (this.pendingSpaces > 0) {
            if (!this.shouldSuppressSpace()) {
                this.writer.push(C_SPACE);
                this.lastCode = C_SPACE;
            }
            this.pendingSpaces = 0;
        }
    }

    private shouldSuppressSpace() {
        if (this.flags & F_NO_SPACE_BEFORE) {
            return true;
        }
        if (CHAR_MAP[this.lastCode] & F_OPENING) {
            return true;
        }
        return this.shouldSuppressSpaceForSlash();
    }

    private shouldSuppressSpaceForSlash() {
        // Slash logic: Don't add space around slashes in number references (e.g. 1/2)
        if (this.code === C_SLASH) {
            // Peek next non-space (skip all whitespace including Unicode whitespace)
            let nextNonSpace = 0;
            for (let k = this.i + 1; k < this.len; k++) {
                const nc = this.text.charCodeAt(k);
                if ((CHAR_MAP[nc] & F_SPACE) === 0 && nc !== C_NEWLINE && nc !== C_CR) {
                    nextNonSpace = nc;
                    break;
                }
            }
            if (CHAR_MAP[this.lastCode] & F_DIGIT && CHAR_MAP[nextNonSpace] & F_DIGIT) {
                return true;
            }
        }

        // No space after slash in references (e.g. 1/ 2 -> 1/2)
        if (this.lastCode === C_SLASH && this.flags & F_DIGIT) {
            const prev = this.writer.secondLast();
            if (prev !== 0 && CHAR_MAP[prev] & F_DIGIT) {
                return true;
            }
        }

        return false;
    }

    private handleMissingSpaces() {
        const currentFlags = this.flags;

        // Arabic <-> Number
        if (currentFlags & F_DIGIT && CHAR_MAP[this.lastCode] & F_ARABIC) {
            this.writer.push(C_SPACE);
            this.lastCode = C_SPACE;
        }

        // Space before Opening
        if (
            currentFlags & F_OPENING &&
            this.lastCode !== C_SPACE &&
            this.lastCode !== C_NEWLINE &&
            !(CHAR_MAP[this.lastCode] & F_OPENING) &&
            !(CHAR_MAP[this.lastCode] & F_CLOSING) &&
            this.lastCode !== 0
        ) {
            this.writer.push(C_SPACE);
            this.lastCode = C_SPACE;
        }

        // Space after Punctuation
        if (CHAR_MAP[this.lastCode] & F_PUNCT) {
            if (this.isDigitColonDigit()) {
                return;
            }
            if (!this.isSpecialSpacing()) {
                this.writer.push(C_SPACE);
                this.lastCode = C_SPACE;
            }
        }
    }

    private isDigitColonDigit() {
        if (this.lastCode === C_COLON && this.flags & F_DIGIT) {
            const prevCode = this.writer.secondLast();
            if (prevCode !== 0 && CHAR_MAP[prevCode] & F_DIGIT) {
                return true;
            }
        }
        return false;
    }

    private isSpecialSpacing() {
        return !!(
            this.flags & (F_SPACE | F_CLOSING | F_OPENING | F_PUNCT) ||
            this.code === C_SPACE ||
            this.code === C_NEWLINE ||
            this.code === C_CR ||
            this.code === C_DQUOTE ||
            this.code === C_SQUOTE ||
            this.code === C_R_GUILLEMET ||
            this.code === C_RDQUOTE ||
            this.code === this.lastCode ||
            ((this.lastCode === C_AR_Q_MARK || this.lastCode === C_EXCLAM) &&
                (this.code === C_DOT || this.code === C_AR_COMMA))
        );
    }
}

/**
 * Standard implementation using string concatenation.
 */
const processStringConcat = (text: string) => {
    const writer = new StringWriter();
    const formatter = new Preformatter(text, writer);
    return formatter.process();
};

/**
 * Preformat using a growable UTF-16 buffer to reduce intermediate allocations.
 *
 * This is primarily intended for experimentation on extremely large inputs where GC pressure
 * may dominate (e.g. 100MB+ strings). It must remain byte-for-byte identical to the concat path.
 *
 * To enable this path, set environment variable `BITABOOM_PREFORMAT_BUILDER=buffer`.
 *
 * @param text The input Arabic text to format.
 * @returns The formatted string.
 */
const processStringBuffer = (text: string) => {
    // Initial guess: length +/- 10% change usually
    const builder = new Utf16Builder(text.length + 1024);
    const writer = new BufferWriter(builder);
    const formatter = new Preformatter(text, writer);
    return formatter.process();
};
/**
 * Internal (non-public) variant: baseline `+=` builder.
 */
export const preformatArabicTextConcat = (text: string) => processStringConcat(text);

/**
 * Internal (non-public) variant: UTF-16 buffer builder to reduce intermediate allocations.
 */
export const preformatArabicTextBuffer = (text: string) => processStringBuffer(text);

/**
 * Preformat a single string.
 *
 * This is the internal implementation used by the public {@link preformatArabicText} API.
 * The builder can be forced for experiments via `BITABOOM_PREFORMAT_BUILDER`.
 *
 * @param text Input string
 * @returns Preformatted string
 */
const preformatOne = (text: string) => {
    // Allow forcing a builder for benchmarks/debugging without changing public API.
    const forced = process.env.BITABOOM_PREFORMAT_BUILDER;
    if (forced === 'concat') {
        return preformatArabicTextConcat(text);
    }
    if (forced === 'buffer') {
        return preformatArabicTextBuffer(text);
    }

    // Default: the concat builder is typically faster in Bun/V8 for common page-sized inputs.
    // For experiments on extremely large inputs, force `BITABOOM_PREFORMAT_BUILDER=buffer`.
    return preformatArabicTextConcat(text);
};

/**
 * High-performance Arabic preformatting pipeline.
 *
 * Consolidates common formatting steps (spacing, punctuation normalization, reference formatting,
 * bracket/quote cleanup, ellipsis condensation, newline normalization) into a single-pass formatter.
 *
 * @param text Input string or an array of strings
 * @returns Preformatted string or array of strings (matching input shape)
 */
export function preformatArabicText(text: string): string;
export function preformatArabicText(text: string[]): string[];
export function preformatArabicText(text: string | string[]): string | string[] {
    if (Array.isArray(text)) {
        return text.map(preformatOne);
    }
    return preformatOne(text);
}
