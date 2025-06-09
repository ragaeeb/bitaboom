import { describe, expect, it } from 'vitest';

import {
    cleanSymbolsAndPartReferences,
    cleanTrailingPageNumbers,
    removeDeathYear,
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
        it.skip('should remove the references but keep possible indexes', () => {
            expect(cleanSymbolsAndPartReferences('This is a text (1) (2/3)')).toBe('This is a text  1     ');
        });

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

        it.skip('should remove text with mixed elements', () => {
            expect(cleanSymbolsAndPartReferences('Mixed (1) [2] «3» 1/2 [1/2] ;.,!')).toBe('Mixed  1       , ');
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
