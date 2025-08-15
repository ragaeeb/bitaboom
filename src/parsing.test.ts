import { describe, expect, it } from 'vitest';

import { isBalanced, isJsonStructureValid, normalizeJsonSyntax, parsePageRanges, splitByQuotes } from './parsing';

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

    describe('isBalanced', () => {
        describe('balanced strings', () => {
            it('should return true for string with balanced quotes and brackets', () => {
                expect(isBalanced('He said "Hello (world)!"')).toBe(true);
            });

            it('should return true for string with no quotes or brackets', () => {
                expect(isBalanced('Hello world')).toBe(true);
            });

            it('should return true for empty string', () => {
                expect(isBalanced('')).toBe(true);
            });

            it('should return true for balanced nested brackets', () => {
                expect(isBalanced('((([])))')).toBe(true);
            });

            it('should return true for multiple balanced quotes', () => {
                expect(isBalanced('"Hello" and "world"')).toBe(true);
            });

            it('should return true for complex balanced expression', () => {
                expect(isBalanced('function("param", [1, 2, {key: "value"}])')).toBe(true);
            });

            it('should return true for balanced Arabic text with punctuation', () => {
                expect(isBalanced('قال "مرحبا (بالعالم)!"')).toBe(true);
            });
        });

        describe('unbalanced quotes', () => {
            it('should return false for single unmatched quote', () => {
                expect(isBalanced('Hello "world')).toBe(false);
            });

            it('should return false for odd number of quotes', () => {
                expect(isBalanced('"Hello" and "world')).toBe(false);
            });

            it('should return false for three quotes', () => {
                expect(isBalanced('"""')).toBe(false);
            });

            it('should return false for unbalanced quotes with balanced brackets', () => {
                expect(isBalanced('He said "Hello (world)!')).toBe(false);
            });
        });

        describe('unbalanced brackets', () => {
            it('should return false for unmatched opening parenthesis', () => {
                expect(isBalanced('Hello (world')).toBe(false);
            });

            it('should return false for unmatched closing parenthesis', () => {
                expect(isBalanced('Hello world)')).toBe(false);
            });

            it('should return false for mismatched bracket types', () => {
                expect(isBalanced('Hello (world]')).toBe(false);
            });

            it('should return false for wrong nesting order', () => {
                expect(isBalanced('([)]')).toBe(false);
            });

            it('should return false for unmatched square brackets', () => {
                expect(isBalanced('[Hello world')).toBe(false);
            });

            it('should return false for unmatched curly braces', () => {
                expect(isBalanced('{Hello world')).toBe(false);
            });

            it('should return false for multiple unmatched brackets', () => {
                expect(isBalanced('(((')).toBe(false);
            });

            it('should return false for unbalanced brackets with balanced quotes', () => {
                expect(isBalanced('"Hello" (world')).toBe(false);
            });
        });

        describe('mixed unbalanced cases', () => {
            it('should return false when both quotes and brackets are unbalanced', () => {
                expect(isBalanced('He said "Hello (world')).toBe(false);
            });

            it('should return false for complex unbalanced expression', () => {
                expect(isBalanced('function("param", [1, 2, {key: "value"}')).toBe(false);
            });
        });

        describe('edge cases', () => {
            it('should handle strings with only quotes', () => {
                expect(isBalanced('""')).toBe(true);
                expect(isBalanced('"')).toBe(false);
            });

            it('should handle strings with only brackets', () => {
                expect(isBalanced('()')).toBe(true);
                expect(isBalanced('(')).toBe(false);
            });

            it('should handle strings with special characters', () => {
                expect(isBalanced('Hello! @#$%^&* (world)')).toBe(true);
            });

            it('should handle strings with numbers', () => {
                expect(isBalanced('Value is "123" and array[0]')).toBe(true);
            });

            it('should handle newlines and whitespace', () => {
                expect(isBalanced('Line 1\n"Line 2" (with brackets)\nLine 3')).toBe(true);
            });
        });
    });

    describe('parsePageRanges', () => {
        it('should parse single page number', () => {
            expect(parsePageRanges('5')).toEqual([5]);
        });

        it('should parse comma-separated page numbers', () => {
            expect(parsePageRanges('1,3,5,7')).toEqual([1, 3, 5, 7]);
        });

        it('should parse page range with dash', () => {
            expect(parsePageRanges('1-5')).toEqual([1, 2, 3, 4, 5]);
        });

        it('should parse single page range', () => {
            expect(parsePageRanges('10-12')).toEqual([10, 11, 12]);
        });

        it('should parse range with same start and end', () => {
            expect(parsePageRanges('7-7')).toEqual([7]);
        });

        it('should throw error when start page is greater than end page', () => {
            expect(() => parsePageRanges('10-5')).toThrow('Start page cannot be greater than end page');
        });

        it('should handle large ranges', () => {
            const result = parsePageRanges('98-100');
            expect(result).toEqual([98, 99, 100]);
            expect(result).toHaveLength(3);
        });

        it('should handle range starting from 1', () => {
            expect(parsePageRanges('1-3')).toEqual([1, 2, 3]);
        });

        it('should parse mixed comma input as individual pages', () => {
            expect(parsePageRanges('1,2,3')).toEqual([1, 2, 3]);
        });

        it('should handle string numbers correctly', () => {
            expect(parsePageRanges('001,002,003')).toEqual([1, 2, 3]);
        });

        it('should handle zero in ranges', () => {
            expect(parsePageRanges('0-2')).toEqual([0, 1, 2]);
        });
    });
});
