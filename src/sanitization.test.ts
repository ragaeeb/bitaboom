import { describe, expect, it } from 'vitest';

import {
    cleanSymbolsAndPartReferences,
    cleanTrailingPageNumbers,
    lineBreaksToSpaces,
    removeAllDigits,
    removeDeathYear,
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

    describe('lineBreaksToSpaces', () => {
        it('should convert the new line to a space', () => {
            expect(lineBreaksToSpaces('a\nb')).toBe('a b');
        });
    });

    describe('removeAllDigits', () => {
        it('should remove all the numbers', () => {
            expect(removeAllDigits('abcd245')).toBe('abcd');
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
});
