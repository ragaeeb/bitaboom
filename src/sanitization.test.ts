import { describe, expect, it } from 'bun:test';

import {
    cleanSymbolsAndPartReferences,
    cleanTrailingPageNumbers,
    makeDiacriticInsensitive,
    removeDeathYear,
    removeMarkdownFormatting,
    removeNumbersAndDashes,
    removeSingleDigitReferences,
    removeUrls,
    replaceLineBreaksWithSpaces,
    stripAllDigits,
    truncate,
    truncateMiddle,
    unescapeSpaces,
} from './sanitization';

describe('sanitization', () => {
    describe('cleanSymbolsAndPartReferences', () => {
        it('should remove the references but keep possible indexes', () => {
            expect(cleanSymbolsAndPartReferences('Another example [1] [1/2]')).toBe('Another example  ');
        });

        it('should remove the part references', () => {
            expect(cleanSymbolsAndPartReferences('Part references 1/2 2/3/4')).toBe('Part references    ');
        });

        it('should remove various symbols', () => {
            expect(cleanSymbolsAndPartReferences('Hello، world! {test} <example> …')).toBe(
                'Hello  world   test   example   ',
            );
        });

        it('should handle text with backslashes and forward slashes', () => {
            expect(cleanSymbolsAndPartReferences('File path is C:\\folder\\file / Unix path is /usr/bin/')).toBe(
                'File path is C  folder file   Unix path is  usr bin ',
            );
        });

        it('should remove Arabic symbols and characters', () => {
            expect(cleanSymbolsAndPartReferences('Arabic example: ﴿س﴾ ۝')).toBe('Arabic example   س   ');
        });
    });

    describe('cleanTrailingPageNumbers', () => {
        it('should remove the trailing page numbers in the text', () => {
            expect(cleanTrailingPageNumbers('This is some -[46]- text')).toBe('This is some  text');
        });
    });

    describe('makeDiacriticInsensitive', () => {
        it('handles basic Arabic text without diacritics', () => {
            const result = makeDiacriticInsensitive('مرحبا');
            expect(result).toBe(
                'م[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*ر[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*ح[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*ب[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*[\u0627\u0622\u0623\u0625][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*',
            );
        });

        it('handles alif variants (ا, آ, أ, إ)', () => {
            // All alif variants should create the same character class
            const pattern1 = makeDiacriticInsensitive('ا');
            const pattern2 = makeDiacriticInsensitive('آ');
            const pattern3 = makeDiacriticInsensitive('أ');
            const pattern4 = makeDiacriticInsensitive('إ');

            const expectedClass = '[\u0627\u0622\u0623\u0625][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*';
            expect(pattern1).toBe(expectedClass);
            expect(pattern2).toBe(expectedClass);
            expect(pattern3).toBe(expectedClass);
            expect(pattern4).toBe(expectedClass);
        });

        it('handles ta marbuta and ha equivalence (ة ↔ ه)', () => {
            const pattern1 = makeDiacriticInsensitive('ة');
            const pattern2 = makeDiacriticInsensitive('ه');

            const expectedClass = '[\u0629\u0647][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*';
            expect(pattern1).toBe(expectedClass);
            expect(pattern2).toBe(expectedClass);
        });

        it('handles ya variants (ى ↔ ي)', () => {
            const pattern1 = makeDiacriticInsensitive('ى');
            const pattern2 = makeDiacriticInsensitive('ي');

            const expectedClass = '[\u0649\u064A][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*';
            expect(pattern1).toBe(expectedClass);
            expect(pattern2).toBe(expectedClass);
        });

        it('handles mixed equivalent characters', () => {
            const result = makeDiacriticInsensitive('مدرسة');
            // ة should be converted to equivalence class with ه
            expect(result).toContain('[\u0629\u0647][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*');
        });

        it('handles single character', () => {
            const result = makeDiacriticInsensitive('م');
            expect(result).toBe('م[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*');
        });

        it('handles empty string', () => {
            const result = makeDiacriticInsensitive('');
            expect(result).toBe('');
        });

        it('handles non-Arabic characters', () => {
            const result = makeDiacriticInsensitive('hello');
            // Non-Arabic chars should be escaped and have diacritic matcher
            expect(result).toBe(
                'h[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*e[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*l[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*l[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*o[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*',
            );
        });

        it('handles mixed Arabic and English', () => {
            const result = makeDiacriticInsensitive('hello مرحبا');
            expect(result).toContain('h[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*');
            expect(result).toContain('[\u0627\u0622\u0623\u0625][\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]*');
        });

        it('handles special regex characters', () => {
            const result = makeDiacriticInsensitive('test.+*?');
            // Special regex chars should be escaped
            expect(result).toContain('\\.');
            expect(result).toContain('\\+');
            expect(result).toContain('\\*');
            expect(result).toContain('\\?');
        });

        it('normalizes whitespace', () => {
            const result1 = makeDiacriticInsensitive('مرحبا   بكم');
            const result2 = makeDiacriticInsensitive('مرحبا بكم');
            // Multiple spaces should be collapsed to single space
            expect(result1).toBe(result2);
        });

        it('trims whitespace', () => {
            const result1 = makeDiacriticInsensitive('  مرحبا  ');
            const result2 = makeDiacriticInsensitive('مرحبا');
            expect(result1).toBe(result2);
        });

        it('handles ZWJ/ZWNJ characters', () => {
            // Zero-width joiner (U+200D) and non-joiner (U+200C) should be removed
            const textWithZWJ = 'مر\u200Dحبا';
            const textWithZWNJ = 'مر\u200Cحبا';
            const normalText = 'مرحبا';

            const result1 = makeDiacriticInsensitive(textWithZWJ);
            const result2 = makeDiacriticInsensitive(textWithZWNJ);
            const result3 = makeDiacriticInsensitive(normalText);

            expect(result1).toBe(result3);
            expect(result2).toBe(result3);
        });

        it('handles NFC normalization', () => {
            // Test with composed vs decomposed characters if applicable
            const result = makeDiacriticInsensitive('مرحبا');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('creates functional regex pattern', () => {
            const pattern = makeDiacriticInsensitive('مرحبا');
            const regex = new RegExp(pattern);

            // Should match the original text
            expect(regex.test('مرحبا')).toBeTrue();

            // Should match with different alif variant
            expect(regex.test('مرحبأ')).toBeTrue();

            // Should match with diacritics
            expect(regex.test('مَرْحَبَا')).toBeTrue();
        });
    });

    describe('replaceLineBreaksWithSpaces', () => {
        it('should convert the new line to a space', () => {
            expect(replaceLineBreaksWithSpaces('a\nb')).toBe('a b');
        });
    });

    describe('stripAllDigits', () => {
        it('should remove all the numbers', () => {
            expect(stripAllDigits('abcd245')).toBe('abcd');
        });
    });

    describe('removeDeathYear', () => {
        it('should remove all variations', () => {
            expect(removeDeathYear('Sufyān ibn ‘Uyaynah (d. 198h) said:')).toEqual('Sufyān ibn ‘Uyaynah said:');
            expect(removeDeathYear('Sufyān ibn ‘Uyaynah [d. 200H] said:')).toEqual('Sufyān ibn ‘Uyaynah said:');
        });

        it('should not remove died keyword', () => {
            expect(removeDeathYear('Sufyān ibn ‘Uyaynah (died 198H) said:')).toEqual(
                'Sufyān ibn ‘Uyaynah (died 198H) said:',
            );
            expect(removeDeathYear('Sufyān ibn ‘Uyaynah [died 15H] said:')).toEqual(
                'Sufyān ibn ‘Uyaynah [died 15H] said:',
            );
        });
    });

    describe('removeMarkdownFormatting', () => {
        it('removes bold formatting', () => {
            expect(removeMarkdownFormatting('This is **bold** text')).toBe('This is bold text');
            expect(removeMarkdownFormatting('**Bold at start** and **bold at end**')).toBe(
                'Bold at start and bold at end',
            );
        });

        it('removes italic formatting', () => {
            expect(removeMarkdownFormatting('This is *italic* text')).toBe('This is italic text');
            expect(removeMarkdownFormatting('*Italic at start* and *italic at end*')).toBe(
                'Italic at start and italic at end',
            );
        });

        it('removes bold before italics (correct order)', () => {
            expect(removeMarkdownFormatting('**bold** and *italic*')).toBe('bold and italic');
        });

        it('removes headers', () => {
            expect(removeMarkdownFormatting('# Header 1')).toBe('Header 1');
            expect(removeMarkdownFormatting('## Header 2')).toBe('Header 2');
            expect(removeMarkdownFormatting('### Header 3')).toBe('Header 3');
            expect(removeMarkdownFormatting('#### Header 4')).toBe('Header 4');
        });

        it('removes unordered list markers', () => {
            expect(removeMarkdownFormatting('- Item 1')).toBe('Item 1');
            expect(removeMarkdownFormatting('* Item 2')).toBe('Item 2');
            expect(removeMarkdownFormatting('+ Item 3')).toBe('Item 3');
            expect(removeMarkdownFormatting('  - Indented item')).toBe('Indented item');
        });

        it('removes ordered list markers', () => {
            expect(removeMarkdownFormatting('1. First item')).toBe('First item');
            expect(removeMarkdownFormatting('2. Second item')).toBe('Second item');
            expect(removeMarkdownFormatting('10. Tenth item')).toBe('Tenth item');
            expect(removeMarkdownFormatting('  3. Indented item')).toBe('Indented item');
        });

        it('removes backticks', () => {
            expect(removeMarkdownFormatting('This has `code` in it')).toBe('This has code in it');
            expect(removeMarkdownFormatting('`Multiple` `backticks` here')).toBe('Multiple backticks here');
        });

        it('handles multiline content', () => {
            const input = `# Title
- Item 1
- Item 2
This is **bold** and *italic*`;
            const expected = `Title
Item 1
Item 2
This is bold and italic`;
            expect(removeMarkdownFormatting(input)).toBe(expected);
        });

        it('handles empty string', () => {
            expect(removeMarkdownFormatting('')).toBe('');
        });

        it('handles text without formatting', () => {
            const plain = 'This is plain text';
            expect(removeMarkdownFormatting(plain)).toBe(plain);
        });
    });

    describe('removeNumbersAndDashes', () => {
        it('should remove all numbers and dashes', () => {
            expect(removeNumbersAndDashes('ABCD 123-Xyz')).toEqual('ABCD Xyz');
        });
    });

    describe('removeSingleDigitReferences', () => {
        it('should all single digit references', () => {
            expect(removeSingleDigitReferences('Ref (1), Ref «2», Ref [3]')).toEqual('Ref , Ref , Ref ');
        });
    });

    describe('removeUrls', () => {
        it('should remove the url', () => {
            expect(removeUrls('It should remove both https://abc.com and http://google.com from this')).toEqual(
                'It should remove both  and  from this',
            );
        });
    });

    describe('truncateMiddle', () => {
        it('should return the original text when it is shorter than max length', () => {
            expect(truncateMiddle('Short text', 50)).toBe('Short text');
        });

        it('should return the original text when it equals max length', () => {
            expect(truncateMiddle('Hello', 5)).toBe('Hello');
        });

        it('should truncate with default parameters', () => {
            expect(truncateMiddle('The quick brown fox jumps right over the lazy dog')).toBe(
                'The quick brown fox jumps right over the lazy dog',
            );
        });

        it('should truncate with custom max length', () => {
            expect(truncateMiddle('The quick brown fox jumps right over the lazy dog', 20)).toBe(
                'The quick bro…zy dog',
            );
        });

        it('should truncate with custom end length', () => {
            expect(truncateMiddle('The quick brown fox jumps right over the lazy dog', 25, 8)).toBe(
                'The quick brown …lazy dog',
            );
        });

        it('should handle very short max length by falling back to normal truncation', () => {
            expect(truncateMiddle('Hello world', 5, 10)).toBe('Hell…');
        });

        it('should handle custom end length of 3 characters', () => {
            expect(truncateMiddle('abcdefghijklmnopqrstuvwxyz', 10, 3)).toBe('abcdef…xyz');
        });

        it('should handle empty string', () => {
            expect(truncateMiddle('', 10)).toBe('');
        });

        it('should handle single character string', () => {
            expect(truncateMiddle('a', 10)).toBe('a');
        });

        it('should calculate default end length correctly', () => {
            expect(truncateMiddle('abcdefghijklmnopqrstuvwxyz', 15)).toBe('abcdefghi…vwxyz');
        });

        it('should enforce minimum end length of 3', () => {
            expect(truncateMiddle('Hello world test', 8)).toBe('Hell…est');
        });

        it('should handle exact boundary cases', () => {
            expect(truncateMiddle('Hello world', 11)).toBe('Hello world');
            expect(truncateMiddle('Hello world', 10, 5)).toBe('Hell…world');
        });
    });

    describe('truncate', () => {
        it('less than max', () => {
            expect(truncate('test')).toBe('test');
        });

        it('more than max', () => {
            expect(truncate('123456', 5)).toBe('1234…');
        });
    });

    describe('unescapeSpaces', () => {
        it('should replace escaped spaces with regular spaces', () => {
            expect(unescapeSpaces('My\\ Folder\\ Name')).toBe('My Folder Name');
        });

        it('should handle multiple escaped spaces', () => {
            expect(unescapeSpaces('path\\ with\\ many\\ spaces')).toBe('path with many spaces');
        });

        it('should trim whitespace from both ends', () => {
            expect(unescapeSpaces('  /path/to/My\\ Document.txt  ')).toBe('/path/to/My Document.txt');
        });

        it('should handle strings without escaped spaces', () => {
            expect(unescapeSpaces('regular text')).toBe('regular text');
        });

        it('should handle empty string', () => {
            expect(unescapeSpaces('')).toBe('');
        });

        it('should handle only whitespace', () => {
            expect(unescapeSpaces('   ')).toBe('');
        });

        it('should handle escaped spaces at the beginning and end', () => {
            expect(unescapeSpaces('\\ leading and trailing\\ ')).toBe('leading and trailing');
        });

        it('should handle mixed escaped and regular spaces', () => {
            expect(unescapeSpaces('normal spaces\\ and\\ escaped')).toBe('normal spaces and escaped');
        });

        it('should handle file paths with escaped spaces', () => {
            expect(unescapeSpaces('/Users/xyz/My\\ Documents/Important\\ File.pdf')).toBe(
                '/Users/xyz/My Documents/Important File.pdf',
            );
        });
    });
});
