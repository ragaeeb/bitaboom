import { describe, expect, it } from 'bun:test';

import {
    addSpaceBetweenArabicTextAndNumbers,
    arabicNumeralToNumber,
    cleanExtremeArabicUnderscores,
    convertUrduSymbolsToArabic,
    countWords,
    estimateTokenCount,
    fixTrailingWow,
    getArabicScore,
    LLMProvider,
    removeNonIndexSignatures,
    removeSingularCodes,
    removeSolitaryArabicLetters,
    replaceEnglishPunctuationWithArabic,
} from './arabic';

describe('arabicNumeralToNumber', () => {
    it('should convert single Arabic-Indic digits', () => {
        expect(arabicNumeralToNumber('٠')).toBe(0);
        expect(arabicNumeralToNumber('١')).toBe(1);
        expect(arabicNumeralToNumber('٢')).toBe(2);
        expect(arabicNumeralToNumber('٣')).toBe(3);
        expect(arabicNumeralToNumber('٤')).toBe(4);
        expect(arabicNumeralToNumber('٥')).toBe(5);
        expect(arabicNumeralToNumber('٦')).toBe(6);
        expect(arabicNumeralToNumber('٧')).toBe(7);
        expect(arabicNumeralToNumber('٨')).toBe(8);
        expect(arabicNumeralToNumber('٩')).toBe(9);
    });

    it('should convert multi-digit Arabic-Indic numbers', () => {
        expect(arabicNumeralToNumber('١٠')).toBe(10);
        expect(arabicNumeralToNumber('١٢٣')).toBe(123);
        expect(arabicNumeralToNumber('٤٥٦٧')).toBe(4567);
        expect(arabicNumeralToNumber('٩٨٧٦٥٤٣٢١٠')).toBe(9876543210);
    });

    it('should handle strings with leading zeros', () => {
        expect(arabicNumeralToNumber('٠٠١')).toBe(1);
        expect(arabicNumeralToNumber('٠٥٠')).toBe(50);
        expect(arabicNumeralToNumber('٠٠٠')).toBe(0);
    });

    it('should handle edge cases', () => {
        expect(arabicNumeralToNumber('٠')).toBe(0);
        expect(arabicNumeralToNumber('   ١٢٣   ')).toBe(123); // whitespace
    });

    it('should handle very large numbers', () => {
        const largeArabicIndic = '١٢٣٤٥٦٧٨٩٠١٢٣٤٥';
        const expected = 123456789012345;
        expect(arabicNumeralToNumber(largeArabicIndic)).toBe(expected);
    });

    it('should be consistent with manual conversion', () => {
        // Manual verification of the Unicode arithmetic
        const arabicIndic = '٩٨٧';
        const manual = 9 * 100 + 8 * 10 + 7 * 1;
        expect(arabicNumeralToNumber(arabicIndic)).toBe(manual);
        expect(arabicNumeralToNumber(arabicIndic)).toBe(987);
    });
});

