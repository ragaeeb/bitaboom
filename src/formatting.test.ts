import { describe, expect, it } from 'vitest';

import {
    addLineBreaksAfterPunctuation,
    applySmartQuotes,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    condenseMultilinesToDouble,
    condenseMultilinesToSingle,
    formatStringBySentence,
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
            expect(condenseMultilinesToSingle(input)).toBe(input);
        });

        it('should remove the multiple line breaks', () => {
            expect(condenseMultilinesToSingle('This\n\nis\n\n\nsome\nlines')).toEqual('This\nis\nsome\nlines');
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
