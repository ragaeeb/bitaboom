import { describe, expect, it } from 'bun:test';
import { escapeRegex, makeDiacriticInsensitiveRegex } from './cleaning';

describe('cleaning', () => {
    describe('cleaning > makeDiacriticInsensitiveRegex', () => {
        it('should match with/without diacritics', () => {
            const rx = makeDiacriticInsensitiveRegex('السلام عليكم');
            expect(rx.test('اَلسَّلَامُ عَلَيْكُمْ')).toBe(true);
            expect(rx.test('السلام عليكم')).toBe(true);
        });

        it('should handle alif/hamza and alif maqsurah/ya', () => {
            const rx = makeDiacriticInsensitiveRegex('أنا إلى الآفاق');
            expect(rx.test('انا الى الافاق')).toBe(true); // أ/إ/آ -> ا, ى~ي
            expect(rx.test('انا الي الافاق')).toBe(true); // variant with ي
        });

        it('should match ta marbuta <-> ha', () => {
            const rx = makeDiacriticInsensitiveRegex('مدرسة');
            expect(rx.test('مدرسه')).toBe(true);
        });

        it('should tolerate tatweel between letters', () => {
            const rx = makeDiacriticInsensitiveRegex('أبتكة');
            expect(rx.test('أبـــتِـــكَةُ')).toBe(true);
        });

        describe('builder compatibility', () => {
            it('composes sources using makeDiacriticInsensitiveRegex (RegExp)', () => {
                const words = ['أنا', 'الى'];
                const pieces = words.map((w) => makeDiacriticInsensitiveRegex(w).source);
                const rx = new RegExp(`^(?:${pieces.join('|')})` + escapeRegex(' الافاق') + '.*$', 'mu');

                expect(rx.test('انا الافاق')).toBe(true);
                expect(rx.test('إِلى الافاق')).toBe(true);
                expect(rx.test('آنا الافاق')).toBe(true);
                expect(rx.test('هو الافاق')).toBe(false);
            });

            it('can build diacritic-insensitive suffix too when needed', () => {
                const head = makeDiacriticInsensitiveRegex('مدرسة').source;
                const tail = makeDiacriticInsensitiveRegex('جميلة').source;
                const rx = new RegExp(`^${head}\\s+${tail}$`, 'u');

                expect(rx.test('مدرسة جميلة')).toBe(true);
                expect(rx.test('مدرسه جَميلَة')).toBe(true);
            });
        });
    });
});
