# Table of Contents

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/4a00f7dd-3a49-4d59-a2ff-43c89e22d650) ![GitHub](https://img.shields.io/github/license/ragaeeb/bitaboom) ![npm](https://img.shields.io/npm/v/bitaboom) ![npm](https://img.shields.io/npm/dm/bitaboom) ![GitHub issues](https://img.shields.io/github/issues/ragaeeb/bitaboom) ![GitHub stars](https://img.shields.io/github/stars/ragaeeb/bitaboom?style=social) ![GitHub Release](https://img.shields.io/github/v/release/ragaeeb/bitaboom) [![codecov](https://codecov.io/gh/ragaeeb/bitaboom/graph/badge.svg?token=7Z3E38HXCD)](https://codecov.io/gh/ragaeeb/bitaboom) [![Size](https://deno.bundlejs.com/badge?q=bitaboom@1.0.0&badge=detailed)](https://bundlejs.com/?q=bitaboom%401.0.0) ![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)

# Bitaboom - A String Utilities Library

Bitaboom is a NodeJS string utility library written in TypeScript, designed to provide a collection of helpful string manipulation functions. It supports the latest ESNext features and is tested using Vitest.

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

### Arabic Functions

#### normalizeAlifVariants(text: string): string

Description: Simplifies all forms of 'alif' (أ, إ, and آ) to the basic 'ا'.

```typescript
normalizeAlifVariants('إلى آفاق'); // Output: 'الى افاق'
```

#### stripDiacritics(text: string): string

Description: Removes Arabic diacritics (tashkeel) and the tatweel (elongation) character.

```typescript
stripDiacritics('مُحَمَّد'); // Output: 'محمد'
```

#### replaceTaMarbutahWithHa(text: string): string

Description: Replaces the 'ta marbutah' (ة) character with 'ha' (ه).

```typescript
replaceTaMarbutahWithHa('مدرسة'); // Output: 'مدرسه'
```

#### stripZeroWidthCharacters(text: string): string

Description: Removes zero-width joiners (ZWJ) and other zero-width characters.

```typescript
stripZeroWidthCharacters('يَخْلُوَ\u200B'); // Output: 'يَخْلُوَ'
```

#### replaceAlifMaqsurahWithYa(text: string): string

Description: Replaces the 'alif maqsurah' (ى) character with the regular 'ya' (ي).

```typescript
replaceAlifMaqsurahWithYa('عيسى'); // Output: 'عيسي'
```

#### replaceEnglishPunctuationWithArabic(text: string): string

Description: Replaces English punctuation with their Arabic equivalents.

```typescript
replaceEnglishPunctuationWithArabic('Hello?'); // Output: 'Hello؟'
```

#### stripBoldStyling(text: string): string

Description: Removes bold styling from the text.

```typescript
stripBoldStyling('𝘀𝘁𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀'); // Output: 'stipulations'
```

#### stripItalicsStyling(text: string): string

Description: Removes italicized characters by replacing them with normal counterparts.

```typescript
stripItalicsStyling('𝘪𝘵𝘢𝘭𝘪𝘤𝘪𝘻𝘦𝘥'); // Output: 'italicized'
```
