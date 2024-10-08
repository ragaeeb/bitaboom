import { describe, expect, it } from 'vitest';

import {
    addSpaceBetweenArabicTextAndNumbers,
    cleanExtremeArabicUnderscores,
    convertUrduSymbolsToArabic,
    fixTrailingWow,
    normalizeAlifVariants,
    removeNonIndexSignatures,
    removeSingularCodes,
    removeSolitaryArabicLetters,
    replaceAlifMaqsurah,
    replaceEnglishPunctuationWithArabic,
    replaceTaMarbutahWithHa,
    stripDiacritics,
    stripEnglishCharactersAndSymbols,
    stripZeroWidthCharacters,
} from './arabic';

describe('arabic', () => {
    describe('cleanExtremeArabicUnderscores', () => {
        it('should not affect hijri dates', () => {
            expect(cleanExtremeArabicUnderscores('اهـ')).toBe('اهـ');
        });

        it('should get rid of the ending character', () => {
            expect(cleanExtremeArabicUnderscores('ـThis is a textـ')).toBe('This is a text');
        });

        it('should not affect the Hijri year', () => {
            expect(cleanExtremeArabicUnderscores('ـAnother example with 1422هـ')).toBe('Another example with 1422هـ');
        });

        it('should process the multiline text', () => {
            expect(cleanExtremeArabicUnderscores('ـA multiline stringـ\nـwith several linesـ\n1423هـ')).toBe(
                'A multiline string\nwith several lines\n1423هـ',
            );
        });

        it('should not affect years that are in the middle of the sentence', () => {
            expect(
                cleanExtremeArabicUnderscores(
                    'This is a normal line\nـAnd this one starts with the characterـ\nAnd 1424هـ remains unchanged',
                ),
            ).toBe('This is a normal line\nAnd this one starts with the character\nAnd 1424هـ remains unchanged');
        });
    });

    describe('convertUrduSymbolsToArabic', () => {
        it('should convert the text', () => {
            expect(convertUrduSymbolsToArabic('ھذا كذب موضوع باتفاق أھل العلم بالحدیث، فیجب تكذیبھ ورده')).toEqual(
                'هذا كذب موضوع باتفاق أهل العلم بالحديث، فيجب تكذيبه ورده',
            );
        });
    });

    describe('fixTrailingWow', () => {
        it('should fix trailing wow', () => {
            expect(fixTrailingWow('السلام عليكم و رحمة الله وبركاته الطرخون او ورق و')).toBe(
                'السلام عليكم ورحمة الله وبركاته الطرخون او ورق و',
            );
        });

        it('should fix another trailing wow', () => {
            expect(fixTrailingWow('الأشاعرة لكنهما ما قصدوا مخالفة الكتاب و السنة و إنما وهموا و ظنوا')).toBe(
                'الأشاعرة لكنهما ما قصدوا مخالفة الكتاب والسنة وإنما وهموا وظنوا',
            );
        });
    });

    describe('addSpaceBetweenArabicTextAndNumbers', () => {
        it('should insert a space between Arabic text and number', () => {
            expect(addSpaceBetweenArabicTextAndNumbers('الآية37')).toBe('الآية 37');
        });

        it('should insert a space between Arabic text and number in a sentence', () => {
            expect(addSpaceBetweenArabicTextAndNumbers('قال29 وأجاب43')).toBe('قال 29 وأجاب 43');
        });

        it('should not insert space between Arabic text and non-number characters', () => {
            expect(addSpaceBetweenArabicTextAndNumbers('الآية: ثلاثون وسبعة')).toBe('الآية: ثلاثون وسبعة');
        });

        it('should handle a string with no Arabic text and number', () => {
            expect(addSpaceBetweenArabicTextAndNumbers('Hello World123')).toBe('Hello World123');
        });
    });

    describe('stripEnglishCharactersAndSymbols', () => {
        it('should remove ampersand', () => {
            expect(stripEnglishCharactersAndSymbols(`أحب & لنفسي`)).toEqual('أحب   لنفسي');
        });
    });

    describe('removeNonIndexSignatures', () => {
        it('should not remove numbers that are more than 1 digit', () => {
            expect(removeNonIndexSignatures('وهب  وقال   لوحه 121 الجرح')).toEqual('وهب  وقال   لوحه 121 الجرح');
        });

        it('should remove 1 digit numbers in between Arabic texts', () => {
            expect(removeNonIndexSignatures('الورقه 3 المصدر')).toEqual('الورقه المصدر');
        });

        it('should not remove indexes', () => {
            expect(removeNonIndexSignatures('123 - الرقم')).toEqual('123 - الرقم');
        });

        it('should remove consecutive numbers', () => {
            expect(removeNonIndexSignatures('سنه 695 6 واكثر')).toEqual('سنه   واكثر');
        });

        it('should remove three consecutive numbers', () => {
            expect(removeNonIndexSignatures('معجم الشيوخ الورقه 35 69 2 الذهبي معجم الشيوخ')).toEqual(
                'معجم الشيوخ الورقه   الذهبي معجم الشيوخ',
            );
        });

        it('should not remove numbers', () => {
            expect(removeNonIndexSignatures('معجم الشيوخ الورقه 32 الذهبي معجم الشيوخ')).toEqual(
                'معجم الشيوخ الورقه 32 الذهبي معجم الشيوخ',
            );
        });

        it('should remove the series of numbers at end of the string', () => {
            expect(removeNonIndexSignatures('الورقه 175 171')).toEqual('الورقه  ');
        });

        it('should remove the dash between the words but not the number', () => {
            expect(removeNonIndexSignatures('123 - السنن - السنن 5')).toBe('123 - السنن   السنن 5');
        });

        it('should remove the dash', () => {
            expect(removeNonIndexSignatures('السنن - السنن')).toBe('السنن   السنن');
            expect(removeNonIndexSignatures('123- السنن -السنن 5')).toBe('123- السنن  السنن 5');
            expect(removeNonIndexSignatures('Some-Text With- Dashes-')).toBe('Some Text With  Dashes ');
            expect(removeNonIndexSignatures('العمل - في المكتب 3 أيام')).toBe('العمل   في المكتب أيام');
        });

        it('should be a no-op', () => {
            expect(removeNonIndexSignatures('No Dashes Here')).toBe('No Dashes Here');
            expect(removeNonIndexSignatures('123 - الرقم')).toBe('123 - الرقم');
            expect(removeNonIndexSignatures('الكتاب 1001 ليلة')).toBe('الكتاب 1001 ليلة');
        });

        it('should not touch the index', () => {
            expect(removeNonIndexSignatures('123 -')).toBe('123 -');
            expect(removeNonIndexSignatures('123 -')).toBe('123 -');
        });

        it('should remove number in the middle', () => {
            expect(removeNonIndexSignatures('اكتب 4 الرقم')).toBe('اكتب الرقم');
            expect(removeNonIndexSignatures('سنه 695 6 واكثر')).toBe('سنه   واكثر');
            expect(removeNonIndexSignatures('صوتي في اذنه 8 1 الذهبي')).toBe('صوتي في اذنه   الذهبي');
            expect(
                removeNonIndexSignatures('محمد بن وريده البغدادي الحنبلي شيخ المستنصريه 599 697 2 وقد هممت بالرحله'),
            ).toBe('محمد بن وريده البغدادي الحنبلي شيخ المستنصريه   وقد هممت بالرحله');
        });

        it('should remove the leading dash', () => {
            expect(removeNonIndexSignatures('-Leading Dash')).toBe(' Leading Dash');
        });
    });

    describe('removeSolitaryArabicLetters', () => {
        it('should not remove the lone ha since we want to keep it for hijri years', () => {
            expect(removeSolitaryArabicLetters('ا ئاسئله ئ شباب ب الشحر ص صفر ر ه ')).toBe(' ئاسئله شباب الشحر صفر ه ');
        });

        it.skip('should remove all the lone letters', () => {
            expect(removeSolitaryArabicLetters('ا ب ت ث ج ح خ د')).toBe(' ب ث ح د');
        });

        it('should remove the lone letters', () => {
            expect(removeSolitaryArabicLetters('واحد اثنان ثلاثة')).toBe('واحد اثنان ثلاثة');
            expect(removeSolitaryArabicLetters('ا هـــــ')).toBe(' هـــــ');
            expect(removeSolitaryArabicLetters('ب ا الكلمات ت')).toBe(' ا الكلمات ');
        });

        it('should be a no-op', () => {
            expect(removeSolitaryArabicLetters('لا شيء هنا')).toBe('لا شيء هنا');
        });
    });

    describe('removeSingularCodes', () => {
        it('should remove the single letters in brackets', () => {
            expect(removeSingularCodes('A B [س] C')).toEqual('A B  C');
        });
    });

    describe('replaceTaMarbutahWithHa', () => {
        it('should remove the ta marbutah with a ha', () => {
            expect(replaceTaMarbutahWithHa('مدرسة')).toEqual('مدرسه');
        });
    });

    describe('stripDiacritics', () => {
        it('should remove tatweel', () => {
            expect(stripDiacritics('أبـــتِـــكَةُ')).toEqual('أبتكة');
        });

        it('should remove tashkeel', () => {
            expect(stripDiacritics('مُحَمَّدٌ')).toEqual('محمد');
        });
    });

    describe('stripZeroWidthCharacters', () => {
        it('should remove the empty space', () => {
            const text = 'يَخْلُوَ ‏. ‏ قَالَ غَرِيبٌ ‏. ‏';
            const expected = 'يَخْلُوَ  .   قَالَ غَرِيبٌ  .  ';
            expect(stripZeroWidthCharacters(text)).toBe(expected);
        });
    });

    describe('replaceEnglishPunctuationWithArabic', () => {
        it('should replace english question mark and semicolon with Arabic ones', () => {
            expect(replaceEnglishPunctuationWithArabic('This; and, that?')).toEqual('This؛and، that؟');
        });
    });

    describe('replaceAlifMaqsurah', () => {
        it('should remove the Alif maqsurah with the ya', () => {
            expect(replaceAlifMaqsurah('رؤيى')).toEqual('رؤيي');
        });
    });

    describe('normalizeAlifVariants', () => {
        it('should simplify the alif with the basic one', () => {
            expect(normalizeAlifVariants('أإآ')).toEqual('ااا');
        });
    });
});
