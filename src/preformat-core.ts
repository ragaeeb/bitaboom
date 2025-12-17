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
setFlags(' \t', F_SPACE);
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

// Specific Specials
setFlags('-_*و/', F_SPECIAL);

// Codes for fast comparison
const C_TAB = 9;
const C_SPACE = 32;
const C_NEWLINE = 10;
const C_CR = 13;
const C_DOT = 46;
const C_COMMA = 44;
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
const C_WOW = 1608; // و
const C_AR_COMMA = 1548; // ،
const C_AR_SEMICOLON = 1563; // ؛
const C_AR_Q_MARK = 1567; // ؟
const C_TATWEEL = 1600; // ـ
const C_ELLIPSIS = 8230; // …

/**
 * Check whether a code unit should be treated as trim whitespace for final output.
 *
 * @param code UTF-16 code unit
 * @returns True if the code unit is a trim-whitespace character
 */
const isTrimWhitespace = (code: number): boolean => {
    return code === C_SPACE || code === C_TAB || code === C_NEWLINE || code === C_CR;
};

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
    public last(): number {
        return this.length > 0 ? this.buffer[this.length - 1] : 0;
    }

    /**
     * Return the second-to-last written UTF-16 code unit, or 0 if not available.
     */
    public secondLast(): number {
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

        if (end <= start) {
            return '';
        }

        // Chunked conversion to avoid call stack limits.
        const CHUNK = 0x8000;
        let out = '';
        for (let i = start; i < end; i += CHUNK) {
            const slice = this.buffer.subarray(i, Math.min(end, i + CHUNK));
            out += String.fromCharCode(...slice);
        }
        return out;
    }
}

// ==============================================================================
// IMPLEMENTATIONS
// ==============================================================================

/**
 * Preformat using string concatenation (`res += ...`).
 *
 * This is typically fastest for common page-sized inputs under Bun/V8.
 *
 * @param text Input string
 * @returns Preformatted string
 */
