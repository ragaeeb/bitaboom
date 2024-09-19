# Table of Contents

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650) ![GitHub](https://img.shields.io/github/license/ragaeeb/bitaboom) ![npm](https://img.shields.io/npm/v/bitaboom) ![npm](https://img.shields.io/npm/dm/bitaboom) ![GitHub issues](https://img.shields.io/github/issues/ragaeeb/bitaboom) ![GitHub stars](https://img.shields.io/github/stars/ragaeeb/bitaboom?style=social) ![GitHub Release](https://img.shields.io/github/v/release/ragaeeb/bitaboom) [![codecov](https://codecov.io/gh/ragaeeb/bitaboom/graph/badge.svg?token=7Z3E38HXCD)](https://codecov.io/gh/ragaeeb/bitaboom) [![Size](https://deno.bundlejs.com/badge?q=bitaboom@1.0.0&badge=detailed)](https://bundlejs.com/?q=bitaboom%401.0.0) ![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)

# Bitaboom - A String Utilities Library

Bitaboom is a NodeJS string utility library written in TypeScript, designed to provide a collection of helpful string manipulation functions. It supports the latest ESNext features and is tested using Vitest.

## Demo

(https://ragaeeb.github.io/bitaboom/)[Demo]

## Installation

To install Bitaboom, use npm or yarn:

```bash
npm install bitaboom
# or
yarn add bitaboom
# or
pnpm i bitaboom
```

## Usage

Import the library into your project:

```typescript
import { functionName } from 'bitaboom';
```

Use any function from the API in your code:

```typescript
const result = functionName('inputString');
console.log(result);
```

## Available Functions

### `addSpaceBeforeAndAfterPunctuation`

Adds spaces before and after punctuation marks except in specific cases like quoted text.

#### Example:

```javascript
addSpaceBeforeAndAfterPunctuation('Text,word');
// Output: 'Text, word'
```

---

### `addSpaceBetweenArabicTextAndNumbers`

Inserts spaces between Arabic text and numbers.

#### Example:

```javascript
addSpaceBetweenArabicTextAndNumbers('الآية37');
// Output: 'الآية 37'
```

---

### `applySmartQuotes`

Turns regular double quotes into smart quotes and fixes any incorrect starting quotes.

#### Example:

```javascript
applySmartQuotes('The "quick brown" fox');
// Output: 'The “quick brown” fox'
```

---

### `cleanExtremeArabicUnderscores`

Removes extreme Arabic underscores (ـ) from the beginning or end of lines. It does not affect Hijri dates or certain Arabic terms.

#### Example:

```javascript
cleanExtremeArabicUnderscores('ـThis is a textـ');
// Output: "This is a text"
```

---

### `cleanJunkFromText`

Cleans unnecessary spaces and punctuation from text.

#### Example:

```javascript
cleanJunkFromText('Some text !@#\nAnother line.');
// Output: 'Some text\nAnother line.'
```

### `cleanLiteralNewLines`

Replaces literal new line characters (`\n`) with actual line breaks.

#### Example:

```javascript
cleanLiteralNewLines('A\nB');
// Output: 'A\nB'
```

---

### `cleanMultilines`

Removes trailing spaces from each line in a multiline string.

#### Example:

```javascript
cleanMultilines(' This is a line   \nAnother line   ');
// Output: 'This is a line\nAnother line'
```

---

### `cleanSymbolsAndPartReferences`

Removes various symbols, part references, and numerical markers from the text.

#### Example:

```javascript
cleanSymbolsAndPartReferences('(1) (2/3)');
// Output: ''
```

---

### `cleanTrailingPageNumbers`

Removes trailing page numbers formatted as `-[46]-` from the text.

#### Example:

```javascript
cleanTrailingPageNumbers('This is some -[46]- text');
// Output: 'This is some text'
```

---

### `convertUrduSymbolsToArabic`

Converts Urdu symbols like 'ھ' and 'ی' to their Arabic equivalents 'ه' and 'ي'.

#### Example:

```javascript
convertUrduSymbolsToArabic('ھذا');
// Output: 'هذا'
```

---

### `extractInitials`

Extracts initials from the input string, typically for names or titles.

#### Example:

```javascript
extractInitials('Nayl al-Awtar');
// Output: 'NA'
```

### `fixTrailingWow`

Corrects unnecessary trailing "و" in greetings or phrases.

#### Example:

```javascript
fixTrailingWow('السلام عليكم و رحمة');
// Output: 'السلام عليكم ورحمة'
```

---

### `insertLineBreaksAfterPunctuation`

Adds line breaks after punctuation marks such as periods, exclamation points, and question marks.

#### Example:

```javascript
insertLineBreaksAfterPunctuation('Text.');
// Output: 'Text.
'
```

---

### `isJsonStructureValid`

Checks if a given string resembles a JSON object with numeric or quoted keys and values that are single or double quoted. Useful for detecting malformed JSON-like structures that can be fixed.

#### Example:

```javascript
isJsonStructureValid("{10: 'abc', 'key': 'value'}");
// Output: true
```

---

### `isOnlyPunctuation`

Checks if the input string consists only of punctuation characters.

#### Example:

```javascript
isOnlyPunctuation('!?');
// Output: true
```

---

### `normalizeAlifVariants`

Simplifies all forms of 'alif' (أ, إ, and آ) to the basic 'ا'.

#### Example:

```javascript
normalizeAlifVariants('أنا إلى الآفاق');
// Output: 'انا الى الافاق'
```

### `normalizeApostrophes`

Replaces various apostrophe characters like ‛, ’, and ‘ with the standard apostrophe (').

#### Example:

```javascript
normalizeApostrophes('‛ulama’ al-su‘');
// Output: "'ulama' al-su'"
```

---

### `normalizeArabicPrefixesToAl`

Replaces common Arabic prefixes like 'Al-', 'Ar-', 'Ash-', etc., with 'al-' in the text. It handles different variations of prefixes but does not modify cases where the second word does not start with 'S'.

#### Example:

```javascript
normalizeArabicPrefixesToAl('Ash-Shafiee');
// Output: 'al-Shafiee'
```

---

### `normalizeDoubleApostrophes`

Removes double occurrences of Arabic apostrophes such as ʿʿ or ʾʾ.

#### Example:

```javascript
normalizeDoubleApostrophes('ʿulamāʾʾ');
// Output: 'ʿulamāʾ'
```

---

### `normalizeJsonSyntax`

Converts a string that resembles JSON but has numeric keys and single-quoted values into valid JSON format. The function replaces numeric keys with quoted numeric keys and ensures all values are double-quoted, as required by JSON.

#### Example:

```javascript
normalizeJsonSyntax("{10: 'abc', 20: 'def'}");
// Output: '{"10": "abc", "20": "def"}'
```

---

### `normalizeTransliteratedEnglish`

Simplifies English transliterations by removing diacritics, apostrophes, and common prefixes.

#### Example:

```javascript
normalizeTransliteratedEnglish('Al-Jadwāl');
// Output: 'Jadwal'
```

---

### `normalize`

Normalizes the text by removing diacritics, apostrophes, and dashes.

#### Example:

```javascript
normalize('Al-Jadwāl');
// Output: 'AlJadwal'
```

---

### `removeArabicPrefixes`

Strips common Arabic prefixes like 'al-', 'bi-', 'fī', 'wa-', etc., from the beginning of words.

#### Example:

```javascript
removeArabicPrefixes('al-Bukhari');
// Output: 'Bukhari'
```

---

### `removeDeathYear`

Removes death year references like "(d. 390H)" and "[d. 100h]" from the text.

#### Example:

```javascript
removeDeathYear('Sufyān ibn ‘Uyaynah (d. 198h)');
// Output: 'Sufyān ibn ‘Uyaynah'
```

---

### `removeNonIndexSignatures`

Removes single-digit numbers and dashes from Arabic text but preserves numbers used as indexes.

#### Example:

```javascript
removeNonIndexSignatures('الورقه 3 المصدر');
// Output: 'الورقه المصدر'
```

---

### `removeNumbersAndDashes`

Removes numeric digits and dashes from the text.

#### Example:

```javascript
removeNumbersAndDashes('ABC 123-Xyz');
// Output: 'ABC Xyz'
```

---

### `removeSingleDigitReferences`

Removes single digit references like (1), «2», [3] from the text.

#### Example:

```javascript
removeSingleDigitReferences('Ref (1), Ref «2», Ref [3]');
// Output: 'Ref , Ref , Ref '
```

---

### `removeSingularCodes`

Removes Arabic letters or Arabic-Indic numerals enclosed in square brackets or parentheses.

#### Example:

```javascript
removeSingularCodes('[س]');
// Output: ''
```

---

### `removeSolitaryArabicLetters`

Removes solitary Arabic letters unless they are 'ha' used in Hijri years.

#### Example:

```javascript
removeSolitaryArabicLetters('ب ا الكلمات ت');
// Output: 'ا الكلمات'
```

---

### `removeUrls`

Removes URLs from the text.

#### Example:

```javascript
removeUrls('Visit https://example.com');
// Output: 'Visit '
```

### `replaceAlifMaqsurah`

Replaces 'alif maqsurah' (ى) with 'ya' (ي).

#### Example:

```javascript
replaceAlifMaqsurah('رؤيى');
// Output: 'رؤيي'
```

---

### `replaceEnglishPunctuationWithArabic`

Replaces English punctuation marks (e.g., ? and ;) with their Arabic equivalents.

#### Example:

```javascript
replaceEnglishPunctuationWithArabic('This; and, that?');
// Output: 'This؛and، that؟'
```

---

### `replaceLineBreaksWithSpaces`

Replaces consecutive line breaks and whitespace characters with a single space.

#### Example:

```javascript
replaceLineBreaksWithSpaces('a\nb');
// Output: 'a b'
```

---

### `replaceSalutationsWithSymbol`

Replaces common salutations like "sallahu alayhi wasallam" with "ﷺ". Handles variations like 'peace and blessings be upon him'.

#### Example:

```javascript
replaceSalutationsWithSymbol('Then Muḥammad (sallahu alayhi wasallam)');
// Output: 'Then Muḥammad ﷺ'
```

---

### `replaceTaMarbutahWithHa`

Replaces 'ta marbutah' (ة) with 'ha' (ه).

#### Example:

```javascript
replaceTaMarbutahWithHa('مدرسة');
// Output: 'مدرسه'
```

---

### `splitByQuotes`

Splits a string by spaces but keeps quoted substrings intact. Substrings enclosed in double quotes are treated as a single part.

#### Example:

```javascript
splitByQuotes('"This is" "a part of the" "string and"');
// Output: ["This is", "a part of the", "string and"]
```

### `stripAllDigits`

Removes all numeric digits from the text.

#### Example:

```javascript
stripAllDigits('abc123');
// Output: 'abc'
```

---

### `stripDiacritics`

Removes Arabic diacritics (tashkeel) and the elongation character (ـ).

#### Example:

```javascript
stripDiacritics('مُحَمَّدٌ');
// Output: 'محمد'
```

---

### `stripEnglishCharactersAndSymbols`

Removes English letters and symbols from the text.

#### Example:

```javascript
stripEnglishCharactersAndSymbols('أحب & لنفسي');
// Output: 'أحب   لنفسي'
```

---

### `stripZeroWidthCharacters`

Removes zero-width characters like ZWJ and other invisible characters.

#### Example:

```javascript
stripZeroWidthCharacters('يَخْلُوَ ‏.');
// Output: 'يَخْلُوَ .'
```

---
