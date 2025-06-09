import { describe, expect, it } from 'vitest';

import {
    addSpaceBeforeAndAfterPunctuation,
    applySmartQuotes,
    cleanJunkFromText,
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
    formatStringBySentence,
    hasWordInSingleLine,
    insertLineBreaksAfterPunctuation,
    isOnlyPunctuation,
    normalizeSlashInReferences,
    normalizeSpaces,
    reduceMultilineBreaksToDouble,
    reduceMultilineBreaksToSingle,
    removeRedundantPunctuation,
    removeSpaceInsideBrackets,
    replaceDoubleBracketsWithArrows,
    stripStyling,
    trimSpaceInsideQuotes,
} from './formatting';

describe('formatting', () => {
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
    });

    describe('cleanJunkFromText', () => {
        it('should remove the first line if it is only punctuation', () => {
            const input = '!@#\nThis is a test.';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should remove the last line if it is only punctuation', () => {
            const input = 'This is a test.\n!@#';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should remove both the first and last line if they are only punctuation', () => {
            const input = '!@#\nThis is a test.\n!@#';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should not remove any lines if none are only punctuation', () => {
            const input = 'First line.\nThis is a test.\nLast line.';
            const output = 'First line.\nThis is a test.\nLast line.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should remove the first line if it has length 1', () => {
            const input = 'A\nThis is a test.';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should remove the last line if it has length 1', () => {
            const input = 'This is a test.\nA';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should remove both the first and last line if they have length 1', () => {
            const input = 'A\nThis is a test.\nB';
            const output = 'This is a test.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should return an empty string if the input is a single punctuation line', () => {
            const input = '!@#';
            const output = '';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should return an empty string if the input is a single character line', () => {
            const input = 'A';
            const output = '';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should handle input with only valid lines correctly', () => {
            const input = ' First line.\nSecond line.\nThird line. ';
            const output = 'First line.\nSecond line.\nThird line.';
            expect(cleanJunkFromText(input)).toBe(output);
        });

        it('should handle input with mixed valid and invalid lines correctly', () => {
            const input = 'A\nFirst line.\nSecond line.\nC\nThird line.\nB';
            const output = 'First line.\nSecond line.\nThird line.';
            expect(cleanJunkFromText(input)).toBe(output);
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

    describe('replaceDoubleBracketsWithArrows', () => {
        it('should reduce the brackets', () => {
            expect(replaceDoubleBracketsWithArrows('((text)) [[array]]')).toEqual('«text» [[array]]');
        });

        it('should handle string with no double brackets', () => {
            const str = 'الحمد لله رب العالمين';
            expect(replaceDoubleBracketsWithArrows(str)).toEqual(str);
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
});
