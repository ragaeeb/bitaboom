import { describe, expect, it } from 'vitest';

import { cleanTrailingPageNumbers, lineBreaksToSpaces, removeAllDigits, removeDeathYear } from './sanitization';

describe('sanitization', () => {
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
