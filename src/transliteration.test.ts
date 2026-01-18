import { describe, expect, it } from 'bun:test';

import {
    extractInitials,
    normalize,
    normalizeApostrophes,
    normalizeArabicPrefixesToAl,
    normalizeDoubleApostrophes,
    removeArabicPrefixes,
    replaceSalutationsWithSymbol,
} from './transliteration';

describe('transliteration', () => {
    describe('normalizeDoubleApostrophes', () => {
        it('should remove the two apostrophes to one', () => {
            expect(normalizeDoubleApostrophes('ʿulamāʾʾ')).toEqual('ʿulamāʾ');
        });
    });

    describe('normalizeArabicPrefixesToAl', () => {
        it('should replace all the al-s', () => {
            expect(
                normalizeArabicPrefixesToAl(
                    'Al-Rahman bar-Rahman becomes al-Rahman, and ar-Rahman becomes al-Rahman, and As-Sukkari and as-Sukkari both become al-Sukkari, and adh-Dhahabi and Adh-Dhahabi both turn to Al Dhahabi with Sufyan Ath Thawri',
                ),
            ).toEqual(
                'al-Rahman bar-Rahman becomes al-Rahman, and al-Rahman becomes al-Rahman, and al-Sukkari and al-Sukkari both become al-Sukkari, and al-Dhahabi and al-Dhahabi both turn to al-Dhahabi with Sufyan al-Thawri',
            );
        });

        it('should replace the az variations', () => {
            expect(normalizeArabicPrefixesToAl('Az-Zuhri and Az Zuhri should both get formatted baz Baz B-Az')).toEqual(
                'al-Zuhri and al-Zuhri should both get formatted baz Baz B-Az',
            );
        });

        it('should replace the Ats and Ad variations', () => {
            expect(normalizeArabicPrefixesToAl('Ad-Ḏuhlī and Sufyān Ats-Thawrī')).toEqual(
                'al-Ḏuhlī and Sufyān al-Thawrī',
            );
        });

        it('should replace the ash variations', () => {
            expect(
                normalizeArabicPrefixesToAl(
                    'Ash-hadu an la ilaha should be intact but ash-Shafiee or Ash-Shafiee and Ash-Shaykh should be changed',
                ),
            ).toEqual(
                'Ash-hadu an la ilaha should be intact but al-Shafiee or al-Shafiee and al-Shaykh should be changed',
            );
        });

        it('should trim the spaces', () => {
            expect(
                normalizeArabicPrefixesToAl(
                    'Al-Rahman bar-Rahman ar-Rahman al- Rahman al- ḥadīth bal- Rahman al- ḥadīth al- Qāḍī al- ʿAbd al- Jabbār al- something',
                ),
            ).toEqual(
                'al-Rahman bar-Rahman al-Rahman al-Rahman al-ḥadīth bal-Rahman al-ḥadīth al-Qāḍī al-ʿAbd al-Jabbār al-something',
            );
        });

        it('should not trim the spaces since nothing follows the prefix', () => {
            expect(normalizeArabicPrefixesToAl('al- ')).toEqual('al- ');
        });
    });

    describe('extractInitials', () => {
        it('should get the initials', () => {
            expect(extractInitials('Nayl al-Awtar')).toEqual('NA');
        });
    });

    describe('replaceSalutationsWithSymbol', () => {
        // All salutation variations to test - each should be replaced with ﷺ
        const SALUTATION_VARIATIONS = [
            ', peace and blessings be upon him,',
            ", sallallaahu 'alayhi wa sallam,",
            "sallalaahu alayhi wa'sallam",
            "sallalahu alayhi wa'sallam",
            "sallallaahu 'alayhi wa sallam",
            'sallAllaahu alayhi wa sallam',
            "sallallaahu 'alayhi wa sallam",
            'SAWS',
            'sws',
            'P.B.U.H.',
            'صلى الله عليه وسلم',
            'صلي الله عليه وسلم',
            'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
            '– SallAllāhu alayhi wa sallam –',
            '–sallAllāhu alayhi wa Salām–',
            "sallaa Allahu 'alaihi wa sallam",
            'صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
            'صلَّى اللهُ عليهِ وسلَّمَ',
            'صلّى اللَّهُ عليه وسلّم',
            'p.b.u.h',
            'SAAS',
            'pbuh',
            'عليه الصَّلاة والسَّلام',
            'صلي الله عليه و سلم',
            'صلى الله عليه و سلم',
            'صلى الله عليه وآله وسلم',
            'صَلَّى اللَّه عَلَيْهِ وَسَلَّمَ',
            'عليه الصلاة والسلام',
            "sallaa Allahu 'alaihi wa Aalihi wa sallam",
            'Sallallāhu alayhi wa sallam',
            'sallallaahu alahyi wa sallam',
            "salla Llahu 'alayhi wa sallam",
            'sallallahualaihiwasallam',
            'sallallahoalaihiwasalam',
            "salla Allaahu 'alaihe wasallam",
            'PBUH',
            'sallaa Allahu alayhi wa sallam',
            "sal-Allaahu 'alayhe wa sallam",
            "sallAllaahu 'alayhi wa sallam",
            'SAllaahu Alihee Wasallam',
            "sallAllaahu 'alayhi wa sallam",
            'صلى الله عليه وعلى آله وسلم',
            'صلى الله ليه وسلم',
            'sallallaahu alaihi wa sallam',
            "sallallaahu 'alayhe wa sallam",
            'صلوات الله وسلامه عليه',
            'صلى الله تعالى عليه وآله وسلم',
            'sallallaahu aalaihi wa sallam',
            'صلى وسلم عليه هللا',
            'salla llahu alayhi wa sallam',
            'sallallaahu alayhi was salaam',
            'sall Allaahu alayhi was sallam',
            "sallAllahu 'alayhi wassallam",
            "sallallāhu 'alayhi wassallam",
            'sallallahu alayhi wa sallam',
            'sallahu alaihi wa sallam',
            'sallahu alayhi wa sallam',
            'sallahu alayhi wa salām',
            "sallallaahu 'alaihi wa sallam",
            'sallallahu alaihi wa sallam',
            "sallallaahu 'alaihi was salām",
            'sallallahu alaihi was salam',
            "sallallahu 'alaihi wasallam",
            'sallallahu alaihi wasallam',
            "sallaa Allahu 'alaihi wa-sallam",
            'salla Allahu alaihi wasallam',
            "sallallaahu 'alayhe wa sallam",
            "sallallahu 'alayhe wa sallam",
            'sallal laahu alayhi wasallam',
            'sallal lahu alayhi wasallam',
            'peace and blessings of Allah be upon him',
            'peace and blessings of Allāh be upon him',
            'blessings and peace of Allah be upon him',
            'peace and blessings of Allaah be upon him',
            'sallallaahu ʿalayhi wa sallam',
            '-ﷺ-',
            'sallallaahu alaihi wasallam',
            "sallallaahu 'alaihi wasallam",
            "sallallahu 'alayhi wa salām",
            '(SAW)',
            "sallaahu 'alayhi wasallam",
            'sallahu alayhi wasallam',
            "sallaahu 'alahi wasallam",
            'sallahu alahi wasallam',
            'sall Allahu alaihi wasallam',
            'sall Allāhu alaihi wasallam',
            'sall Allahu alayhi wasallam',
            "sAllaah Allaahu 'allayhi wa sallam",
            'sAllah Allahu allayhi wa sallam',
            'sallallahu alayhe wa sallam',
            "sallallahu 'alaihi wa sallam",
            'صلى الله عليه وسلّم',
            'صلى اللّه عليه وسلّم',
            'Sallallaahu 3alayhi wa Sallam',
            'Sallallahu 3alayhi wa Sallam',
            'ṣallallāhu ʿalayhi wa sallam',
            "sallaa Allahu 'alaihi wa ʿalá Aalihi wa sallam",
            'salla Allahu alaihi wa ala Alihi wa sallam',
            'sallallaahu alayhi wassallam',
            'sallallahu alayhi wassallam',
            '(s. a. w. s)',
            '(s. a. w. s.)',
            "sallAllaahu ' alayhi wa sallam",
            'sallAllahu  alayhi wa sallam',
            "sallaa Allahu 'alaihi wa 'alaa Aalihi wa sallam",
            'sallallahu alyhi wa sallam',
            'sallallāhu alayhi wa sallam',
            "sallallahu 'alayhi wa sallam",
            "ṣallā Allāhu 'alayhi wa-sallam",
            'salla Allahu alayhi wasallam',
            'sallAllaahu alayhi wa Salām',
            'sallAllahu alayhi wa Salam',
            'ṣallā Allāhu ʿalayhi wa-sallam',
            'ṣallā Allah ʿalayhi wa-sallam',
            'ṣallā llāhu ʿalayhi wa-sallam',
            'ṣallá Allāhu ʿalayhi wa-sallam',
            'ṣallā Allāhu ʿalayhi wa-ālihī wa-sallam',
            'ṣallā Allāhu ʿalayhi wa-ʿalā ālihi wa-sallam',
            'ṣallAllāhu ʿalayhi wa-sallam',
            'ṣallallāhu ʿalayhi wa-sallam',
            'ṣallá Allāhu ʿalayhi wa-ālihī wa-sallam',
            'ṣallá Allāhu ʿalayhi wa-ʿalā ālihi wa-sallam',
            'ṣallallāhu ʿalayhi wa-ʿalā ālihi wa-sallam',
            'ṣallallāhu ʿalayhi wa-ʾālihī wa-sallam',
            "ṣallallāhu 'alayhi wa-sallam",
            'sallallahu alayhi wasallam',
            'ṣallallāhu ʿalayhi wa-ʿalā ālihī wa-sallam',
            'ṣallā Allah ʿalayhi wa-ālihi wa-sallam',
            "ṣallā Allāhu 'alayhi wa-sallam",
            'sallaallahu alahyi wa sallam',
            'sallallahu alahyi wa sallam',
            "ṣallallāhu 'alayhi wa-'alā ālihi wa-sallam",
            'sallallahu alayhi waala alihi wasallam',
            'ṣallallāhu ʿalayhi wa-ālihī wa-sallam',
            'ṣallā Allāhu ʿalayhi wa-Ālihi wa-sallam',
            'ṣallá Allāhu ʻalayhi wa-sallam',
            'ṣallá Allāhu ʻalayhi wa-ālihi wa-sallam',
            "ṣallallāhu 'alayhi wa-sallam",
            'ṣallá Allah ʿalayhi wa-ālih wa-sallam',
            'ṣallá Allāhu ʿalayhi wa-ʿalá ālihi wa-sallam',
            "ṣallā Allāhu 'alayhi wa 'alā ālihi wa-sallam",
            'salla Allahu alayhi wa ala alihi wasallam',
            'ṣallá Allāhu ʿalayhi wa ʿalá ālihi wa sallam',
            'ṣallā -llāhu ʿalayhi wa-sallam',
            'ṣallā -llāhu ʿalayhi wa-ālihi wa-sallam',
            "ṣallallāhu 'alayhi wa-ālihi wa-sallam",
            'sallallahu alayhi waalihi wasallam',
        ];

        describe('individual variations', () => {
            for (const variation of SALUTATION_VARIATIONS) {
                it(`should replace: ${variation.substring(0, 50)}${variation.length > 50 ? '...' : ''}`, () => {
                    const input = `Text before ${variation} text after`;
                    const result = replaceSalutationsWithSymbol(input);
                    expect(result).toBe('Text before ﷺ text after');
                });
            }
        });

        describe('context handling', () => {
            it('should preserve text before and after salutation', () => {
                expect(replaceSalutationsWithSymbol('The Prophet sallallahu alayhi wasallam said')).toEqual(
                    'The Prophet ﷺ said',
                );
            });

            it('should handle multiple salutations in one text', () => {
                const result = replaceSalutationsWithSymbol(
                    'The Prophet PBUH and Muhammad sallallahu alayhi wasallam both mentioned',
                );
                expect(result).toContain('Prophet ﷺ');
                expect(result).toContain('Muhammad ﷺ');
            });

            it('should handle salutation at start of text', () => {
                expect(replaceSalutationsWithSymbol('PBUH was a title')).toEqual('ﷺ was a title');
            });

            it('should handle salutation at end of text', () => {
                expect(replaceSalutationsWithSymbol('The Prophet PBUH')).toEqual('The Prophet ﷺ');
            });

            it('should handle standalone salutation', () => {
                expect(replaceSalutationsWithSymbol('PBUH')).toEqual('ﷺ');
            });
        });

        describe('parenthetical salutations', () => {
            it('Messenger of Allah (*)', () => {
                expect(
                    replaceSalutationsWithSymbol('Then the Messenger of Allah (sallahu alayhi wasallam) said'),
                ).toEqual('Then the Messenger of Allah ﷺ said');
            });

            it('Messenger (*)', () => {
                expect(replaceSalutationsWithSymbol('Then the Messenger (sallahu alayhi wasallam) said')).toEqual(
                    'Then the Messenger ﷺ said',
                );
            });

            it('Messenger (peace*)', () => {
                expect(
                    replaceSalutationsWithSymbol('Then the Messenger (peace and blessings be upon him) said'),
                ).toEqual('Then the Messenger ﷺ said');
            });

            it('Messenger (May peace*)', () => {
                expect(
                    replaceSalutationsWithSymbol(`Allah's Messenger (May peace and blessings be upon him) said`),
                ).toEqual(`Allah's Messenger ﷺ said`);
            });

            it('Prophet (May peace*)', () => {
                expect(replaceSalutationsWithSymbol(`Prophet (May peace and blessings be upon him) said`)).toEqual(
                    `Prophet ﷺ said`,
                );
            });

            it('Prophet (*)', () => {
                expect(replaceSalutationsWithSymbol('Then the Prophet (sallahu alayhi wasallam) said')).toEqual(
                    'Then the Prophet ﷺ said',
                );
            });

            it('Muhammad (*)', () => {
                expect(replaceSalutationsWithSymbol('Then Muhammad (sallahu alayhi wasallam) said')).toEqual(
                    'Then Muhammad ﷺ said',
                );
            });

            it('Muḥammad (*)', () => {
                expect(replaceSalutationsWithSymbol('Then Muḥammad (sallahu alayhi wasallam) said')).toEqual(
                    'Then Muḥammad ﷺ said',
                );
            });

            it('should handle (SAW) abbreviation', () => {
                expect(replaceSalutationsWithSymbol('The Prophet (SAW) said')).toEqual('The Prophet ﷺ said');
            });

            it('should handle (s. a. w. s.) abbreviation', () => {
                expect(replaceSalutationsWithSymbol('The Prophet (s. a. w. s.) said')).toEqual('The Prophet ﷺ said');
            });
        });

        describe('Arabic text handling', () => {
            it('should replace Arabic salutation with diacritics', () => {
                expect(replaceSalutationsWithSymbol('النبي صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قال')).toEqual('النبي ﷺ قال');
            });

            it('should replace Arabic salutation without diacritics', () => {
                expect(replaceSalutationsWithSymbol('النبي صلى الله عليه وسلم قال')).toEqual('النبي ﷺ قال');
            });

            it('should replace alternative Arabic form', () => {
                expect(replaceSalutationsWithSymbol('محمد عليه الصلاة والسلام')).toEqual('محمد ﷺ');
            });
        });

        describe('edge cases', () => {
            it('should not replace partial matches', () => {
                expect(replaceSalutationsWithSymbol('sallahu said something')).toEqual('sallahu said something');
            });

            it('should not replace common greetings', () => {
                expect(replaceSalutationsWithSymbol('salam alaykum')).toEqual('salam alaykum');
            });

            it('should not replace unrelated Arabic phrases', () => {
                expect(replaceSalutationsWithSymbol('الحمد لله رب العالمين')).toEqual('الحمد لله رب العالمين');
            });

            it('should handle already replaced symbol', () => {
                expect(replaceSalutationsWithSymbol('The Prophet ﷺ said')).toEqual('The Prophet ﷺ said');
            });

            it('should preserve line breaks around replacements', () => {
                const input = 'Line one\nPBUH\nLine two';
                expect(replaceSalutationsWithSymbol(input)).toEqual('Line one\nﷺ\nLine two');
            });

            it('should clean up -ﷺ- to just ﷺ', () => {
                expect(replaceSalutationsWithSymbol('The Prophet -ﷺ- said')).toEqual('The Prophet ﷺ said');
            });

            it('should handle commas around salutation', () => {
                expect(replaceSalutationsWithSymbol('The Prophet, PBUH, said')).toEqual('The Prophet ﷺ said');
            });

            it('should handle empty string', () => {
                expect(replaceSalutationsWithSymbol('')).toEqual('');
            });
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

    describe('removeArabicPrefixes', () => {
        it('should remove al- from beginning only', () => {
            expect(removeArabicPrefixes('al-Bukharial-Ka')).toEqual('Bukharial-Ka');
        });

        it('should remove Al- from beginning only (case insensitive)', () => {
            expect(removeArabicPrefixes('Al-BukhariAl-Ka')).toEqual('BukhariAl-Ka');
        });

        it('should remove l- from prefix only', () => {
            expect(removeArabicPrefixes('Jarḥ wa ʾl-Taʿdīl-xyz')).toEqual('Jarḥ ʾTaʿdīxyz');
        });

        it('should remove fī', () => {
            expect(removeArabicPrefixes('Asma fī qiyāsfīk')).toEqual('Asma qiyāsfīk');
        });

        it('should remove wa', () => {
            expect(removeArabicPrefixes('Asma wa sifaat wa-khayr')).toEqual('Asma sifaat khayr');
        });

        it('should remove ʿalá', () => {
            expect(removeArabicPrefixes('Fiqh ʿalá Husna')).toEqual('Fiqh Husna');
        });

        it('should remove ʿan', () => {
            expect(removeArabicPrefixes('Fiqh ʿan Husna muʿanan')).toEqual('Fiqh Husna muʿanan');
        });

        it('should remove b.', () => {
            expect(removeArabicPrefixes('Ibn Abi b. Husna')).toEqual('Ibn Abi Husna');
        });

        it('should remove bi-', () => {
            expect(removeArabicPrefixes('Ibn Abi b. bi-Husna')).toEqual('Ibn Abi Husna');
        });

        it('should remove li-', () => {
            expect(removeArabicPrefixes('Ibn Abi b. li-Husna')).toEqual('Ibn Abi Husna');
        });
    });
});
