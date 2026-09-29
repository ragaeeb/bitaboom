import { describe, expect, it } from 'bun:test';
import { allFunctions } from './catalog';

describe('demo examples', () => {
    it('should demonstrate a transformation or return a usable value for every focused example', () => {
        for (const fn of allFunctions) {
            const value = fn.formatter(fn.sample);
            expect(value, fn.name).toBeDefined();
            if (typeof value === 'string') {
                expect(value, fn.name).not.toBe(fn.sample);
            } else if (typeof value === 'number') {
                expect(Number.isFinite(value), fn.name).toBe(true);
            }
        }
    });

    it('should contrast detector results and demonstrate the page range error', () => {
        for (const fn of allFunctions.filter((item) => item.comparison)) {
            const initial = fn.formatter(fn.sample);
            if (typeof initial === 'boolean') {
                expect(initial, fn.name).toBe(true);
                expect(fn.formatter(fn.comparison!), fn.name).toBe(false);
            }
        }
        const ranges = allFunctions.find((fn) => fn.name === 'parsePageRanges')!;
        expect(() => ranges.formatter(ranges.comparison!)).toThrow('Start page cannot be greater than end page');
    });
});
