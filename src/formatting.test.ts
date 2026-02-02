import { describe, expect, it } from 'bun:test';

import {
    addSpaceBeforeAndAfterPunctuation,
    applySmartQuotes,
    cleanLiteralNewLines,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    condenseAsterisks,
    condenseColons,
    condenseDashes,
    condenseEllipsis,
    condensePeriods,
    condenseUnderscores,
    doubleToSingleBrackets,
    ensureSpaceBeforeBrackets,
    ensureSpaceBeforeQuotes,
    fixBracketTypos,
    fixCurlyBraces,
    fixMismatchedQuotationMarks,
    formatStringBySentence,
    hasWordInSingleLine,
    insertLineBreaksAfterPunctuation,
    isAllUppercase,
    isOnlyPunctuation,
    normalizeSlashInReferences,
    normalizeSpaces,
    reduceMultilineBreaksToDouble,
    reduceMultilineBreaksToSingle,
    removeRedundantPunctuation,
    removeSpaceInsideBrackets,
    replaceDoubleBracketsWithArrows,
    stripStyling,
    toTitleCase,
    trimSpaceInsideQuotes,
} from './formatting';

describe('formatting', () => {
    describe('ensureSpaceBeforeBrackets', () => {
        it('should add space before brackets when missing', () => {
            expect(ensureSpaceBeforeBrackets('text(note)')).toEqual('text (note)');
        });

        it('should preserve existing single space before brackets', () => {
            expect(ensureSpaceBeforeBrackets('text (note)')).toEqual('text (note)');
        });

        it('should normalize multiple spaces to single space before brackets', () => {
            expect(ensureSpaceBeforeBrackets('text   (note)')).toEqual('text (note)');
        });

        it('should handle multiple bracket pairs in the same text', () => {
            expect(ensureSpaceBeforeBrackets('first(one)second(two)')).toEqual('first (one)second (two)');
        });

        it('should handle mixed spacing scenarios', () => {
            expect(ensureSpaceBeforeBrackets('good (spaced)bad(nospace)multiple   (spaces)')).toEqual(
                'good (spaced)bad (nospace)multiple (spaces)',
            );
        });

        it('should work with Arabic text', () => {
            expect(ensureSpaceBeforeBrackets('النص(ملاحظة)')).toEqual('النص (ملاحظة)');
        });

        it('should work with numbers', () => {
            expect(ensureSpaceBeforeBrackets('123(note)')).toEqual('123 (note)');
        });

        it('should handle empty brackets', () => {
            expect(ensureSpaceBeforeBrackets('text()')).toEqual('text ()');
        });

        it('should handle brackets with special characters inside', () => {
            expect(ensureSpaceBeforeBrackets('text(note: 123!@#)')).toEqual('text (note: 123!@#)');
        });

        it('should not affect brackets at the start of text', () => {
            expect(ensureSpaceBeforeBrackets('(note) text')).toEqual('(note) text');
        });

        it('should not affect brackets preceded by whitespace', () => {
            expect(ensureSpaceBeforeBrackets('text\n(note)')).toEqual('text\n(note)');
            expect(ensureSpaceBeforeBrackets('text\t(note)')).toEqual('text\t(note)');
        });

        it('should handle nested content with commas and periods', () => {
            expect(ensureSpaceBeforeBrackets('author(Smith, J. et al.)')).toEqual('author (Smith, J. et al.)');
        });

        it('should handle brackets with multilingual content', () => {
            expect(ensureSpaceBeforeBrackets('word(English and عربي)')).toEqual('word (English and عربي)');
        });

        it('should handle text with no brackets', () => {
            expect(ensureSpaceBeforeBrackets('regular text without brackets')).toEqual('regular text without brackets');
        });

        it('should handle empty string', () => {
            expect(ensureSpaceBeforeBrackets('')).toEqual('');
        });

        it('should handle only brackets', () => {
            expect(ensureSpaceBeforeBrackets('()')).toEqual('()');
        });

        it('should handle multiple consecutive bracket pairs', () => {
            expect(ensureSpaceBeforeBrackets('text(first)(second)')).toEqual('text (first)(second)');
        });

        it('should preserve brackets that are part of larger expressions', () => {
            expect(ensureSpaceBeforeBrackets('formula(a+b)(c+d)')).toEqual('formula (a+b)(c+d)');
        });
    });

    describe('ensureSpaceBeforeQuotes', () => {
        it('adds space before quotes when missing', () => {
            expect(ensureSpaceBeforeQuotes('word«quote»')).toBe('word «quote»');
            expect(ensureSpaceBeforeQuotes('text«مرحبا»')).toBe('text «مرحبا»');
        });

        it('preserves single space before quotes', () => {
            expect(ensureSpaceBeforeQuotes('word «quote»')).toBe('word «quote»');
        });

        it('reduces multiple spaces to one', () => {
            expect(ensureSpaceBeforeQuotes('word  «quote»')).toBe('word «quote»');
            expect(ensureSpaceBeforeQuotes('word   «quote»')).toBe('word «quote»');
            expect(ensureSpaceBeforeQuotes('word     «quote»')).toBe('word «quote»');
        });

        it('handles multiple quotes in text', () => {
            expect(ensureSpaceBeforeQuotes('word«first»and«second»')).toBe('word «first»and «second»');
            expect(ensureSpaceBeforeQuotes('word  «first» and  «second»')).toBe('word «first» and «second»');
        });

        it('handles empty string', () => {
            expect(ensureSpaceBeforeQuotes('')).toBe('');
        });

        it('handles text without quotes', () => {
            const plain = 'This has no quotes';
            expect(ensureSpaceBeforeQuotes(plain)).toBe(plain);
        });

        it('handles quotes at start of text', () => {
            expect(ensureSpaceBeforeQuotes('«quote» at start')).toBe('«quote» at start');
        });

        it('handles Arabic content in quotes', () => {
            expect(ensureSpaceBeforeQuotes('كلمة«نص عربي»')).toBe('كلمة «نص عربي»');
        });
    });

    describe('fixMismatchedQuotationMarks', () => {
        it('fixes « content ) to « content »', () => {
            expect(fixMismatchedQuotationMarks('«hello world)')).toBe('«hello world»');
            expect(fixMismatchedQuotationMarks('«مرحبا بكم)')).toBe('«مرحبا بكم»');
        });

        it('fixes ( content » to « content »', () => {
            expect(fixMismatchedQuotationMarks('(hello world»')).toBe('«hello world»');
            expect(fixMismatchedQuotationMarks('(مرحبا بكم»')).toBe('«مرحبا بكم»');
        });

        it('fixes unclosed « at end', () => {
            expect(fixMismatchedQuotationMarks('«hello world')).toBe('«hello world»');
            expect(fixMismatchedQuotationMarks('«مرحبا بكم')).toBe('«مرحبا بكم»');
            expect(fixMismatchedQuotationMarks('«hello world   ')).toBe('«hello world   »');
        });

        it('handles multiple mismatched quotes in one text', () => {
            expect(fixMismatchedQuotationMarks('«first) and (second»')).toBe('«first» and «second»');
        });

        it('preserves correctly formatted quotes', () => {
            expect(fixMismatchedQuotationMarks('«properly formatted»')).toBe('«properly formatted»');
        });

        it('handles empty string', () => {
            expect(fixMismatchedQuotationMarks('')).toBe('');
        });

        it('handles text without quotes', () => {
            const plain = 'This has no quotes';
            expect(fixMismatchedQuotationMarks(plain)).toBe(plain);
        });

        it('handles nested content with quotes inside', () => {
            expect(fixMismatchedQuotationMarks('«he said "hello")')).toBe('«he said "hello"»');
        });

        it('should replace with the arrow brackets', () => {
            const actual = fixMismatchedQuotationMarks('يقول: « الهيثم بن عدي كوفي ليس بثقة، كان يكذب ) (٢).');
            expect(actual).toEqual('يقول: « الهيثم بن عدي كوفي ليس بثقة، كان يكذب » (٢).');
        });

        it('should replace with the arrow brackets with the footnote', () => {
            const actual = fixMismatchedQuotationMarks('«كذَّاب)(٣).');
            expect(actual).toEqual('«كذَّاب»(٣).');
        });

        it('should replace with the reversed arrow brackets', () => {
            const actual = fixMismatchedQuotationMarks('وقال ( يدلسها »(٥).');
            expect(actual).toEqual('وقال « يدلسها »(٥).');
        });
    });

    describe('insertLineBreaksAfterPunctuation', () => {
        it('should add a new line after each period', () => {
            const input = 'الحمد لله رب العالمين. صلى الله وسلم على نبينا محمد.';
            const expectedOutput = 'الحمد لله رب العالمين.\nصلى الله وسلم على نبينا محمد.';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each exclamation mark', () => {
            const input = 'سبحان الله! الحمد لله!';
            const expectedOutput = 'سبحان الله!\nالحمد لله!';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each question mark', () => {
            const input = 'صلى الله وسلم على نبينا محمد؟ اجمعين.';
            const expectedOutput = 'صلى الله وسلم على نبينا محمد؟\nاجمعين.';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each Arabic question mark', () => {
            const input = 'كيف حالك؟ انا بخير.';
            const expectedOutput = 'كيف حالك؟\nانا بخير.';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle multiple punctuation marks in a single string', () => {
            const input = 'الحمد لله رب العالمين! سبحان الله. الله أكبر؟';
            const expectedOutput = 'الحمد لله رب العالمين!\nسبحان الله.\nالله أكبر؟';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should not add extra spaces after punctuation marks', () => {
            const input = ['الحمد لله رب العالمين.', 'سبحان الله!'];
            const expectedOutput = 'الحمد لله رب العالمين.\nسبحان الله!';
            expect(insertLineBreaksAfterPunctuation(input.join(' '))).toBe(expectedOutput);
        });

        it('should return the same string if there are no punctuation marks', () => {
            const input = 'الحمد لله رب العالمين';
            const expectedOutput = 'الحمد لله رب العالمين';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle empty string input', () => {
            const input = '';
            const expectedOutput = '';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle strings with only punctuation marks correctly', () => {
            const input = '!.؟';
            const expectedOutput = '!\n.\n؟';
            expect(insertLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });
    });

    describe('hasWordInSingleLine', () => {
        it('should detect that the second line is by itself', () => {
            expect(hasWordInSingleLine(['فأولئك هم', 'الفائزون', 'وإياك إياك'].join('\n'))).toBe(true);
        });

        it('should not find any words by itself', () => {
            expect(hasWordInSingleLine(['فأولئك هم', 'وإياك إياك'].join('\n'))).toBe(false);
        });
    });

    describe('removeRedundantPunctuation', () => {
        it('should remove period after Arabic question mark', () => {
            expect(removeRedundantPunctuation('كيف حالك؟.')).toEqual('كيف حالك؟');
        });

        it('should remove Arabic comma after Arabic question mark', () => {
            expect(removeRedundantPunctuation('ما اسمك؟،')).toEqual('ما اسمك؟');
        });

        it('should remove period after exclamation mark', () => {
            expect(removeRedundantPunctuation('رائع!.')).toEqual('رائع!');
        });

        it('should remove Arabic comma after exclamation mark', () => {
            expect(removeRedundantPunctuation('عظيم!،')).toEqual('عظيم!');
        });

        it('should handle multiple occurrences in the same text', () => {
            expect(removeRedundantPunctuation('كيف حالك؟. وأنت؟، كيف تشعر!.')).toEqual('كيف حالك؟ وأنت؟ كيف تشعر!');
        });

        it('should not affect standalone periods', () => {
            expect(removeRedundantPunctuation('هذا جيد.')).toEqual('هذا جيد.');
        });

        it('should not affect standalone Arabic commas', () => {
            expect(removeRedundantPunctuation('أحب القراءة، والكتابة')).toEqual('أحب القراءة، والكتابة');
        });

        it('should not affect question marks without following punctuation', () => {
            expect(removeRedundantPunctuation('كيف حالك؟ أنا بخير')).toEqual('كيف حالك؟ أنا بخير');
        });

        it('should not affect exclamation marks without following punctuation', () => {
            expect(removeRedundantPunctuation('ممتاز! شكراً لك')).toEqual('ممتاز! شكراً لك');
        });

        it('should handle empty string', () => {
            expect(removeRedundantPunctuation('')).toEqual('');
        });

        it('should handle text with no punctuation', () => {
            expect(removeRedundantPunctuation('مرحبا بك')).toEqual('مرحبا بك');
        });
    });

    describe('addSpaceBeforeAndAfterPunctuation', () => {
        it('should replace the spaces not the line breaks', () => {
            expect(addSpaceBeforeAndAfterPunctuation('This is the first line .\nThis is the second line.')).toEqual(
                'This is the first line.\nThis is the second line.',
            );
        });

        it('should remove the extra space between the apostrophe and question mark', () => {
            expect(addSpaceBeforeAndAfterPunctuation("“I have the book !” 'I have it . '")).toEqual(
                "“I have the book!” 'I have it.'",
            );
        });

        it('should handle the semicolons and colons', () => {
            expect(
                addSpaceBeforeAndAfterPunctuation(
                    'A string like this .Should turn into that ! But what about  ?   This one ; However ...it goes without saying.',
                ),
            ).toEqual(
                'A string like this. Should turn into that! But what about ? This one; However... it goes without saying.',
            );
        });
        it('should not add spaces for brackets and quoted text', () => {
            expect(addSpaceBeforeAndAfterPunctuation('“This is some text!” [Something!] (Something!)')).toEqual(
                '“This is some text!” [Something!] (Something!)',
            );
        });

        it('should add a space after colon', () => {
            expect(addSpaceBeforeAndAfterPunctuation('a:ksjdf')).toBe('a: ksjdf');
            expect(addSpaceBeforeAndAfterPunctuation('2:asdf')).toBe('2: asdf');
            expect(addSpaceBeforeAndAfterPunctuation('a:2 of them')).toBe('a: 2 of them');
            expect(addSpaceBeforeAndAfterPunctuation('(al-Nūr:27)')).toBe('(al-Nūr: 27)');
        });

        it('should not add space for ayah', () => {
            expect(addSpaceBeforeAndAfterPunctuation('61:23')).toBe('61:23');
            expect(addSpaceBeforeAndAfterPunctuation('1:2')).toBe('1:2');
        });

        it('should add space for Arabic ayah signature', () => {
            expect(addSpaceBeforeAndAfterPunctuation('قال : ومشايخنا')).toBe('قال: ومشايخنا');
            expect(addSpaceBeforeAndAfterPunctuation('[النور: 36]')).toBe('[النور: 36]');
        });

        it('should remove the space before a comma', () => {
            expect(addSpaceBeforeAndAfterPunctuation('this , then that" to "this, then that')).toEqual(
                'this, then that" to "this, then that',
            );
        });
    });

    describe('applySmartQuotes', () => {
        it('quotes', () => {
            expect(applySmartQuotes('The "quick brown" fox jumped "right" over the lazy dog.')).toEqual(
                'The “quick brown” fox jumped “right” over the lazy dog.',
            );
        });

        it('no-op', () => {
            expect(applySmartQuotes('this is')).toEqual('this is');
        });
    });

    describe('cleanLiteralNewLines', () => {
        it('should turn the literal new line text into line break', () => {
            expect(cleanLiteralNewLines('A\\nB')).toEqual('A\nB');
        });

        it('should handle carriage returns', () => {
            expect(cleanLiteralNewLines('A\rB')).toEqual('A\nB');
        });

        it('should handle multiple literal newlines', () => {
            expect(cleanLiteralNewLines('A\\nB\\nC\\nD')).toEqual('A\nB\nC\nD');
        });

        it('should handle empty string', () => {
            expect(cleanLiteralNewLines('')).toEqual('');
        });

        it('should handle text with no newlines', () => {
            expect(cleanLiteralNewLines('hello world')).toEqual('hello world');
        });

        it('should handle Arabic text with literal newlines', () => {
            expect(cleanLiteralNewLines('مرحبا\\nالعالم')).toEqual('مرحبا\nالعالم');
        });
    });

    describe('cleanMultilineSpaces', () => {
        it('removes the spaces', () => {
            expect(cleanMultilines('This has    \nmany spaces  \n\nNext line')).toEqual(
                'This has\nmany spaces\n\nNext line',
            );
        });

        it('no-op', () => {
            expect(cleanMultilines('this is')).toEqual('this is');
        });

        it('should remove regular spaces from the beginning of lines', () => {
            expect(cleanMultilines('  line1\n  line2')).toBe('line1\nline2');
        });

        it('should remove regular spaces from the end of lines', () => {
            expect(cleanMultilines('line1  \nline2  ')).toBe('line1\nline2');
        });

        it('should remove spaces from both beginning and end of lines', () => {
            expect(cleanMultilines('  line1  \n  line2  ')).toBe('line1\nline2');
        });

        it('should remove tabs from the beginning of lines', () => {
            expect(cleanMultilines('\t\tline1\n\tline2')).toBe('line1\nline2');
        });

        it('should remove tabs from the end of lines', () => {
            expect(cleanMultilines('line1\t\t\nline2\t')).toBe('line1\nline2');
        });

        it('should remove mixed spaces and tabs', () => {
            expect(cleanMultilines(' \t line1 \t \n\t line2\t ')).toBe('line1\nline2');
        });

        it('should remove non-breaking spaces (U+00A0)', () => {
            const nbsp = '\u00A0';
            expect(cleanMultilines(`${nbsp}${nbsp}line1${nbsp}${nbsp}\n${nbsp}line2${nbsp}`)).toBe('line1\nline2');
        });

        it('should handle Arabic text with leading/trailing whitespace', () => {
            expect(
                cleanMultilines(
                    ' الله على نبينا محمد وعلى آله وصحبه وسلم.\n                                                                                      كتبه: ربيع بن هادي العمير\n                                                                                               3/7/1437هـ\n',
                ),
            ).toBe('الله على نبينا محمد وعلى آله وصحبه وسلم.\nكتبه: ربيع بن هادي العمير\n3/7/1437هـ\n');
        });

        it('should preserve line breaks while removing horizontal whitespace', () => {
            expect(cleanMultilines('text\n \n \n')).toBe('text\n\n\n');
        });

        it('should preserve \r\n line endings', () => {
            expect(cleanMultilines('  line1  \r\n  line2  \r\n')).toBe('line1\r\nline2\r\n');
        });

        it('should preserve standalone \r characters', () => {
            expect(cleanMultilines('  line1  \r  line2  ')).toBe('line1\rline2');
        });

        it('should handle empty lines with only whitespace', () => {
            expect(cleanMultilines('line1\n   \nline2')).toBe('line1\n\nline2');
        });

        it('should handle multiple consecutive empty lines with whitespace', () => {
            expect(cleanMultilines('line1\n \n \n \nline2')).toBe('line1\n\n\n\nline2');
        });

        it('should return empty string for input with only whitespace', () => {
            expect(cleanMultilines('   \n   \n   ')).toBe('\n\n');
        });

        it('should return empty string for empty input', () => {
            expect(cleanMultilines('')).toBe('');
        });

        it('should not modify text without leading/trailing whitespace', () => {
            expect(cleanMultilines('line1\nline2\nline3')).toBe('line1\nline2\nline3');
        });

        it('should handle single line with leading and trailing whitespace', () => {
            expect(cleanMultilines('  single line  ')).toBe('single line');
        });

        it('should handle text with no line breaks', () => {
            expect(cleanMultilines('  no line breaks  ')).toBe('no line breaks');
        });

        it('should preserve internal whitespace within lines', () => {
            expect(cleanMultilines('  word1  word2  \n  word3  word4  ')).toBe('word1  word2\nword3  word4');
        });

        it('should handle mixed Unicode whitespace characters', () => {
            const nbsp = '\u00A0'; // non-breaking space
            const thinSpace = '\u2009'; // thin space
            expect(cleanMultilines(`${nbsp}${thinSpace}line1${thinSpace}${nbsp}`)).toBe('line1');
        });

        it('should handle complex multiline text with various whitespace', () => {
            const input = '  Line 1  \n\t\tLine 2\t\t\n   Line 3   \n\nLine 4';
            const expected = 'Line 1\nLine 2\nLine 3\n\nLine 4';
            expect(cleanMultilines(input)).toBe(expected);
        });

        it('should handle text with parentheses and whitespace', () => {
            expect(cleanMultilines(' text \n \n \n\n\n\n([1])')).toBe('text\n\n\n\n\n\n([1])');
        });

        it('should handle Windows-style line endings with whitespace', () => {
            expect(cleanMultilines('  line1  \r\n  line2  \r\n  line3  ')).toBe('line1\r\nline2\r\nline3');
        });
    });

    describe('cleanSpacesBeforePeriod', () => {
        it('removes the spaces for period', () => {
            expect(cleanSpacesBeforePeriod('This sentence has some space , before period  . Hello')).toEqual(
                'This sentence has some space, before period. Hello',
            );
        });

        it('removes the spaces for question mark', () => {
            expect(cleanSpacesBeforePeriod('This sentence has some space before period  ؟ Hello')).toEqual(
                'This sentence has some space before period؟ Hello',
            );

            expect(cleanSpacesBeforePeriod('الإسلام أم الكفر ؟')).toEqual('الإسلام أم الكفر؟');
        });

        it('removes the spaces for exclamation mark', () => {
            expect(cleanSpacesBeforePeriod('This sentence has some space before period  ! Hello')).toEqual(
                'This sentence has some space before period! Hello',
            );
        });

        it('removes the spaces for semicolon', () => {
            expect(cleanSpacesBeforePeriod('ومن قال: (لا أعمل بحديث إلا إن أخذ به إمامي) ؛')).toEqual(
                'ومن قال: (لا أعمل بحديث إلا إن أخذ به إمامي)؛',
            );
        });

        it('removes the spaces for comma', () => {
            expect(cleanSpacesBeforePeriod('This sentence has some space before period  ، Hello')).toEqual(
                'This sentence has some space before period، Hello',
            );
        });

        it('no-op', () => {
            expect(cleanSpacesBeforePeriod('this is')).toEqual('this is');
        });
    });

    describe('condenseAsterisks', () => {
        it('should reduce the asterisks', () => {
            expect(condenseAsterisks('* * *')).toEqual('*');
        });
    });

    describe('condenseColons', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            expect(condenseColons('This.:. and :, and .: and :.')).toEqual('This: and :, and : and :');
        });
    });

    describe('condenseDashes', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            expect(condenseDashes('This is some ---- text')).toEqual('This is some - text');
        });
    });

    describe('condenseEllipsis', () => {
        it('should condense the periods into an ellipsis', () => {
            expect(condenseEllipsis('This is some text...')).toEqual('This is some text…');
        });
    });

    describe('reduceMultilineBreaksToDouble', () => {
        it('should reduce 3 or more line breaks to exactly 2', () => {
            const input = 'This is line 1\n\n\n\nThis is line 2';
            const expected = 'This is line 1\n\nThis is line 2';
            expect(reduceMultilineBreaksToDouble(input)).toBe(expected);
        });

        it('should not change 2 consecutive line breaks', () => {
            const input = 'This is line 1\n\nThis is line 2';
            expect(reduceMultilineBreaksToDouble(input)).toBe(input);
        });
    });

    describe('reduceMultilineBreaksToSingle', () => {
        it('should reduce 2 or more line breaks to exactly 1', () => {
            const input = 'This is line 1\n\nThis is line 2';
            const expected = 'This is line 1\nThis is line 2';
            expect(reduceMultilineBreaksToSingle(input)).toBe(expected);
        });

        it('should not change single line breaks', () => {
            const input = 'This is line 1\nThis is line 2';
            expect(reduceMultilineBreaksToSingle(input)).toEqual(input);
        });

        it('should remove the multiple line breaks', () => {
            expect(reduceMultilineBreaksToSingle('This\n\nis\n\n\nsome\nlines')).toEqual('This\nis\nsome\nlines');
        });
    });

    describe('condensePeriods', () => {
        it('should remove the unnecessary punctuation around the colon', () => {
            expect(condensePeriods('This . . . . . . . . and')).toEqual('This . . . . and');
        });
    });

    describe('condenseUnderscores', () => {
        it('should condense the underscores', () => {
            expect(condenseUnderscores('This is ــ some text __')).toEqual('This is ـ some text _');
        });
    });

    describe('doubleToSingleBrackets', () => {
        it('should reduce the brackets', () => {
            expect(doubleToSingleBrackets('((text)) [[array]]')).toEqual('(text) [array]');
        });

        it('should reduce the brackets in the Arabic text', () => {
            expect(
                doubleToSingleBrackets(
                    'قال المؤلف رحمه الله تعالي: ((باب الإخلاص وإحضار النية، في جميع الأعمال والأقوال البارز والخفية))',
                ),
            ).toEqual(
                'قال المؤلف رحمه الله تعالي: (باب الإخلاص وإحضار النية، في جميع الأعمال والأقوال البارز والخفية)',
            );
        });

        it('should handle string with multiple double brackets', () => {
            const str = '((النية)) محلها القلب و ((العمل)) محله الفعل';
            const expected = '(النية) محلها القلب و (العمل) محله الفعل';
            expect(doubleToSingleBrackets(str)).toEqual(expected);
        });

        it('should handle nested double brackets', () => {
            const str = 'قال: ((هو ((العليم)) بكل شيء))';
            const expected = 'قال: (هو (العليم) بكل شيء)';
            expect(doubleToSingleBrackets(str)).toEqual(expected);
        });

        it('should handle string with no double brackets', () => {
            const str = 'الحمد لله رب العالمين';
            expect(doubleToSingleBrackets(str)).toEqual(str);
        });
    });

    describe('fixBracketTypos', () => {
        it('fixes (« pattern to «', () => {
            expect(fixBracketTypos('(«hello»')).toBe('«hello»');
            expect(fixBracketTypos('(«مرحبا»')).toBe('«مرحبا»');
            expect(fixBracketTypos('text («quote» more')).toBe('text «quote» more');
        });

        it('fixes ( ( pattern to «', () => {
            expect(fixBracketTypos('( (hello')).toBe('«hello');
            expect(fixBracketTypos('text ( (content')).toBe('text «content');
        });

        it('fixes ») pattern to »', () => {
            expect(fixBracketTypos('«hello»)')).toBe('«hello»');
            expect(fixBracketTypos('«مرحبا»)')).toBe('«مرحبا»');
            expect(fixBracketTypos('text «quote») more')).toBe('text «quote» more');
        });

        it('fixes ) ) pattern to »', () => {
            expect(fixBracketTypos('hello) )')).toBe('hello»');
            expect(fixBracketTypos('content) ) text')).toBe('content» text');
        });

        it('fixes )digit) pattern to (digit)', () => {
            expect(fixBracketTypos(')123)')).toBe('(123)');
            expect(fixBracketTypos(')456)')).toBe('(456)');
            expect(fixBracketTypos('text )789) more')).toBe('text (789) more');
        });

        it('fixes )digit( pattern to (digit)', () => {
            expect(fixBracketTypos(')123(')).toBe('(123)');
            expect(fixBracketTypos(')456(')).toBe('(456)');
            expect(fixBracketTypos('text )789( more')).toBe('text (789) more');
        });

        it('handles Arabic digits', () => {
            // Arabic-Indic digits (٠-٩)
            expect(fixBracketTypos(')١٢٣)')).toBe('(١٢٣)');
            expect(fixBracketTypos(')٤٥٦(')).toBe('(٤٥٦)');
            expect(fixBracketTypos('text )٧٨٩) more')).toBe('text (٧٨٩) more');
            expect(fixBracketTypos('text )٠١٢( more')).toBe('text (٠١٢) more');
        });

        it('handles mixed English and Arabic digits', () => {
            expect(fixBracketTypos(')1٢3)')).toBe('(1٢3)');
            expect(fixBracketTypos(')٤5٦(')).toBe('(٤5٦)');
        });

        it('handles multiple fixes in one text', () => {
            expect(fixBracketTypos('(«hello») and )123) and ( (world) )')).toBe('«hello» and (123) and «world»');
            expect(fixBracketTypos('(«first») )456( «second»)')).toBe('«first» (456) «second»');
        });

        it('preserves correctly formatted text', () => {
            expect(fixBracketTypos('«properly formatted»')).toBe('«properly formatted»');
            expect(fixBracketTypos('(123) normal brackets')).toBe('(123) normal brackets');
            expect(fixBracketTypos('normal (text) here')).toBe('normal (text) here');
        });

        it('handles empty string', () => {
            expect(fixBracketTypos('')).toBe('');
        });

        it('handles text without brackets', () => {
            const plain = 'This has no brackets or quotes';
            expect(fixBracketTypos(plain)).toBe(plain);
        });

        it('should fix the brackets', () => {
            const actual = fixBracketTypos(')١)');
            expect(actual).toEqual('(١)');
        });

        it('should fix the flipped brackets', () => {
            const actual = fixBracketTypos(')١(');
            expect(actual).toEqual('(١)');
        });

        it('handles single digits', () => {
            expect(fixBracketTypos(')5)')).toBe('(5)');
            expect(fixBracketTypos(')9(')).toBe('(9)');
            expect(fixBracketTypos(')٧)')).toBe('(٧)');
            expect(fixBracketTypos(')٢(')).toBe('(٢)');
        });

        it('handles multi-digit numbers', () => {
            expect(fixBracketTypos(')12345)')).toBe('(12345)');
            expect(fixBracketTypos(')98765(')).toBe('(98765)');
            expect(fixBracketTypos(')١٢٣٤٥)')).toBe('(١٢٣٤٥)');
            expect(fixBracketTypos(')٩٨٧٦٥(')).toBe('(٩٨٧٦٥)');
        });

        it('does not affect other bracket patterns', () => {
            expect(fixBracketTypos('[square brackets]')).toBe('[square brackets]');
            expect(fixBracketTypos('{curly braces}')).toBe('{curly braces}');
            expect(fixBracketTypos('(normal) brackets')).toBe('(normal) brackets');
        });

        it('handles edge cases with spaces', () => {
            expect(fixBracketTypos('( ( content')).toBe('« content');
            expect(fixBracketTypos('content ) )')).toBe('content »');
        });
    });

    describe('fixCurlyBraces', () => {
        it('fixes ( content } to { content }', () => {
            expect(fixCurlyBraces('(hello world}')).toBe('{hello world}');
            expect(fixCurlyBraces('(content here}')).toBe('{content here}');
            expect(fixCurlyBraces('(مرحبا بكم}')).toBe('{مرحبا بكم}');
        });

        it('fixes { content ) to { content }', () => {
            expect(fixCurlyBraces('{hello world)')).toBe('{hello world}');
            expect(fixCurlyBraces('{content here)')).toBe('{content here}');
            expect(fixCurlyBraces('{مرحبا بكم)')).toBe('{مرحبا بكم}');
        });

        it('handles multiple mismatched braces in one text', () => {
            expect(fixCurlyBraces('(first} and {second)')).toBe('{first} and {second}');
            expect(fixCurlyBraces('(one} (two} {three) {four)')).toBe('{one} {two} {three} {four}');
        });

        it('preserves correctly formatted braces', () => {
            expect(fixCurlyBraces('{properly formatted}')).toBe('{properly formatted}');
            expect(fixCurlyBraces('{first} and {second}')).toBe('{first} and {second}');
        });

        it('handles empty string', () => {
            expect(fixCurlyBraces('')).toBe('');
        });

        it('handles text without braces', () => {
            const plain = 'This has no braces';
            expect(fixCurlyBraces(plain)).toBe(plain);
        });

        it('handles content with other brackets/parentheses that should not be affected', () => {
            expect(fixCurlyBraces('(normal parens) and [brackets]')).toBe('(normal parens) and [brackets]');
        });

        it('should fix the curly brackets', () => {
            const actual = fixCurlyBraces('( إِيَّاه}(٣)، وقال: {تَذَكَّرُونَ) (٤).');
            expect(actual).toEqual('{ إِيَّاه}(٣)، وقال: {تَذَكَّرُونَ} (٤).');
        });

        it('handles mixed content with numbers and special characters', () => {
            expect(fixCurlyBraces('(123 + 456 = 789}')).toBe('{123 + 456 = 789}');
            expect(fixCurlyBraces('{hello@email.com)')).toBe('{hello@email.com}');
        });

        it('handles content with spaces', () => {
            expect(fixCurlyBraces('(  spaced content  }')).toBe('{  spaced content  }');
            expect(fixCurlyBraces('{  spaced content  )')).toBe('{  spaced content  }');
        });

        it('handles single character content', () => {
            expect(fixCurlyBraces('(a}')).toBe('{a}');
            expect(fixCurlyBraces('{b)')).toBe('{b}');
        });
    });

    describe('formatStringBySentence', () => {
        it('should keep footnotes in its own line at the beginning', () => {
            const lines = ['وهذا منهج بعيد', 'عن صفاء', 'أخوَّة (۱) الإسلام.', '(۱) حديث صحيح'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(['وهذا منهج بعيد عن صفاء أخوَّة (۱) الإسلام.', '(۱) حديث صحيح']);
        });

        it('should keep footnotes in its own line in the middle', () => {
            const lines = ['وهذا منهج بعيد عن صفاء', 'أخوَّة الإسلام. (۱) حديث صحيح', 'وهذا نص آخر.'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(['وهذا منهج بعيد عن صفاء أخوَّة الإسلام. (۱) حديث صحيح وهذا نص آخر.']);
        });

        it('should handle multiple sentences with footnotes', () => {
            const lines = ['النص الأول. النص الثاني. (۱) حديث صحيح', 'النص الثالث. النص الرابع.'];
            const actual = formatStringBySentence(lines.join('\n'));

            expect(actual.split('\n')).toEqual(['النص الأول. النص الثاني. (۱) حديث صحيح النص الثالث. النص الرابع.']);
        });

        it('should handle 2-digit numerals as footnotes', () => {
            const lines = ['النص الأول (10) النص الثاني.', '(۱۰) حديث صحيح'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(['النص الأول (10) النص الثاني.', '(۱۰) حديث صحيح']);
        });

        it('should handle mixed numerals footnotes', () => {
            const lines = ['النص الأول. (2) حديث صحيح', 'النص الثاني (۱۲) نص ثالث.', '(3) حديث آخر'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(['النص الأول. (2) حديث صحيح النص الثاني (۱۲) نص ثالث.', '(3) حديث آخر']);
        });

        it('should handle footnotes in the middle of the sentence correctly', () => {
            const lines = ['النص الأول. النص الثاني (۲) حديث صحيح. النص الثالث.'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(lines);
        });

        it('should handle edge case with multiple footnotes', () => {
            const lines = ['(1) النص الأول (۱) حديث صحيح (2) النص الثاني (۲).'];
            const actual = formatStringBySentence(lines.join('\n'));
            expect(actual.split('\n')).toEqual(lines);
        });
    });

    describe('isAllUppercase', () => {
        it('returns true for all uppercase text', () => {
            expect(isAllUppercase('HELLO')).toBe(true);
            expect(isAllUppercase('HELLO WORLD')).toBe(true);
            expect(isAllUppercase('TEST123')).toBe(true);
        });

        it('returns false for mixed case text', () => {
            expect(isAllUppercase('Hello')).toBe(false);
            expect(isAllUppercase('HELLO world')).toBe(false);
            expect(isAllUppercase('HeLLo')).toBe(false);
        });

        it('returns false for all lowercase text', () => {
            expect(isAllUppercase('hello')).toBe(false);
            expect(isAllUppercase('hello world')).toBe(false);
        });

        it('returns false for empty string', () => {
            expect(isAllUppercase('')).toBe(false);
        });

        it('returns false for text with only numbers', () => {
            expect(isAllUppercase('123')).toBe(false);
            expect(isAllUppercase('456789')).toBe(false);
        });

        it('returns false for text with only punctuation', () => {
            expect(isAllUppercase('!@#$%')).toBe(false);
            expect(isAllUppercase('.,;:')).toBe(false);
        });

        it('returns false for text with only spaces', () => {
            expect(isAllUppercase('   ')).toBe(false);
            expect(isAllUppercase(' \t\n ')).toBe(false);
        });

        it('returns true for uppercase with numbers and punctuation', () => {
            expect(isAllUppercase('HELLO 123!')).toBe(true);
            expect(isAllUppercase('TEST@EMAIL.COM')).toBe(true);
        });

        it('handles Unicode letters', () => {
            expect(isAllUppercase('ÁÉÍÓÚ')).toBe(true);
            expect(isAllUppercase('áéíóú')).toBe(false);
            expect(isAllUppercase('ÁéÍóÚ')).toBe(false);
        });

        it('returns false for mixed content without letters', () => {
            expect(isAllUppercase('123 !@#')).toBe(false);
        });

        it('should work for bracketed text', () => {
            expect(
                isAllUppercase(
                    '[CHAPTER: THE PRE-EMPTOR WANTED TO TAKE THE SHARE AND IT WAS IN THE HAND OF THE PURCHASER]',
                ),
            ).toBeTrue();
        });
    });

    describe('isOnlyPunctuation', () => {
        it('should return true for a string of punctuation characters', () => {
            expect(isOnlyPunctuation('!?.,:;-')).toBeTruthy();
        });

        it('should return false for a string containing alphanumeric characters', () => {
            expect(isOnlyPunctuation('abc!?')).toBeFalsy();
        });

        it('should return false for an empty string', () => {
            expect(isOnlyPunctuation('')).toBeFalsy();
        });

        it('should return true for a string of mixed punctuation characters', () => {
            expect(isOnlyPunctuation('!@#$%^&*()_+{}|:"<>?[]\\;\',./~`')).toBeTruthy();
        });

        it('should return false for a string with spaces', () => {
            expect(isOnlyPunctuation(' , ')).toBeTruthy();
        });

        it('should return true for a string with a single punctuation character', () => {
            expect(isOnlyPunctuation('!')).toBeTruthy();
        });

        it('should return false for a string with letters and numbers', () => {
            expect(isOnlyPunctuation('123abc')).toBeFalsy();
        });

        it('should return true for a string containing only dash/hyphen characters', () => {
            expect(isOnlyPunctuation('---')).toBeTruthy();
        });

        it('should return true for a string containing only numeric', () => {
            expect(isOnlyPunctuation('210')).toBeTruthy();
        });

        it('should return true for a string containing only Arabic numerals', () => {
            expect(isOnlyPunctuation('٨٢٦')).toBeTruthy();
        });
    });

    describe('normalizeSlashInReferences', () => {
        it('should remove spaces around slashes in number references', () => {
            const input = '127 / 11';
            const expected = '127/11';
            expect(normalizeSlashInReferences(input)).toEqual(expected);
        });

        it('should handle cases without spaces around the slash', () => {
            const input = '127/11';
            const expected = '127/11';
            expect(normalizeSlashInReferences(input)).toEqual(expected);
        });

        it('should handle cases with multiple spaces around the slash', () => {
            const input = '127   /   11';
            expect(normalizeSlashInReferences(input)).toEqual(input);
        });

        it('should not change text without number references', () => {
            const input = 'This is some text';
            expect(normalizeSlashInReferences(input)).toEqual(input);
        });

        it('clean spaces between reference', () => {
            expect(normalizeSlashInReferences('this is 127 / 11 with 127 /2 and 122 /3 and 22/1')).toEqual(
                'this is 127/11 with 127/2 and 122/3 and 22/1',
            );
        });
    });

    describe('normalizeSpaces', () => {
        it('removes the spaces', () => {
            expect(normalizeSpaces('This has    many spaces\n\nNext line')).toEqual(
                'This has many spaces\n\nNext line',
            );
        });

        it('no-op', () => {
            expect(normalizeSpaces('this is')).toEqual('this is');
        });
    });

    describe('removeSpaceInsideBrackets', () => {
        it('should remove the space in the brackets', () => {
            expect(removeSpaceInsideBrackets('( Fasting is during ) [ the ] winter.')).toEqual(
                '(Fasting is during) [the] winter.',
            );
        });
    });

    describe('replaceDoubleBracketsWithArrows', () => {
        it('should reduce the brackets', () => {
            expect(replaceDoubleBracketsWithArrows('((text)) [[array]]')).toEqual('«text» [[array]]');
        });

        it('should handle string with no double brackets', () => {
            const str = 'الحمد لله رب العالمين';
            expect(replaceDoubleBracketsWithArrows(str)).toEqual(str);
        });
    });

    describe('trimSpaceInsideQuotes', () => {
        it('should trim the space inside the quotes', () => {
            expect(trimSpaceInsideQuotes('“ Fasting is during the winter. ”')).toEqual(
                '“Fasting is during the winter.”',
            );
        });
    });

    describe('stripStyling', () => {
        it('should remove styling', () => {
            expect(stripStyling('𝗢𝗳 𝗮𝗹𝗹 𝘀𝘁𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀 𝘢𝗻𝗱 𝘪𝘵𝘢𝘭𝘪𝘤𝘪𝘻𝘦𝘥 𝘁𝗲𝘅𝘁')).toEqual(
                'Of all stipulations and italicized text',
            );
        });
    });

    describe('toTitleCase', () => {
        it('converts single word to title case', () => {
            expect(toTitleCase('hello')).toBe('Hello');
            expect(toTitleCase('WORLD')).toBe('World');
            expect(toTitleCase('tEsT')).toBe('Test');
        });

        it('converts multiple words to title case', () => {
            expect(toTitleCase('hello world')).toBe('Hello World');
            expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
        });

        it('handles mixed case input', () => {
            expect(toTitleCase('hELLo WoRLD')).toBe('Hello World');
            expect(toTitleCase('jAvAsCrIpT iS fUn')).toBe('Javascript Is Fun');
        });

        it('handles empty string', () => {
            expect(toTitleCase('')).toBe('');
        });

        it('handles single character', () => {
            expect(toTitleCase('a')).toBe('A');
        });

        it('handles multiple spaces', () => {
            expect(toTitleCase('hello  world')).toBe('Hello  World');
        });

        it('handles leading and trailing spaces', () => {
            expect(toTitleCase(' hello world ')).toBe(' Hello World ');
        });

        it('handles numbers and special characters', () => {
            expect(toTitleCase('hello123 world!')).toBe('Hello123 World!');
        });

        it('should work with bracketed text', () => {
            expect(
                toTitleCase(
                    '[CHAPTER: THE PRE-EMPTOR WANTED TO TAKE THE SHARE AND IT WAS IN THE HAND OF THE PURCHASER]',
                ),
            ).toBe('[Chapter: The Pre-emptor Wanted To Take The Share And It Was In The Hand Of The Purchaser]');
        });

        it('should work with ALA-LC transliterations', () => {
            expect(toTitleCase('BĀB: RAḤMĀN')).toBe('Bāb: Raḥmān');
        });
    });
});
