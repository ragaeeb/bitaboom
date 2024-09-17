import { describe, expect, it } from 'vitest';

import {
    condenseDoubleApostrophesToSingle,
    convertArabicPrefixesToAl,
    fixSalutations,
    getInitials,
    normalize,
    normalizeApostrophes,
    stripPrefixes,
} from './transliteration';

describe('transliteration', () => {
    describe('condenseDoubleApostrophesToSingle', () => {
        it('should remove the two apostrophes to one', () => {
            expect(condenseDoubleApostrophesToSingle('ʿulamāʾʾ')).toEqual('ʿulamāʾ');
        });
    });

    describe('convertArabicPrefixesToAl', () => {
        it('should replace all the al-s', () => {
            expect(
                convertArabicPrefixesToAl(
                    'Al-Rahman bar-Rahman becomes al-Rahman, and ar-Rahman becomes al-Rahman, and As-Sukkari and as-Sukkari both become al-Sukkari, and adh-Dhahabi and Adh-Dhahabi both turn to Al Dhahabi with Sufyan Ath Thawri',
                ),
            ).toEqual(
                'al-Rahman bar-Rahman becomes al-Rahman, and al-Rahman becomes al-Rahman, and al-Sukkari and al-Sukkari both become al-Sukkari, and al-Dhahabi and al-Dhahabi both turn to al-Dhahabi with Sufyan al-Thawri',
            );
        });

        it('should replace the az variations', () => {
            expect(convertArabicPrefixesToAl('Az-Zuhri and Az Zuhri should both get formatted baz Baz B-Az')).toEqual(
                'al-Zuhri and al-Zuhri should both get formatted baz Baz B-Az',
            );
        });

        it('should replace the Ats and Ad variations', () => {
            expect(convertArabicPrefixesToAl('Ad-Ḏuhlī and Sufyān Ats-Thawrī')).toEqual(
                'al-Ḏuhlī and Sufyān al-Thawrī',
            );
        });

        it('should replace the ash variations', () => {
            expect(
                convertArabicPrefixesToAl(
                    'Ash-hadu an la ilaha should be intact but ash-Shafiee or Ash-Shafiee and Ash-Shaykh should be changed',
                ),
            ).toEqual(
                'Ash-hadu an la ilaha should be intact but al-Shafiee or al-Shafiee and al-Shaykh should be changed',
            );
        });

        it('should trim the spaces', () => {
            expect(
                convertArabicPrefixesToAl(
                    'Al-Rahman bar-Rahman ar-Rahman al- Rahman al- ḥadīth bal- Rahman al- ḥadīth al- Qāḍī al- ʿAbd al- Jabbār al- something',
                ),
            ).toEqual(
                'al-Rahman bar-Rahman al-Rahman al-Rahman al-ḥadīth bal-Rahman al-ḥadīth al-Qāḍī al-ʿAbd al-Jabbār al-something',
            );
        });

        it('should not trim the spaces since nothing follows the prefix', () => {
            expect(convertArabicPrefixesToAl('al- ')).toEqual('al- ');
        });
    });

    describe('getInitials', () => {
        it('should get the initials', () => {
            expect(getInitials('Nayl al-Awtar')).toEqual('NA');
        });
    });

    describe('fixSalutations', () => {
        it('Messenger of Allah (*)', () => {
            expect(fixSalutations('Then the Messenger of Allah (sallahu alayhi wasallam) said')).toEqual(
                'Then the Messenger of Allah ﷺ said',
            );
        });

        it('Messenger (*)', () => {
            expect(fixSalutations('Then the Messenger (sallahu alayhi wasallam) said')).toEqual(
                'Then the Messenger ﷺ said',
            );
        });

        it('Messenger (peace*)', () => {
            expect(fixSalutations('Then the Messenger (peace and blessings be upon him) said')).toEqual(
                'Then the Messenger ﷺ said',
            );
        });

        it('Messenger (May peace*)', () => {
            expect(fixSalutations(`Allah's Messenger (May peace and blessings be upon him) said`)).toEqual(
                `Allah's Messenger ﷺ said`,
            );
        });

        it('Messenger (Prophet peace*)', () => {
            expect(fixSalutations(`Prophet (May peace and blessings be upon him) said`)).toEqual(`Prophet ﷺ said`);
        });

        it('Prophet (*)', () => {
            expect(fixSalutations('Then the Prophet (sallahu alayhi wasallam) said')).toEqual(
                'Then the Prophet ﷺ said',
            );
        });

        it('Muhammad (*)', () => {
            expect(fixSalutations('Then Muhammad (sallahu alayhi wasallam) said')).toEqual('Then Muhammad ﷺ said');
        });

        it('Muḥammad (*)', () => {
            expect(fixSalutations('Then Muḥammad (sallahu alayhi wasallam) said')).toEqual('Then Muḥammad ﷺ said');
        });

        it('Must start with s', () => {
            expect(fixSalutations('Then Muḥammad (xsallahu alayhi wasallam) said')).toEqual(
                'Then Muḥammad (xsallahu alayhi wasallam) said',
            );
        });

        it('Must end with m', () => {
            expect(fixSalutations('Then Muḥammad (sallahu alayhi wasalla) said')).toEqual(
                'Then Muḥammad (sallahu alayhi wasalla) said',
            );
        });
    });

    describe('normalize', () => {
        it('should strip out dashes', () => {
            expect(normalize('Al-Jadwal')).toEqual('AlJadwal');
        });

        it('should change diacritics to original', () => {
            expect(normalize('āḍġḥīṣṭūĀḌĠḤĪṢṬŪ')).toEqual('adghistuADGHISTU');
        });

        it('should strip out apostrophes', () => {
            expect(normalize('`ʾʿ-')).toEqual('');
        });
    });

    describe('normalizeApostrophes', () => {
        it('should turn all the apostrophe characters to the regular one', () => {
            expect(normalizeApostrophes(`‛ulama’ al-su‘`)).toEqual("'ulama' al-su'");
        });
    });

    describe('stripPrefixes', () => {
        it('should remove al- from beginning only', () => {
            expect(stripPrefixes('al-Bukharial-Ka')).toEqual('Bukharial-Ka');
        });

        it('should remove Al- from beginning only (case insensitive)', () => {
            expect(stripPrefixes('Al-BukhariAl-Ka')).toEqual('BukhariAl-Ka');
        });

        it('should remove l- from prefix only', () => {
            expect(stripPrefixes('Jarḥ wa ʾl-Taʿdīl-xyz')).toEqual('Jarḥ ʾTaʿdīxyz');
        });

        it('should remove fī', () => {
            expect(stripPrefixes('Asma fī qiyāsfīk')).toEqual('Asma qiyāsfīk');
        });

        it('should remove wa', () => {
            expect(stripPrefixes('Asma wa sifaat wa-khayr')).toEqual('Asma sifaat khayr');
        });

        it('should remove ʿalá', () => {
            expect(stripPrefixes('Fiqh ʿalá Husna')).toEqual('Fiqh Husna');
        });

        it('should remove ʿan', () => {
            expect(stripPrefixes('Fiqh ʿan Husna muʿanan')).toEqual('Fiqh Husna muʿanan');
        });

        it('should remove b.', () => {
            expect(stripPrefixes('Ibn Abi b. Husna')).toEqual('Ibn Abi Husna');
        });

        it('should remove bi-', () => {
            expect(stripPrefixes('Ibn Abi b. bi-Husna')).toEqual('Ibn Abi Husna');
        });

        it('should remove li-', () => {
            expect(stripPrefixes('Ibn Abi b. li-Husna')).toEqual('Ibn Abi Husna');
        });
    });
});
