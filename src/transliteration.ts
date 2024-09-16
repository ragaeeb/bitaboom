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

export const normalize = (input: string) => {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/`|ʾ|ʿ|-/g, '');
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
