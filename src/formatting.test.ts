import { describe, expect, it } from 'vitest';

import {
    addLineBreaksAfterPunctuation,
    applySmartQuotes,
    cleanJunkFromText,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    condenseAsterisks,
    condenseEllipsis,
    condenseMultilinesToDouble,
    condenseMultilinesToSingle,
    doubleToSingleBrackets,
    formatStringBySentence,
    isOnlyPunctuation,
    reduceSpaceBetweenReference,
    reduceSpaces,
    removeStyling,
} from './formatting';

describe('formatting', () => {
    describe('addLineBreaksAfterPunctuation', () => {
        it('should add a new line after each period', () => {
            const input = 'الحمد لله رب العالمين. صلى الله وسلم على نبينا محمد.';
            const expectedOutput = 'الحمد لله رب العالمين.\nصلى الله وسلم على نبينا محمد.';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each exclamation mark', () => {
            const input = 'سبحان الله! الحمد لله!';
            const expectedOutput = 'سبحان الله!\nالحمد لله!';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each question mark', () => {
            const input = 'صلى الله وسلم على نبينا محمد؟ اجمعين.';
            const expectedOutput = 'صلى الله وسلم على نبينا محمد؟\nاجمعين.';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should add a new line after each Arabic question mark', () => {
            const input = 'كيف حالك؟ انا بخير.';
            const expectedOutput = 'كيف حالك؟\nانا بخير.';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle multiple punctuation marks in a single string', () => {
            const input = 'الحمد لله رب العالمين! سبحان الله. الله أكبر؟';
            const expectedOutput = 'الحمد لله رب العالمين!\nسبحان الله.\nالله أكبر؟';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should not add extra spaces after punctuation marks', () => {
            const input = ['الحمد لله رب العالمين.', 'سبحان الله!'];
            const expectedOutput = 'الحمد لله رب العالمين.\nسبحان الله!';
            expect(addLineBreaksAfterPunctuation(input.join(' '))).toBe(expectedOutput);
        });

        it('should return the same string if there are no punctuation marks', () => {
            const input = 'الحمد لله رب العالمين';
            const expectedOutput = 'الحمد لله رب العالمين';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle empty string input', () => {
            const input = '';
            const expectedOutput = '';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
        });

        it('should handle strings with only punctuation marks correctly', () => {
            const input = '!.؟';
            const expectedOutput = '!\n.\n؟';
            expect(addLineBreaksAfterPunctuation(input)).toBe(expectedOutput);
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

    describe('condenseEllipsis', () => {
        it('should condense the periods into an ellipsis', () => {
            expect(condenseEllipsis('This is some text...')).toEqual('This is some text…');
        });
    });

    describe('condenseMultilinesToDouble', () => {
        it('should reduce 3 or more line breaks to exactly 2', () => {
            const input = 'This is line 1\n\n\n\nThis is line 2';
            const expected = 'This is line 1\n\nThis is line 2';
            expect(condenseMultilinesToDouble(input)).toBe(expected);
        });

        it('should not change 2 consecutive line breaks', () => {
            const input = 'This is line 1\n\nThis is line 2';
            expect(condenseMultilinesToDouble(input)).toBe(input);
        });
    });

    describe('condenseMultilinesToSingle', () => {
        it('should reduce 2 or more line breaks to exactly 1', () => {
            const input = 'This is line 1\n\nThis is line 2';
            const expected = 'This is line 1\nThis is line 2';
            expect(condenseMultilinesToSingle(input)).toBe(expected);
        });

        it('should not change single line breaks', () => {
            const input = 'This is line 1\nThis is line 2';
            expect(condenseMultilinesToSingle(input)).toEqual(input);
        });

        it('should remove the multiple line breaks', () => {
            expect(condenseMultilinesToSingle('This\n\nis\n\n\nsome\nlines')).toEqual('This\nis\nsome\nlines');
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

    describe('reduceSpaceBetweenReference', () => {
        it('should remove spaces around slashes in number references', () => {
            const input = '127 / 11';
            const expected = '127/11';
            expect(reduceSpaceBetweenReference(input)).toEqual(expected);
        });

        it('should handle cases without spaces around the slash', () => {
            const input = '127/11';
            const expected = '127/11';
            expect(reduceSpaceBetweenReference(input)).toEqual(expected);
        });

        it('should handle cases with multiple spaces around the slash', () => {
            const input = '127   /   11';
            expect(reduceSpaceBetweenReference(input)).toEqual(input);
        });

        it('should not change text without number references', () => {
            const input = 'This is some text';
            expect(reduceSpaceBetweenReference(input)).toEqual(input);
        });

        it('clean spaces between reference', () => {
            expect(reduceSpaceBetweenReference('this is 127 / 11 with 127 /2 and 122 /3 and 22/1')).toEqual(
                'this is 127/11 with 127/2 and 122/3 and 22/1',
            );
        });
    });

    describe('reduceSpaces', () => {
        it('removes the spaces', () => {
            expect(reduceSpaces('This has    many spaces\n\nNext line')).toEqual('This has many spaces\n\nNext line');
        });

        it('no-op', () => {
            expect(reduceSpaces('this is')).toEqual('this is');
        });
    });

    describe('removeStyling', () => {
        it('should remove styling', () => {
            expect(removeStyling('𝗢𝗳 𝗮𝗹𝗹 𝘀𝘁𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀 𝘢𝗻𝗱 𝘪𝘵𝘢𝘭𝘪𝘤𝘪𝘻𝘦𝘥 𝘁𝗲𝘅𝘁')).toEqual(
                'Of all stipulations and italicized text',
            );
        });
    });
});
