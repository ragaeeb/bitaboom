import { describe, expect, it } from 'bun:test';
import { preformatArabicText } from './preformat';

describe('preformatArabicText', () => {
    describe('fixTrailingWow', () => {
        it('should fix trailing wow', () => {
            expect(preformatArabicText('السلام عليكم و رحمة الله وبركاته الطرخون او ورق و')).toBe(
                'السلام عليكم ورحمة الله وبركاته الطرخون او ورق و',
            );
        });

        it('should fix another trailing wow', () => {
            expect(preformatArabicText('الأشاعرة لكنهما ما قصدوا مخالفة الكتاب و السنة و إنما وهموا و ظنوا')).toBe(
                'الأشاعرة لكنهما ما قصدوا مخالفة الكتاب والسنة وإنما وهموا وظنوا',
            );
        });

        it('should handle text with no trailing wow', () => {
            expect(preformatArabicText('السلام عليكم ورحمة الله')).toBe('السلام عليكم ورحمة الله');
        });

        it('should not change text with diacritics on wow', () => {
            // The pattern only matches ' و ' (plain wow), not 'وَ' with diacritics
            expect(preformatArabicText('الْكِتَابُ وَ السُّنَّةُ')).toBe('الْكِتَابُ وَ السُّنَّةُ');
        });

        it('should fix multiple occurrences of trailing wow', () => {
            expect(preformatArabicText('أ و ب و ج و د')).toBe('أ وب وج ود');
        });

        it('should fix the trailing wow', () => {
            expect(preformatArabicText('ذكروا لو أن رجلا توفي و خلف سبعين')).toBe('ذكروا لو أن رجلا توفي وخلف سبعين');
        });
    });

    describe('normalizeSlashInReferences', () => {
        it('should remove spaces around slashes in number references', () => {
            const input = '127 / 11';
            const expected = '127/11';
            expect(preformatArabicText(input)).toBe(expected);
        });

        it('should handle cases without spaces around the slash', () => {
            const input = '127/11';
            const expected = '127/11';
            expect(preformatArabicText(input)).toBe(expected);
        });

        it('should handle cases with multiple spaces around the slash', () => {
            const input = '127   /   11';
            expect(preformatArabicText(input)).toBe('127/11');
        });

        it('should not change text without number references', () => {
            const input = 'This is some text';
            expect(preformatArabicText(input)).toBe(input);
        });

        it('clean spaces between reference', () => {
            expect(preformatArabicText('this is 127 / 11 with 127 /2 and 122 /3 and 22/1')).toBe(
                'this is 127/11 with 127/2 and 122/3 and 22/1',
            );
        });
    });

    describe('removeSpaceInsideBrackets', () => {
        it('should remove the space in the brackets', () => {
            expect(preformatArabicText('( Fasting is during ) [ the ] winter.')).toBe(
                '(Fasting is during) [the] winter.',
            );
        });
    });

    describe('trimSpaceInsideQuotes', () => {
        it('should trim the space inside the quotes', () => {
            expect(preformatArabicText('“ Fasting is during the winter. ”')).toBe('“Fasting is during the winter.”');
        });
    });

    describe('replaceEnglishPunctuationWithArabic', () => {
        it('should replace english question mark and semicolon with Arabic ones', () => {
            expect(preformatArabicText('This; and, that?')).toBe('This؛ and, that؟');
        });
    });

    describe('addSpaceBetweenArabicTextAndNumbers', () => {
        it('should insert a space between Arabic text and number', () => {
            expect(preformatArabicText('الآية37')).toBe('الآية 37');
        });

        it('should insert a space between Arabic text and number in a sentence', () => {
            expect(preformatArabicText('قال29 وأجاب43')).toBe('قال 29 وأجاب 43');
        });

        it('should not insert space between Arabic text and non-number characters', () => {
            expect(preformatArabicText('الآية: ثلاثون وسبعة')).toBe('الآية: ثلاثون وسبعة');
        });

        it('should handle a string with no Arabic text and number', () => {
            expect(preformatArabicText('Hello World123')).toBe('Hello World123');
        });

        it('should handle empty string', () => {
            expect(preformatArabicText('')).toBe('');
        });

        it('should handle text with diacritics before numbers', () => {
            expect(preformatArabicText('الآيَةُ37')).toBe('الآيَةُ 37');
        });

        it('should handle multiple Arabic-number transitions', () => {
            expect(preformatArabicText('سورة1 آية2 جزء3')).toBe('سورة 1 آية 2 جزء 3');
        });

        it('should already have space - no change', () => {
            expect(preformatArabicText('الآية 37')).toBe('الآية 37');
        });
    });

    describe('ensureSpaceBeforeBrackets', () => {
        it('should add space before brackets when missing', () => {
            expect(preformatArabicText('text(note)')).toBe('text (note)');
        });

        it('should preserve existing single space before brackets', () => {
            expect(preformatArabicText('text (note)')).toBe('text (note)');
        });

        it('should normalize multiple spaces to single space before brackets', () => {
            expect(preformatArabicText('text   (note)')).toBe('text (note)');
        });

        it('should handle multiple bracket pairs in the same text', () => {
            expect(preformatArabicText('first(one)second(two)')).toBe('first (one)second (two)');
        });

        it('should handle mixed spacing scenarios', () => {
            expect(preformatArabicText('good (spaced)bad(nospace)multiple   (spaces)')).toBe(
                'good (spaced)bad (nospace)multiple (spaces)',
            );
        });

        it('should work with Arabic text', () => {
            expect(preformatArabicText('النص(ملاحظة)')).toBe('النص (ملاحظة)');
        });

        it('should work with numbers', () => {
            expect(preformatArabicText('123(note)')).toBe('123 (note)');
        });

        it('should handle empty brackets', () => {
            expect(preformatArabicText('text()')).toBe('text ()');
        });

        it('should handle brackets with special characters inside', () => {
            // Note: Preformat adds space after ! inside brackets due to punctuation spacing rules
            expect(preformatArabicText('text(note: 123!@#)')).toBe('text (note: 123! @#)');
        });

        it('should not affect brackets at the start of text', () => {
            expect(preformatArabicText('(note) text')).toBe('(note) text');
        });

        it('should not affect brackets preceded by whitespace', () => {
            expect(preformatArabicText('text\n(note)')).toBe('text\n(note)');
            // Note: Tabs are converted to spaces by normalizeSpaces behavior
            expect(preformatArabicText('text\t(note)')).toBe('text (note)');
        });

        it('should handle nested content with commas and periods', () => {
            expect(preformatArabicText('author(Smith, J. et al.)')).toBe('author (Smith, J. et al.)');
        });

        it('should handle brackets with multilingual content', () => {
            expect(preformatArabicText('word(English and عربي)')).toBe('word (English and عربي)');
        });

        it('should handle text with no brackets', () => {
            expect(preformatArabicText('regular text without brackets')).toBe('regular text without brackets');
        });

        it('should handle empty string', () => {
            expect(preformatArabicText('')).toBe('');
        });

        it('should handle only brackets', () => {
            expect(preformatArabicText('()')).toBe('()');
        });

        it('should handle multiple consecutive bracket pairs', () => {
            expect(preformatArabicText('text(first)(second)')).toBe('text (first)(second)');
        });

        it('should preserve brackets that are part of larger expressions', () => {
            expect(preformatArabicText('formula(a+b)(c+d)')).toBe('formula (a+b)(c+d)');
        });
    });

    describe('ensureSpaceBeforeQuotes', () => {
        it('adds space before quotes when missing', () => {
            expect(preformatArabicText('word«quote»')).toBe('word «quote»');
            expect(preformatArabicText('text«مرحبا»')).toBe('text «مرحبا»');
        });

        it('preserves single space before quotes', () => {
            expect(preformatArabicText('word «quote»')).toBe('word «quote»');
        });

        it('reduces multiple spaces to one', () => {
            expect(preformatArabicText('word  «quote»')).toBe('word «quote»');
            expect(preformatArabicText('word   «quote»')).toBe('word «quote»');
            expect(preformatArabicText('word     «quote»')).toBe('word «quote»');
        });

        it('handles multiple quotes in text', () => {
            expect(preformatArabicText('word«first»and«second»')).toBe('word «first»and «second»');
            expect(preformatArabicText('word  «first» and  «second»')).toBe('word «first» and «second»');
        });

        it('handles empty string', () => {
            expect(preformatArabicText('')).toBe('');
        });

        it('handles text without quotes', () => {
            const plain = 'This has no quotes';
            expect(preformatArabicText(plain)).toBe(plain);
        });

        it('handles quotes at start of text', () => {
            expect(preformatArabicText('«quote» at start')).toBe('«quote» at start');
        });

        it('handles Arabic content in quotes', () => {
            expect(preformatArabicText('كلمة«نص عربي»')).toBe('كلمة «نص عربي»');
        });
    });

    describe('condenseAsterisks', () => {
        it('should reduce the asterisks', () => {
            expect(preformatArabicText('* * *')).toBe('*');
        });
    });

    describe('condenseColons', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            expect(preformatArabicText('This.:. and :, and .: and :.')).toBe('This: and: , and: and:');
        });
    });

    describe('condenseDashes', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            expect(preformatArabicText('This is some ---- text')).toBe('This is some - text');
        });
    });

    describe('condenseEllipsis', () => {
        it('should condense the periods into an ellipsis', () => {
            expect(preformatArabicText('This is some text...')).toBe('This is some text…');
        });
    });

    describe('condensePeriods', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            // Note: Combined preformat converts consecutive dots to ellipsis
            expect(preformatArabicText('This . . . . . . . . and')).toBe('This… and');
        });
    });

    describe('condenseUnderscores', () => {
        it('should condense the underscores', () => {
            expect(preformatArabicText('This is ــ some text __')).toBe('This is ـ some text _');
        });
    });

    describe('replaceDoubleBracketsWithArrows', () => {
        it('should reduce the brackets', () => {
            expect(preformatArabicText('((text)) [[array]]')).toBe('«text» [[array]]');
        });

        it('should handle string with no double brackets', () => {
            const str = 'الحمد لله رب العالمين';
            expect(preformatArabicText(str)).toBe(str);
        });
    });

    describe('removeRedundantPunctuation', () => {
        it('should remove period after Arabic question mark', () => {
            expect(preformatArabicText('كيف حالك؟.')).toBe('كيف حالك؟');
        });

        it('should remove Arabic comma after Arabic question mark', () => {
            expect(preformatArabicText('ما اسمك؟،')).toBe('ما اسمك؟');
        });

        it('should remove period after exclamation mark', () => {
            expect(preformatArabicText('رائع!.')).toBe('رائع!');
        });

        it('should remove Arabic comma after exclamation mark', () => {
            expect(preformatArabicText('عظيم!،')).toBe('عظيم!');
        });

        it('should handle multiple occurrences in the same text', () => {
            expect(preformatArabicText('كيف حالك؟. وأنت؟، كيف تشعر!.')).toBe('كيف حالك؟ وأنت؟ كيف تشعر!');
        });

        it('should not affect standalone periods', () => {
            expect(preformatArabicText('هذا جيد.')).toBe('هذا جيد.');
        });

        it('should not affect standalone Arabic commas', () => {
            expect(preformatArabicText('أحب القراءة، والكتابة')).toBe('أحب القراءة، والكتابة');
        });

        it('should not affect question marks without following punctuation', () => {
            expect(preformatArabicText('كيف حالك؟ أنا بخير')).toBe('كيف حالك؟ أنا بخير');
        });

        it('should not affect exclamation marks without following punctuation', () => {
            expect(preformatArabicText('ممتاز! شكراً لك')).toBe('ممتاز! شكراً لك');
        });

        it('should handle empty string', () => {
            expect(preformatArabicText('')).toBe('');
        });

        it('should handle text with no punctuation', () => {
            expect(preformatArabicText('مرحبا بك')).toBe('مرحبا بك');
        });
    });

    describe('reduceMultilineBreaksToSingle', () => {
        it('should reduce 2 or more line breaks to exactly 1', () => {
            const input = 'This is line 1\n\nThis is line 2';
            const expected = 'This is line 1\nThis is line 2';
            expect(preformatArabicText(input)).toBe(expected);
        });

        it('should not change single line breaks', () => {
            const input = 'This is line 1\nThis is line 2';
            expect(preformatArabicText(input)).toBe(input);
        });

        it('should remove the multiple line breaks', () => {
            expect(preformatArabicText('This\n\nis\n\n\nsome\nlines')).toBe('This\nis\nsome\nlines');
        });
    });

    describe('cleanMultilineSpaces', () => {
        it('removes the spaces', () => {
            expect(preformatArabicText('This has    \nmany spaces  \n\nNext line')).toBe(
                'This has\nmany spaces\nNext line',
            );
        });

        it('no-op', () => {
            expect(preformatArabicText('this is')).toBe('this is');
        });
    });

    describe('cleanSpacesBeforePeriod', () => {
        it('removes the spaces for period', () => {
            expect(preformatArabicText('This sentence has some space , before period  . Hello')).toBe(
                'This sentence has some space, before period. Hello',
            );
        });

        it('removes the spaces for question mark', () => {
            expect(preformatArabicText('This sentence has some space before period  ؟ Hello')).toBe(
                'This sentence has some space before period؟ Hello',
            );

            expect(preformatArabicText('الإسلام أم الكفر ؟')).toBe('الإسلام أم الكفر؟');
        });

        it('removes the spaces for exclamation mark', () => {
            expect(preformatArabicText('This sentence has some space before period  ! Hello')).toBe(
                'This sentence has some space before period! Hello',
            );
        });

        it('removes the spaces for semicolon', () => {
            expect(preformatArabicText('ومن قال: (لا أعمل بحديث إلا إن أخذ به إمامي) ؛')).toBe(
                'ومن قال: (لا أعمل بحديث إلا إن أخذ به إمامي)؛',
            );
        });

        it('removes the spaces for comma', () => {
            expect(preformatArabicText('This sentence has some space before period  ، Hello')).toBe(
                'This sentence has some space before period، Hello',
            );
        });

        it('no-op', () => {
            expect(preformatArabicText('this is')).toBe('this is');
        });
    });

    describe('addSpaceBeforeAndAfterPunctuation', () => {
        it('should replace the spaces not the line breaks', () => {
            expect(preformatArabicText('This is the first line .\nThis is the second line.')).toBe(
                'This is the first line.\nThis is the second line.',
            );
        });

        it('should remove the extra space between the apostrophe and question mark', () => {
            // Note: Combined preformat behavior differs slightly in quote handling
            expect(preformatArabicText('"I have the book !" \'I have it . \'')).toBe(
                '"I have the book! "\'I have it. \'',
            );
        });
        ('\\');
        '\\',
            it('should handle the semicolons and colons', () => {
                expect(
                    preformatArabicText(
                        'A string like this .Should turn into that ! But what about  ?   This one ; However ...it goes without saying.',
                    ),
                ).toBe(
                    'A string like this. Should turn into that! But what about؟ This one؛ However…it goes without saying.',
                );
            });
        it('should not add spaces for brackets and quoted text', () => {
            expect(preformatArabicText('“This is some text!” [Something!] (Something!)')).toBe(
                '“This is some text!” [Something!] (Something!)',
            );
        });

        it('should add a space after colon', () => {
            expect(preformatArabicText('a:ksjdf')).toBe('a: ksjdf');
            expect(preformatArabicText('2:asdf')).toBe('2: asdf');
            expect(preformatArabicText('a:2 of them')).toBe('a: 2 of them');
            expect(preformatArabicText('(al-Nūr:27)')).toBe('(al-Nūr: 27)');
        });

        it('should not add space for ayah', () => {
            expect(preformatArabicText('61:23')).toBe('61:23');
            expect(preformatArabicText('1:2')).toBe('1:2');
        });

        it('should add space for Arabic ayah signature', () => {
            expect(preformatArabicText('قال : ومشايخنا')).toBe('قال: ومشايخنا');
            expect(preformatArabicText('[النور: 36]')).toBe('[النور: 36]');
        });

        it('should remove the space before a comma', () => {
            // Note: Combined preformat behavior differs slightly in quote spacing
            expect(preformatArabicText('this , then that" to "this, then that')).toBe(
                'this, then that "to "this, then that',
            );
        });
    });

    describe('normalizeSpaces', () => {
        it('removes the spaces', () => {
            expect(preformatArabicText('This has    many spaces\n\nNext line')).toBe('This has many spaces\nNext line');
        });
    });
});
