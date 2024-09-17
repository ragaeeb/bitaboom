import { reduceSpaces } from './formatting';

/**
 * should replace all the al-s in strings like Al-Rahman bar-Rahman becomes al-Rahman to al-Rahman bar-Rahman becomes al-Rahman.
 * should replace all the ash in strings like ash-Shafiee but not when the 2nd word does not start with a S
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const convertArabicPrefixesToAl = (text: string): string => {
    return text
        .replace(/(\b|\W)(Al |Al-|Ar-|As-|Adh-|Ad-|Ats-|Ath |Ath-|Az |Az-|az-|adh-|as-|ar-)/g, '$1al-')
        .replace(/(\b|\W)(Ash-S|ash-S)/g, '$1al-S')
        .replace(/al- (.+?)\b/g, 'al-$1');
};

/**
 * Corrects ʿ that is part of the target from having ʿ twice. Corrects words like ʿulamāʾʾ to ʿulamāʾ
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const condenseDoubleApostrophesToSingle = (text: string): string => {
    return text.replace(/ʿʿ/g, 'ʿ').replace(/ʾʾ/g, 'ʾ');
};

/**
 * Anything with "peace Muhammad s....m" replaces with the salutation. Then replaces texts that have comma between the salutation with just the salutation.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const fixSalutations = (text: string): string => {
    return text
        .replace(
            /\(peace be upon him\)|(Messenger of (Allah|Allāh)|Messenger|Prophet|Mu[hḥ]ammad) *\((s[^)]*m|peace[^)]*him|May[^)]*him|may[^)]*him)\)*/gi,
            '$1 ﷺ',
        )
        .replace(/,\s*ﷺ\s*,/g, ' ﷺ');
};

export const normalize = (input: string) => {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/`|ʾ|ʿ|-/g, '');
};

/**
 * Turns all apostrophe variations to the actual apostrophe character to simplify word substitutions.
 * @param {string} text - The input text to apply the rule to.
 * @returns {string} - The modified text after applying the rule.
 */
export const normalizeApostrophes = (text: string): string => {
    return text.replace(/‛|’|‘/g, "'");
};

export const stripPrefixes = (text: string): string => {
    return reduceSpaces(text.replace(/(\bal-|\bli-|\bbi-|\bfī|\bwa[-\s]+|\bl-|\bliʿl|\Bʿalá|\Bʿan|\bb\.)/gi, ''));
};

export const simplifyEnglish = (text: string): string => normalize(stripPrefixes(text));

export const getInitials = (fullName: string) => {
    const initials = simplifyEnglish(fullName)
        .trim()
        .split(/[ -]/)
        .slice(0, 2)
        .map((word) => {
            return word.charAt(0).toUpperCase();
        })
        .join('');
    return initials;
};
