import { describe, expect, it } from 'vitest';

import { normalizeJsonSyntax, isJsonStructureValid, splitByQuotes } from './parsing';

describe('parsing', () => {
    describe('normalizeJsonSyntax', () => {
        it('should fix numeric keys and single-quoted values', () => {
            const result = normalizeJsonSyntax("{10: 'abc', 20: 'def'}");
            expect(result).toBe('{"10":"abc","20":"def"}');
        });

        it('should handle mixed quoted and unquoted keys and values', () => {
            const result = normalizeJsonSyntax('{10: "abc", "key": \'def\'}');
            expect(result).toBe('{"10":"abc","key":"def"}');
        });

        it('should handle an input that is already valid JSON', () => {
            const result = normalizeJsonSyntax('{"key": "value"}');
            expect(result).toBe('{"key":"value"}');
        });

        it('should return valid JSON for single numeric keys and values', () => {
            const result = normalizeJsonSyntax("{5: 'test'}");
            expect(result).toBe('{"5":"test"}');
        });
    });

    describe('isJsonStructureValid', () => {
        it('should return true for valid JSON-like string with numeric keys and single-quoted values', () => {
            const result = isJsonStructureValid("{10: 'abc', 20: 'def'}");
            expect(result).toBe(true);
        });

        it('should return true for mixed numeric and quoted keys with single/double quoted values', () => {
            const result = isJsonStructureValid("{10: 'abc', 'key': \"value\"}");
            expect(result).toBe(true);
        });

        it('should return true for a single numeric key-value pair', () => {
            const result = isJsonStructureValid("{10: 'abc'}");
            expect(result).toBe(true);
        });

        it('should return false for non-JSON-like strings', () => {
            const result = isJsonStructureValid('random string');
            expect(result).toBe(false);
        });

        it('should return false for malformed JSON-like structures', () => {
            const result = isJsonStructureValid('{key: value}');
            expect(result).toBe(false);
        });

        it('should return false for empty input', () => {
            const result = isJsonStructureValid('');
            expect(result).toBe(false);
        });
    });

    describe('splitByQuotes', () => {
        it('should split by spaces but keep quoted substrings intact', () => {
            const result = splitByQuotes('"This is" "a part of the" "string and"');
            expect(result).toEqual(['This is', 'a part of the', 'string and']);
        });

        it('should handle a mix of quoted and unquoted strings', () => {
            const result = splitByQuotes('Hello "this is" a "test case"');
            expect(result).toEqual(['Hello', 'this is', 'a', 'test case']);
        });

        it('should handle input with no quotes', () => {
            const result = splitByQuotes('no quotes here');
            expect(result).toEqual(['no', 'quotes', 'here']);
        });

        it('should return an empty array for empty input', () => {
            const result = splitByQuotes('');
            expect(result).toEqual([]);
        });

        it('should handle strings with multiple spaces between words', () => {
            const result = splitByQuotes('"multiple   spaces" between "words  here"');
            expect(result).toEqual(['multiple   spaces', 'between', 'words  here']);
        });

        it('should handle strings with only quotes', () => {
            const result = splitByQuotes('"" ""');
            expect(result).toEqual(['', '']);
        });

        it('should handle strings with a single word in quotes', () => {
            const result = splitByQuotes('"single"');
            expect(result).toEqual(['single']);
        });
    });
});