const processStringConcat = (text: string): string => {
    if (!text) {
        return '';
    }

    let res = '';
    const len = text.length;
    let i = 0;

    let pendingSpaces = 0;
    let lastCode = 0;

    while (i < len) {
        let code = text.charCodeAt(i);
        const originalCode = code;
        const flags = CHAR_MAP[code];

        // ---------------------------------------------------------
        // 1. Handle Whitespace
        // ---------------------------------------------------------
        if (flags & F_SPACE) {
            pendingSpaces++;
            i++;
            continue;
        }

        // ---------------------------------------------------------
        // 2. Handle Special Characters (Newlines, Transforms)
        // ---------------------------------------------------------
        if (flags & F_SPECIAL) {
            // Newlines
            if (code === C_NEWLINE || code === C_CR) {
                pendingSpaces = 0;
                if (lastCode !== C_NEWLINE) {
                    res += '\n';
                    lastCode = C_NEWLINE;
                }
                // Skip subsequent whitespace
                i++;
                while (i < len) {
                    const next = text.charCodeAt(i);
                    if (next === C_SPACE || next === C_TAB || next === C_NEWLINE || next === C_CR) {
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // Transforms
            if (code === C_Q_MARK) {
                code = C_AR_Q_MARK;
            } else if (code === C_SEMICOLON) {
                code = C_AR_SEMICOLON;
            } else if (code === C_COMMA) {
                code = C_AR_COMMA;
            }

            // Condense Colons (.:. -> :)
            else if (code === C_COLON) {
                if (lastCode === C_DOT || lastCode === C_DASH) {
                    res = res.slice(0, -1);
                    lastCode = res.charCodeAt(res.length - 1) || 0;
                }
                const next = text.charCodeAt(i + 1);
                if (next === C_DOT || next === C_DASH) {
                    i++;
                }
            }

            // Double Brackets
            else if (code === C_L_PAREN && text.charCodeAt(i + 1) === C_L_PAREN) {
                code = 171; // « (\u00AB)
                i++;
            } else if (code === C_R_PAREN && text.charCodeAt(i + 1) === C_R_PAREN) {
                code = 187; // » (\u00BB)
                i++;
            }

            // Ellipsis (...)
            else if (code === C_DOT) {
                if (lastCode === C_ELLIPSIS) {
                    i++;
                    continue;
                }
                if (lastCode === C_DOT) {
                    res = res.slice(0, -1) + '…';
                    lastCode = C_ELLIPSIS;
                    i++;
                    continue;
                }
            }

            // Trailing Wow
            else if (code === C_WOW && lastCode === C_SPACE) {
                res += 'و';
                lastCode = C_WOW;
                i++;
                while (i < len) {
                    const next = text.charCodeAt(i);
                    if (next === C_SPACE || next === C_TAB) {
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // Repeats (Tatweel, Underscore, Dash, Asterisk)
            else if (
                (code === C_TATWEEL && lastCode === C_TATWEEL) ||
                (code === C_UNDERSCORE && lastCode === C_UNDERSCORE) ||
                (code === C_DASH && lastCode === C_DASH) ||
                (code === C_ASTERISK && lastCode === C_ASTERISK)
            ) {
                i++;
                continue;
            }

            // Redundant Punctuation
            if ((lastCode === C_AR_Q_MARK || lastCode === C_EXCLAM) && (code === C_DOT || code === C_AR_COMMA)) {
                i++;
                continue;
            }
        }

        // ---------------------------------------------------------
        // 3. Resolve Pending Spaces
        // ---------------------------------------------------------
        if (pendingSpaces > 0) {
            let shouldEmitSpace = true;
            const currentFlags = CHAR_MAP[code];

            if (currentFlags & F_NO_SPACE_BEFORE) {
                shouldEmitSpace = false;
            }

            if (CHAR_MAP[lastCode] & F_OPENING) {
                shouldEmitSpace = false;
            }

            // Slash logic
            if (code === C_SLASH) {
                // Peek next non-space
                let nextNonSpace = 0;
                for (let k = i + 1; k < len; k++) {
                    const nc = text.charCodeAt(k);
                    if (nc !== C_SPACE && nc !== C_TAB && nc !== C_NEWLINE && nc !== C_CR) {
                        nextNonSpace = nc;
                        break;
                    }
                }

                if (CHAR_MAP[lastCode] & F_DIGIT && CHAR_MAP[nextNonSpace] & F_DIGIT) {
                    shouldEmitSpace = false;
                }
            }

            // No space after slash in references
            if (lastCode === C_SLASH && currentFlags & F_DIGIT) {
                if (res.length >= 2 && CHAR_MAP[res.charCodeAt(res.length - 2)] & F_DIGIT) {
                    shouldEmitSpace = false;
                }
            }

            if (shouldEmitSpace) {
                res += ' ';
                lastCode = C_SPACE;
            }
            pendingSpaces = 0;
        }

        // ---------------------------------------------------------
        // 4. Insert Missing Spaces
        // ---------------------------------------------------------

        const currentFlags = CHAR_MAP[code];

        // Arabic <-> Number
        if (currentFlags & F_DIGIT && CHAR_MAP[lastCode] & F_ARABIC) {
            res += ' ';
            lastCode = C_SPACE;
        }

        // Space before Opening
        if (
            currentFlags & F_OPENING &&
            lastCode !== C_SPACE &&
            lastCode !== C_NEWLINE &&
            !(CHAR_MAP[lastCode] & F_OPENING) &&
            lastCode !== 0
        ) {
            res += ' ';
            lastCode = C_SPACE;
        }

        // Space after Punctuation
        if (CHAR_MAP[lastCode] & F_PUNCT) {
            const isSpecial =
                currentFlags & (F_SPACE | F_CLOSING | F_OPENING) ||
                code === C_SPACE ||
                code === C_NEWLINE ||
                code === C_CR ||
                currentFlags & F_CLOSING ||
                code === 34 ||
                code === 39 ||
                code === 187 ||
                code === 8221 ||
                code === lastCode ||
                ((lastCode === C_AR_Q_MARK || lastCode === C_EXCLAM) && (code === C_DOT || code === C_AR_COMMA));

            if (!isSpecial) {
                res += ' ';
                lastCode = C_SPACE;
            }
        }

        // ---------------------------------------------------------
        // 5. Emit
        // ---------------------------------------------------------
        if (code !== originalCode) {
            res += String.fromCharCode(code);
        } else {
            res += text[i];
        }
        lastCode = code;
        i++;
    }

    return res.trim();
};

/**
 * Preformat using a growable UTF-16 buffer to reduce intermediate allocations.
 *
 * This is primarily intended for experimentation on extremely large inputs where GC pressure
 * may dominate (e.g. 100MB+ strings). It must remain byte-for-byte identical to the concat path.
 *
 * @param text Input string
 * @returns Preformatted string
 */
const processStringBuffer = (text: string): string => {
    if (!text) {
        return '';
    }

    const len = text.length;
    let i = 0;

    // Heuristic: output is usually close to input size; allocate a bit more to reduce growth.
    const builder = new Utf16Builder(len + (len >> 3) + 64);

    let pendingSpaces = 0;
    let lastCode = 0;

    while (i < len) {
        let code = text.charCodeAt(i);
        const originalCode = code;
        const flags = CHAR_MAP[code];

        // ---------------------------------------------------------
        // 1. Handle Whitespace
        // ---------------------------------------------------------
        if (flags & F_SPACE) {
            pendingSpaces++;
            i++;
            continue;
        }

        // ---------------------------------------------------------
        // 2. Handle Special Characters (Newlines, Transforms)
        // ---------------------------------------------------------
        if (flags & F_SPECIAL) {
            // Newlines
            if (code === C_NEWLINE || code === C_CR) {
                pendingSpaces = 0;
                if (lastCode !== C_NEWLINE) {
                    builder.push(C_NEWLINE);
                    lastCode = C_NEWLINE;
                }
                // Skip subsequent whitespace
                i++;
                while (i < len) {
                    const next = text.charCodeAt(i);
                    if (next === C_SPACE || next === C_TAB || next === C_NEWLINE || next === C_CR) {
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // Transforms
            if (code === C_Q_MARK) {
                code = C_AR_Q_MARK;
            } else if (code === C_SEMICOLON) {
                code = C_AR_SEMICOLON;
            } else if (code === C_COMMA) {
                code = C_AR_COMMA;
            }

            // Condense Colons (.:. -> :)
            else if (code === C_COLON) {
                if (lastCode === C_DOT || lastCode === C_DASH) {
                    builder.pop();
                    lastCode = builder.last();
                }
                const next = text.charCodeAt(i + 1);
                if (next === C_DOT || next === C_DASH) {
                    i++;
                }
            }

            // Double Brackets
            else if (code === C_L_PAREN && text.charCodeAt(i + 1) === C_L_PAREN) {
                code = 171; // « (\u00AB)
                i++;
            } else if (code === C_R_PAREN && text.charCodeAt(i + 1) === C_R_PAREN) {
                code = 187; // » (\u00BB)
                i++;
            }

            // Ellipsis (...)
            else if (code === C_DOT) {
                if (lastCode === C_ELLIPSIS) {
                    i++;
                    continue;
                }
                if (lastCode === C_DOT) {
                    builder.pop();
                    builder.push(C_ELLIPSIS);
                    lastCode = C_ELLIPSIS;
                    i++;
                    continue;
                }
            }

            // Trailing Wow
            else if (code === C_WOW && lastCode === C_SPACE) {
                builder.push(C_WOW);
                lastCode = C_WOW;
                i++;
                while (i < len) {
                    const next = text.charCodeAt(i);
                    if (next === C_SPACE || next === C_TAB) {
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // Repeats (Tatweel, Underscore, Dash, Asterisk)
            else if (
                (code === C_TATWEEL && lastCode === C_TATWEEL) ||
                (code === C_UNDERSCORE && lastCode === C_UNDERSCORE) ||
                (code === C_DASH && lastCode === C_DASH) ||
                (code === C_ASTERISK && lastCode === C_ASTERISK)
            ) {
                i++;
                continue;
            }

            // Redundant Punctuation
            if ((lastCode === C_AR_Q_MARK || lastCode === C_EXCLAM) && (code === C_DOT || code === C_AR_COMMA)) {
                i++;
                continue;
            }
        }

        // ---------------------------------------------------------
        // 3. Resolve Pending Spaces
        // ---------------------------------------------------------
        if (pendingSpaces > 0) {
            let shouldEmitSpace = true;
            const currentFlags = CHAR_MAP[code];

            if (currentFlags & F_NO_SPACE_BEFORE) {
                shouldEmitSpace = false;
            }

            if (CHAR_MAP[lastCode] & F_OPENING) {
                shouldEmitSpace = false;
            }

            // Slash logic
            if (code === C_SLASH) {
                // Peek next non-space
                let nextNonSpace = 0;
                for (let k = i + 1; k < len; k++) {
                    const nc = text.charCodeAt(k);
                    if (nc !== C_SPACE && nc !== C_TAB && nc !== C_NEWLINE && nc !== C_CR) {
                        nextNonSpace = nc;
                        break;
                    }
                }

                if (CHAR_MAP[lastCode] & F_DIGIT && CHAR_MAP[nextNonSpace] & F_DIGIT) {
                    shouldEmitSpace = false;
                }
            }

            // No space after slash in references
            if (lastCode === C_SLASH && currentFlags & F_DIGIT) {
                if (builder.length >= 2 && CHAR_MAP[builder.secondLast()] & F_DIGIT) {
                    shouldEmitSpace = false;
                }
            }

            if (shouldEmitSpace) {
                builder.push(C_SPACE);
                lastCode = C_SPACE;
            }
            pendingSpaces = 0;
        }

        // ---------------------------------------------------------
        // 4. Insert Missing Spaces
        // ---------------------------------------------------------

        const currentFlags = CHAR_MAP[code];

        // Arabic <-> Number
        if (currentFlags & F_DIGIT && CHAR_MAP[lastCode] & F_ARABIC) {
            builder.push(C_SPACE);
            lastCode = C_SPACE;
        }

        // Space before Opening
        if (
            currentFlags & F_OPENING &&
            lastCode !== C_SPACE &&
            lastCode !== C_NEWLINE &&
            !(CHAR_MAP[lastCode] & F_OPENING) &&
            lastCode !== 0
        ) {
            builder.push(C_SPACE);
            lastCode = C_SPACE;
        }

        // Space after Punctuation
        if (CHAR_MAP[lastCode] & F_PUNCT) {
            const isSpecial =
                currentFlags & (F_SPACE | F_CLOSING | F_OPENING) ||
                code === C_SPACE ||
                code === C_NEWLINE ||
                code === C_CR ||
                currentFlags & F_CLOSING ||
                code === 34 ||
                code === 39 ||
                code === 187 ||
                code === 8221 ||
                code === lastCode ||
                ((lastCode === C_AR_Q_MARK || lastCode === C_EXCLAM) && (code === C_DOT || code === C_AR_COMMA));

            if (!isSpecial) {
                builder.push(C_SPACE);
                lastCode = C_SPACE;
            }
        }

        // ---------------------------------------------------------
        // 5. Emit
        // ---------------------------------------------------------
        if (code !== originalCode) {
            builder.push(code);
        } else {
            builder.push(originalCode);
        }
        lastCode = code;
        i++;
    }

    return builder.toStringTrimmed();
};

/**
 * Internal (non-public) variant: baseline `+=` builder.
 */
export const preformatArabicTextConcat = (text: string): string => processStringConcat(text);

/**
 * Internal (non-public) variant: UTF-16 buffer builder to reduce intermediate allocations.
 */
export const preformatArabicTextBuffer = (text: string): string => processStringBuffer(text);


