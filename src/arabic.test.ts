import { describe, expect, it } from 'vitest';

import { convertUrduSymbolsToArabic, removeZeroWidthJoiners } from './arabic';

describe('arabic', () => {
    describe('convertUrduSymbolsToArabic', () => {
        it('should convert the text', () => {
            expect(convertUrduSymbolsToArabic('ھذا كذب موضوع باتفاق أھل العلم بالحدیث، فیجب تكذیبھ ورده')).toEqual(
                'هذا كذب موضوع باتفاق أهل العلم بالحديث، فيجب تكذيبه ورده',
            );
        });
    });

    describe('removeZeroWidthJoiners', () => {
        it('should remove the empty space', () => {
            const text = 'يَخْلُوَ ‏. ‏ قَالَ غَرِيبٌ ‏. ‏';
            const expected = 'يَخْلُوَ  .   قَالَ غَرِيبٌ  .  ';
            expect(removeZeroWidthJoiners(text)).toBe(expected);
        });
    });
});