describe('cleanExtremeArabicUnderscores', () => {
    it('should not affect hijri dates', () => {
        expect(cleanExtremeArabicUnderscores('اهـ')).toBe('اهـ');
        expect(cleanExtremeArabicUnderscores(`علينا فنتبع الهوى" اهـ.    حرر في: 1435/3/29 هـ`)).toBe(
            `علينا فنتبع الهوى" اهـ.    حرر في: 1435/3/29 هـ`,
        );
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

    it('should handle empty string', () => {
        expect(fixTrailingWow('')).toBe('');
    });

    it('should handle text with no trailing wow', () => {
        expect(fixTrailingWow('السلام عليكم ورحمة الله')).toBe('السلام عليكم ورحمة الله');
    });

    it('should not change text with diacritics on wow', () => {
        // The pattern only matches ' و ' (plain wow), not 'وَ' with diacritics
        expect(fixTrailingWow('الْكِتَابُ وَ السُّنَّةُ')).toBe('الْكِتَابُ وَ السُّنَّةُ');
    });

    it('should fix multiple occurrences of trailing wow', () => {
        expect(fixTrailingWow('أ و ب و ج و د')).toBe('أ وب وج ود');
    });
});

describe('getArabicScore', () => {
    it('returns 0 for empty string', () => {
        expect(getArabicScore('')).toBe(0);
    });

    it('returns 0 for null/undefined', () => {
        expect(getArabicScore(null as any)).toBe(0);
        expect(getArabicScore(undefined as any)).toBe(0);
    });

    it('returns 1 for pure Arabic text', () => {
        expect(getArabicScore('مرحبا')).toBe(1);
        expect(getArabicScore('السلام عليكم')).toBe(1);
        expect(getArabicScore('العربية')).toBe(1);
    });

    it('returns 0 for pure English text', () => {
        expect(getArabicScore('hello')).toBe(0);
        expect(getArabicScore('hello world')).toBe(0);
        expect(getArabicScore('English text')).toBe(0);
    });

    it('returns 0 for text with only whitespace', () => {
        expect(getArabicScore('   ')).toBe(0);
        expect(getArabicScore(' \t\n ')).toBe(0);
    });

    it('returns 0 for text with only numbers', () => {
        expect(getArabicScore('123')).toBe(0);
        expect(getArabicScore('456 789')).toBe(0);
    });

    it('calculates correct ratio for mixed Arabic/English', () => {
        // "hello مرحبا" - 5 English + 5 Arabic = 5/10 = 0.5
        expect(getArabicScore('hello مرحبا')).toBe(0.5);
    });

    it('ignores whitespace in ratio calculation', () => {
        // "a   ب" should be 1 English + 1 Arabic = 1/2 = 0.5 (spaces ignored)
        expect(getArabicScore('a   ب')).toBe(0.5);
    });

    it('ignores numbers in ratio calculation', () => {
        // "a123ب456" should be 1 English + 1 Arabic = 1/2 = 0.5 (numbers ignored)
        expect(getArabicScore('a123ب456')).toBe(0.5);
    });

    it('handles Arabic with numbers and spaces', () => {
        // "مرحبا 123" should be 5 Arabic characters out of 5 total = 1.0
        expect(getArabicScore('مرحبا 123')).toBe(1);
    });

    it('handles English with numbers and spaces', () => {
        // "hello 123" should be 5 English characters out of 5 total = 0.0
        expect(getArabicScore('hello 123')).toBe(0);
    });

    it('handles text with only punctuation', () => {
        expect(getArabicScore('!@#$%')).toBe(0);
    });

    it('handles different Arabic Unicode ranges', () => {
        // Test different Arabic character ranges
        expect(getArabicScore('ا')).toBe(1); // Basic Arabic
        expect(getArabicScore('ء')).toBe(1); // Arabic supplement
        // Note: Extended ranges would need actual characters from those ranges to test
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

    it('should handle empty string', () => {
        expect(addSpaceBetweenArabicTextAndNumbers('')).toBe('');
    });

    it('should handle text with diacritics before numbers', () => {
        expect(addSpaceBetweenArabicTextAndNumbers('الآيَةُ37')).toBe('الآيَةُ 37');
    });

    it('should handle multiple Arabic-number transitions', () => {
        expect(addSpaceBetweenArabicTextAndNumbers('سورة1 آية2 جزء3')).toBe('سورة 1 آية 2 جزء 3');
    });

    it('should already have space - no change', () => {
        expect(addSpaceBetweenArabicTextAndNumbers('الآية 37')).toBe('الآية 37');
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

describe('replaceEnglishPunctuationWithArabic', () => {
    it('should replace english question mark and semicolon with Arabic ones', () => {
        expect(replaceEnglishPunctuationWithArabic('This; and, that?')).toEqual('This؛and، that؟');
    });
});

describe('countWords', () => {
    it('should return 0 for empty string', () => {
        expect(countWords('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
        expect(countWords('   \n\t  ')).toBe(0);
    });

    it('should count English words correctly', () => {
        expect(countWords('hello world')).toBe(2);
        expect(countWords('one two three four five')).toBe(5);
    });

    it('should count Arabic words correctly', () => {
        expect(countWords('بسم الله الرحمن الرحيم')).toBe(4);
        expect(countWords('السلام عليكم')).toBe(2);
    });

    it('should handle mixed whitespace', () => {
        expect(countWords('word1  word2\nword3\t\tword4')).toBe(4);
    });

    it('should trim leading and trailing whitespace', () => {
        expect(countWords('  hello world  ')).toBe(2);
    });
});

describe('estimateTokenCount', () => {
    describe('edge cases', () => {
        it('should return 0 for empty string', () => {
            expect(estimateTokenCount('')).toBe(0);
        });

        it('should return 0 for null/undefined', () => {
            expect(estimateTokenCount(null as any)).toBe(0);
            expect(estimateTokenCount(undefined as any)).toBe(0);
        });

        it('should handle whitespace-only string', () => {
            expect(estimateTokenCount('   ')).toBeGreaterThanOrEqual(0);
            expect(estimateTokenCount('\t\t')).toBeGreaterThanOrEqual(0);
            expect(estimateTokenCount('\n\n')).toBeGreaterThanOrEqual(0);
        });
    });

    describe('plain English text', () => {
        it('should estimate tokens for simple English text', () => {
            // ~4 chars per token for Latin text
            const result = estimateTokenCount('Hello world');
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(5);
        });

        it('should handle longer English text', () => {
            const text = 'The quick brown fox jumps over the lazy dog';
            const result = estimateTokenCount(text);
            // 43 chars / 4 ≈ 11 tokens
            expect(result).toBeGreaterThanOrEqual(8);
            expect(result).toBeLessThanOrEqual(15);
        });
    });

    describe('plain Arabic text', () => {
        it('should estimate tokens for Arabic base characters', () => {
            const text = 'السلام عليكم';
            const result = estimateTokenCount(text);
            expect(result).toBeGreaterThan(0);
        });

        it('should estimate higher tokens for Arabic vs English of similar meaning', () => {
            // Arabic uses ~3x more tokens than English
            const arabic = 'بسم الله الرحمن الرحيم';
            const english = 'In the name of God';
            const arabicTokens = estimateTokenCount(arabic);
            const englishTokens = estimateTokenCount(english);
            // Arabic should use more tokens
            expect(arabicTokens).toBeGreaterThan(englishTokens);
        });
    });

    describe('Arabic diacritics (tashkeel)', () => {
        it('should add overhead when diacritics are present', () => {
            const withDiacritics = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
            const withoutDiacritics = 'بسم الله الرحمن الرحيم';

            const tokensWith = estimateTokenCount(withDiacritics);
            const tokensWithout = estimateTokenCount(withoutDiacritics);

            // Diacritized version should have more tokens (overhead)
            expect(tokensWith).toBeGreaterThan(tokensWithout);
        });

        it('should handle isolated diacritics', () => {
            // Individual diacritics (rare but possible)
            const diacriticsOnly = 'ـِـَـُـْـّـً';
            const result = estimateTokenCount(diacriticsOnly);
            expect(result).toBeGreaterThanOrEqual(0);
        });
    });

    describe('tatweel (kashida)', () => {
        it('should handle tatweel characters', () => {
            const withTatweel = 'الـلـه';
            const withoutTatweel = 'الله';

            const tokensWith = estimateTokenCount(withTatweel);
            const tokensWithout = estimateTokenCount(withoutTatweel);

            // Tatweel adds some characters but may be minimal impact
            expect(tokensWith).toBeGreaterThanOrEqual(tokensWithout);
        });

        it('should handle extended tatweel', () => {
            const extendedTatweel = 'اللــــــه';
            const result = estimateTokenCount(extendedTatweel);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe('Latin diacritics (transliteration)', () => {
        it('should handle Latin diacritics for transliteration', () => {
            // Common transliteration characters
            const transliterated = "Qur'ān ḥadīth";
            const plain = 'Quran hadith';

            const transTokens = estimateTokenCount(transliterated);
            const plainTokens = estimateTokenCount(plain);

            // Transliterated may have slight overhead
            expect(transTokens).toBeGreaterThanOrEqual(plainTokens);
        });

        it('should handle various Latin diacritics', () => {
            const withDiacritics = 'āīūḥṣṭẓʿʾ';
            const result = estimateTokenCount(withDiacritics);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed transliteration text', () => {
            const text = 'The book al-Bukhārī mentions the ḥadīth';
            const result = estimateTokenCount(text);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe('numerals', () => {
        it('should handle Western numerals', () => {
            const westernNumerals = '1234567890';
            const result = estimateTokenCount(westernNumerals);
            // ~2-3 digits per token
            expect(result).toBeGreaterThanOrEqual(2);
            expect(result).toBeLessThanOrEqual(6);
        });

        it('should handle Arabic-Indic numerals', () => {
            const arabicNumerals = '١٢٣٤٥٦٧٨٩٠';
            const result = estimateTokenCount(arabicNumerals);
            expect(result).toBeGreaterThanOrEqual(2);
            expect(result).toBeLessThanOrEqual(6);
        });

        it('should handle mixed numerals in text', () => {
            const mixed = 'الآية 37 من سورة البقرة';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe('whitespace handling', () => {
        it('should handle single spaces', () => {
            const withSpaces = 'hello world test';
            const result = estimateTokenCount(withSpaces);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle multiple spaces', () => {
            const multipleSpaces = 'hello    world';
            const result = estimateTokenCount(multipleSpaces);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle tabs', () => {
            const withTabs = 'hello\tworld\ttest';
            const result = estimateTokenCount(withTabs);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle newlines', () => {
            const withNewlines = 'hello\nworld\ntest';
            const result = estimateTokenCount(withNewlines);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed whitespace', () => {
            const mixed = 'hello \t\n world';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe('mixed content', () => {
        it('should handle Arabic and English mix', () => {
            const mixed = 'Hello السلام عليكم World';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Arabic, English, and numbers', () => {
            const mixed = 'P123 - السلام عليكم 456';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle full bilingual sentence', () => {
            const bilingual = 'The word الله means God in Arabic';
            const result = estimateTokenCount(bilingual);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Arabic diacritics mixed with English', () => {
            const mixed = 'The phrase بِسْمِ اللَّهِ means In the name of God';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Latin diacritics mixed with Arabic', () => {
            const mixed = 'الإمام al-Bukhārī wrote الصحيح';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle both Arabic and Latin diacritics together', () => {
            const mixed = 'بِسْمِ اللَّهِ - In the name of Allāh';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed punctuation (English and Arabic)', () => {
            const mixed = 'What is السلام? Answer: عليكم!';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Arabic punctuation mixed with English', () => {
            const mixed = 'He said «Hello» and they replied: مرحباً؟';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed content with line breaks', () => {
            const mixed = 'English line\nالسطر العربي\nAnother English line';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed content with tabs and spaces', () => {
            const mixed = 'Word1\tكلمة\t Word2   عبارة';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle complex bilingual paragraph', () => {
            const complex = `The Qur'ān (القرآن الكريم) is the holy book.
It contains verses (آيات) revealed to the Prophet ﷺ.
Scholars like al-Bukhārī (البخاري) compiled ḥadīth collections.`;
            const result = estimateTokenCount(complex);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Arabic with English abbreviations and numbers', () => {
            const mixed = 'سورة البقرة (Ch. 2) verses 1-5 / الآيات ١-٥';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle transliteration with original Arabic', () => {
            const mixed = "al-ḥamdu lillāh (الحمد لله) - 'All praise is due to God'";
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle mixed content with various whitespace types', () => {
            const mixed = 'Start\n\nالفقرة\t\tMiddle\r\nEnd عربي';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle bilingual text with guillemets and quotes', () => {
            const mixed = 'He read «الفاتحة» and said: "This is beautiful"';
            const result = estimateTokenCount(mixed);
            expect(result).toBeGreaterThan(0);
        });

        it('should compare mixed content across providers', () => {
            const mixed = 'بِسْمِ اللَّهِ - In the name of Allāh (God)';

            const gemini = estimateTokenCount(mixed, LLMProvider.Gemini);
            const openai = estimateTokenCount(mixed, LLMProvider.OpenAI);
            const claude = estimateTokenCount(mixed, LLMProvider.Claude);

            // All should return positive values
            expect(gemini).toBeGreaterThan(0);
            expect(openai).toBeGreaterThan(0);
            expect(claude).toBeGreaterThan(0);

            // Gemini should be most efficient, Claude least
            expect(gemini).toBeLessThanOrEqual(openai);
            expect(claude).toBeGreaterThanOrEqual(openai);
        });
    });

    describe('LLM provider-specific estimation', () => {
        const testText = 'بسم الله الرحمن الرحيم';

        it('should accept LLMProvider.Generic (default)', () => {
            const result = estimateTokenCount(testText, LLMProvider.Generic);
            expect(result).toBeGreaterThan(0);
        });

        it('should accept LLMProvider.OpenAI', () => {
            const result = estimateTokenCount(testText, LLMProvider.OpenAI);
            expect(result).toBeGreaterThan(0);
        });

        it('should accept LLMProvider.Gemini', () => {
            const result = estimateTokenCount(testText, LLMProvider.Gemini);
            expect(result).toBeGreaterThan(0);
        });

        it('should accept LLMProvider.Claude', () => {
            const result = estimateTokenCount(testText, LLMProvider.Claude);
            expect(result).toBeGreaterThan(0);
        });

        it('should accept LLMProvider.Grok', () => {
            const result = estimateTokenCount(testText, LLMProvider.Grok);
            expect(result).toBeGreaterThan(0);
        });

        it('should return Gemini tokens < OpenAI tokens for Arabic', () => {
            const geminiTokens = estimateTokenCount(testText, LLMProvider.Gemini);
            const openAITokens = estimateTokenCount(testText, LLMProvider.OpenAI);
            // Gemini is ~25% more efficient
            expect(geminiTokens).toBeLessThanOrEqual(openAITokens);
        });

        it('should return Claude tokens > OpenAI tokens for Arabic', () => {
            const claudeTokens = estimateTokenCount(testText, LLMProvider.Claude);
            const openAITokens = estimateTokenCount(testText, LLMProvider.OpenAI);
            // Claude is less efficient for Arabic
            expect(claudeTokens).toBeGreaterThanOrEqual(openAITokens);
        });

        it('should return similar tokens for Grok and OpenAI', () => {
            const grokTokens = estimateTokenCount(testText, LLMProvider.Grok);
            const openAITokens = estimateTokenCount(testText, LLMProvider.OpenAI);
            // Grok uses similar BPE to OpenAI
            expect(Math.abs(grokTokens - openAITokens)).toBeLessThanOrEqual(2);
        });

        it('should use Generic as default when no provider specified', () => {
            const defaultResult = estimateTokenCount(testText);
            const genericResult = estimateTokenCount(testText, LLMProvider.Generic);
            expect(defaultResult).toBe(genericResult);
        });
    });

    describe('provider comparison with English text', () => {
        const englishText = 'The quick brown fox jumps over the lazy dog';

        it('should have similar estimates across providers for English', () => {
            const openAI = estimateTokenCount(englishText, LLMProvider.OpenAI);
            const gemini = estimateTokenCount(englishText, LLMProvider.Gemini);
            const generic = estimateTokenCount(englishText, LLMProvider.Generic);

            // English tokenization is more consistent across providers
            expect(Math.abs(openAI - gemini)).toBeLessThanOrEqual(3);
            expect(Math.abs(openAI - generic)).toBeLessThanOrEqual(3);
        });

        it('should have Claude use slightly more tokens for English', () => {
            const claudeTokens = estimateTokenCount(englishText, LLMProvider.Claude);
            const openAITokens = estimateTokenCount(englishText, LLMProvider.OpenAI);
            // Claude uses 3.5 chars/token vs 4 for others
            expect(claudeTokens).toBeGreaterThanOrEqual(openAITokens);
        });
    });

    describe('provider comparison with diacritized Arabic', () => {
        const diacritizedArabic = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

        it('should have Gemini be most efficient for diacritized Arabic', () => {
            const geminiTokens = estimateTokenCount(diacritizedArabic, LLMProvider.Gemini);
            const openAITokens = estimateTokenCount(diacritizedArabic, LLMProvider.OpenAI);
            const claudeTokens = estimateTokenCount(diacritizedArabic, LLMProvider.Claude);

            expect(geminiTokens).toBeLessThanOrEqual(openAITokens);
            expect(geminiTokens).toBeLessThan(claudeTokens);
        });
    });

    describe('punctuation', () => {
        it('should handle English punctuation', () => {
            const withPunctuation = 'Hello, world! How are you?';
            const result = estimateTokenCount(withPunctuation);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle Arabic punctuation', () => {
            const withArabicPunctuation = 'كيف حالك؟ الحمد لله!';
            const result = estimateTokenCount(withArabicPunctuation);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle guillemets', () => {
            const withGuillemets = '«قال رسول الله»';
            const result = estimateTokenCount(withGuillemets);
            expect(result).toBeGreaterThan(0);
        });
    });
    describe('Regression Tests', () => {
        it('should avoid global inflation: single diacritic should not penalize entire text', () => {
            const plain = 'بسم الله الرحمن الرحيم '.repeat(100); // 2300 chars
            const diacritic = 'ِ'; // single kasra

            const countPlain = estimateTokenCount(plain);
            const countDiacritic = estimateTokenCount(diacritic);
            const countCombined = estimateTokenCount(plain + diacritic);

            const sumOfParts = countPlain + countDiacritic;

            // With the BUG: combined (884) >> sum (770) due to 15% multiplier on everything
            // With the FIX: combined (~770) ~= sum (770)

            // Allow small rounding diffs, but 15% of 1000 tokens is 150 tokens.
            // We want diff < 5 tokens.
            expect(Math.abs(countCombined - sumOfParts)).toBeLessThan(5);
        });
    });
});
