<script lang="ts">
import {
    addSpaceBeforeAndAfterPunctuation,
    addSpaceBetweenArabicTextAndNumbers,
    applySmartQuotes,
    arabicNumeralToNumber,
    cleanExtremeArabicUnderscores,
    cleanLiteralNewLines,
    cleanMultilines,
    cleanSpacesBeforePeriod,
    cleanSymbolsAndPartReferences,
    cleanTrailingPageNumbers,
    condenseAsterisks,
    condenseColons,
    condenseDashes,
    condenseEllipsis,
    condensePeriods,
    condenseUnderscores,
    convertUrduSymbolsToArabic,
    doubleToSingleBrackets,
    ensureSpaceBeforeBrackets,
    ensureSpaceBeforeQuotes,
    escapeRegex,
    extractInitials,
    findLastPunctuation,
    fixBracketTypos,
    fixCurlyBraces,
    fixMismatchedQuotationMarks,
    fixTrailingWow,
    formatStringBySentence,
    getArabicScore,
    hasWordInSingleLine,
    insertLineBreaksAfterPunctuation,
    isAllUppercase,
    isBalanced,
    isJsonStructureValid,
    isOnlyPunctuation,
    makeDiacriticInsensitive,
    makeDiacriticInsensitiveRegex,
    normalize,
    normalizeArabicPrefixesToAl,
    normalizeDoubleApostrophes,
    normalizeJsonSyntax,
    normalizeSlashInReferences,
    normalizeSpaces,
    normalizeTransliteratedEnglish,
    parsePageRanges,
    preformatArabicText,
    reduceMultilineBreaksToDouble,
    reduceMultilineBreaksToSingle,
    removeAllTags,
    removeDeathYear,
    removeMarkdownFormatting,
    removeNonIndexSignatures,
    removeArabicPrefixes,
    removeNumbersAndDashes,
    removeRedundantPunctuation,
    removeSingleDigitReferences,
    removeSingularCodes,
    removeSolitaryArabicLetters,
    removeSpaceInsideBrackets,
    removeUrls,
    replaceDoubleBracketsWithArrows,
    replaceEnglishPunctuationWithArabic,
    replaceLineBreaksWithSpaces,
    replaceSalutationsWithSymbol,
    splitByQuotes,
    stripAllDigits,
    stripBoldStyling,
    stripItalicsStyling,
    stripStyling,
    toTitleCase,
    trimSpaceInsideQuotes,
    truncate,
    truncateMiddle,
    unescapeSpaces,
} from 'bitaboom';
import libraryPackage from '../../package.json';
import demoPackage from '../package.json';

type DemoFunction = {
    name: string;
    description: string;
    placeholder: string;
    rtl?: boolean;
    formatter: (input: string) => unknown;
};

type FunctionGroup = {
    title: string;
    description: string;
    items: DemoFunction[];
};

const functionGroups: FunctionGroup[] = [
    {
        title: 'Arabic helpers',
        description: 'String utilities that understand Arabic script and punctuation.',
        items: [
            {
                name: 'arabicNumeralToNumber',
                description: 'Convert Arabic-Indic numerals to a JavaScript number.',
                placeholder: '١٢٣',
                rtl: true,
                formatter: (input) => arabicNumeralToNumber(input),
            },
            {
                name: 'cleanExtremeArabicUnderscores',
                description: 'Remove decorative tatweel/underscore padding at line edges.',
                placeholder: 'ـــالحمد لله رب العالمينـــ',
                rtl: true,
                formatter: cleanExtremeArabicUnderscores,
            },
            {
                name: 'convertUrduSymbolsToArabic',
                description: 'Map Urdu glyph variants (ھ، ی) to Arabic equivalents.',
                placeholder: 'ھذا یوم جمیل',
                rtl: true,
                formatter: convertUrduSymbolsToArabic,
            },
            {
                name: 'getArabicScore',
                description: 'Return the ratio of Arabic letters to total non-digit characters.',
                placeholder: 'مرحبا Hello 123',
                rtl: true,
                formatter: (input) => getArabicScore(input),
            },
            {
                name: 'findLastPunctuation',
                description: 'Find the last punctuation mark index in a string.',
                placeholder: 'مرحبا بالعالم! كيف الحال؟',
                rtl: true,
                formatter: (input) => findLastPunctuation(input),
            },
            {
                name: 'fixTrailingWow',
                description: 'Collapse stray “و” separators in common greetings.',
                placeholder: 'السلام عليكم و رحمة الله',
                rtl: true,
                formatter: fixTrailingWow,
            },
            {
                name: 'addSpaceBetweenArabicTextAndNumbers',
                description: 'Insert a space between Arabic text segments and numbers.',
                placeholder: 'الآية37 في الصفحة2',
                rtl: true,
                formatter: addSpaceBetweenArabicTextAndNumbers,
            },
            {
                name: 'removeNonIndexSignatures',
                description: 'Remove non-index digits and stray dashes between Arabic text.',
                placeholder: 'وهب 3 وقال - في الكتاب',
                rtl: true,
                formatter: removeNonIndexSignatures,
            },
            {
                name: 'removeSingularCodes',
                description: 'Strip single Arabic letters or digits in ()/[]/«».',
                placeholder: 'قال [س] و (٣) في النص',
                rtl: true,
                formatter: removeSingularCodes,
            },
            {
                name: 'removeSolitaryArabicLetters',
                description: 'Remove isolated Arabic letters (excluding Hijri ه).',
                placeholder: 'ب ا الكلمات ت',
                rtl: true,
                formatter: removeSolitaryArabicLetters,
            },
            {
                name: 'replaceEnglishPunctuationWithArabic',
                description: 'Replace ASCII punctuation with Arabic equivalents.',
                placeholder: 'لماذا? هذا مهم; جدا, نعم',
                rtl: true,
                formatter: replaceEnglishPunctuationWithArabic,
            },
        ],
    },
    {
        title: 'Cleaning & tolerant matching',
        description: 'Sanitization helpers for markdown, URLs, digits, and tolerant matching.',
        items: [
            {
                name: 'escapeRegex',
                description: 'Escape special characters for safe regex creation.',
                placeholder: 'Find (this) + [that]',
                formatter: escapeRegex,
            },
            {
                name: 'makeDiacriticInsensitiveRegex',
                description: 'Build a regex tolerant of Arabic diacritics and variants.',
                placeholder: 'أنا إلى الآفاق',
                rtl: true,
                formatter: (input) => makeDiacriticInsensitiveRegex(input),
            },
            {
                name: 'makeDiacriticInsensitive',
                description: 'Create a diacritic-insensitive pattern string.',
                placeholder: 'أنا إلى الآفاق',
                rtl: true,
                formatter: makeDiacriticInsensitive,
            },
            {
                name: 'removeAllTags',
                description: 'Strip HTML/XML tags from text.',
                placeholder: '<p>Hello <strong>world</strong></p>',
                formatter: removeAllTags,
            },
            {
                name: 'cleanSymbolsAndPartReferences',
                description: 'Remove part markers, ornaments, and numeric references.',
                placeholder: '﴿الجزء ٢﴾ ج١ ـ ٣',
                rtl: true,
                formatter: cleanSymbolsAndPartReferences,
            },
            {
                name: 'cleanTrailingPageNumbers',
                description: 'Drop trailing -[123]- style page markers.',
                placeholder: 'هذا نص -[123]-',
                rtl: true,
                formatter: cleanTrailingPageNumbers,
            },
            {
                name: 'replaceLineBreaksWithSpaces',
                description: 'Collapse whitespace and line breaks to single spaces.',
                placeholder: 'Line one\n\nLine two',
                formatter: replaceLineBreaksWithSpaces,
            },
            {
                name: 'stripAllDigits',
                description: 'Remove ASCII digits from the input.',
                placeholder: 'Version 2.0 لعام 2024',
                formatter: stripAllDigits,
            },
            {
                name: 'removeDeathYear',
                description: 'Strip (d. ####H) style death-year mentions.',
                placeholder: 'الإمام (d. 1444H) قال',
                rtl: true,
                formatter: removeDeathYear,
            },
            {
                name: 'removeNumbersAndDashes',
                description: 'Remove all digits and dash characters.',
                placeholder: 'صفحة 12-13 في 2024',
                rtl: true,
                formatter: removeNumbersAndDashes,
            },
            {
                name: 'removeSingleDigitReferences',
                description: 'Delete single digit markers like (1), [2], «3».',
                placeholder: 'هذا نص (1) [2] «3»',
                rtl: true,
                formatter: removeSingleDigitReferences,
            },
            {
                name: 'removeUrls',
                description: 'Remove http(s) URLs from text.',
                placeholder: 'Read more at https://example.com الآن',
                rtl: true,
                formatter: removeUrls,
            },
            {
                name: 'removeMarkdownFormatting',
                description: 'Drop markdown bold/italic/link/list syntax.',
                placeholder: '**Bold** _italic_ [link](https://example.com)',
                formatter: removeMarkdownFormatting,
            },
            {
                name: 'truncate',
                description: 'Trim strings to a maximum length with an ellipsis.',
                placeholder: 'This is a long sentence that will be cut to size.',
                formatter: (input) => truncate(input, 24),
            },
            {
                name: 'truncateMiddle',
                description: 'Truncate the middle while preserving start/end segments.',
                placeholder: 'the quick brown fox jumps over the lazy dog',
                formatter: (input) => truncateMiddle(input, 40, 12),
            },
            {
                name: 'unescapeSpaces',
                description: 'Convert escaped spaces (\\ ) back to regular spaces.',
                placeholder: 'Hello\\ world\\ ',
                formatter: unescapeSpaces,
            },
        ],
    },
    {
        title: 'Formatting & typography',
        description: 'Spacing, punctuation, and typography normalizers.',
        items: [
            {
                name: 'insertLineBreaksAfterPunctuation',
                description: 'Add line breaks after . ! ? and Arabic ؟ punctuation.',
                placeholder: 'Hello world! How are you? Great.',
                formatter: insertLineBreaksAfterPunctuation,
            },
            {
                name: 'addSpaceBeforeAndAfterPunctuation',
                description: 'Normalize spacing around punctuation while respecting quotes.',
                placeholder: 'مرحبا،كيف الحال؟',
                rtl: true,
                formatter: addSpaceBeforeAndAfterPunctuation,
            },
            {
                name: 'applySmartQuotes',
                description: 'Convert straight quotes to smart quotes.',
                placeholder: '"Hello" \'world\'',
                formatter: applySmartQuotes,
            },
            {
                name: 'cleanLiteralNewLines',
                description: 'Replace literal \\n and \\r sequences with real newlines.',
                placeholder: 'Line one\\nLine two\\r\\nLine three',
                formatter: cleanLiteralNewLines,
            },
            {
                name: 'cleanMultilines',
                description: 'Trim trailing spaces at the end of each line.',
                placeholder: 'Line one   \nLine two   ',
                formatter: cleanMultilines,
            },
            {
                name: 'hasWordInSingleLine',
                description: 'Detect whether a line contains a single standalone word.',
                placeholder: 'Word\nSecond line',
                formatter: (input) => hasWordInSingleLine(input),
            },
            {
                name: 'isOnlyPunctuation',
                description: 'Check if a string consists solely of punctuation/digits.',
                placeholder: '؟؟؟!!!',
                rtl: true,
                formatter: (input) => isOnlyPunctuation(input),
            },
            {
                name: 'cleanSpacesBeforePeriod',
                description: 'Remove spaces immediately before punctuation marks.',
                placeholder: 'Hello . World ? ',
                formatter: cleanSpacesBeforePeriod,
            },
            {
                name: 'condenseAsterisks',
                description: 'Collapse multiple asterisks into a single *.',
                placeholder: 'Look **** here',
                formatter: condenseAsterisks,
            },
            {
                name: 'condenseColons',
                description: 'Normalize colon clusters like .:. into a single colon.',
                placeholder: '10::30',
                formatter: condenseColons,
            },
            {
                name: 'condenseDashes',
                description: 'Reduce consecutive dashes to a single dash.',
                placeholder: 'well---known',
                formatter: condenseDashes,
            },
            {
                name: 'condenseEllipsis',
                description: 'Convert runs of periods into a single ellipsis.',
                placeholder: 'Wait.... what',
                formatter: condenseEllipsis,
            },
            {
                name: 'reduceMultilineBreaksToDouble',
                description: 'Limit blank lines to at most two newlines.',
                placeholder: 'line1\n\n\n\nline2',
                formatter: reduceMultilineBreaksToDouble,
            },
            {
                name: 'reduceMultilineBreaksToSingle',
                description: 'Collapse multiple blank lines to a single newline.',
                placeholder: 'line1\n\n\nline2',
                formatter: reduceMultilineBreaksToSingle,
            },
            {
                name: 'condensePeriods',
                description: 'Normalize spaced dot sequences into ellipsis.',
                placeholder: '. . .',
                formatter: condensePeriods,
            },
            {
                name: 'condenseUnderscores',
                description: 'Collapse repeated underscores and tatweel runs.',
                placeholder: 'هذا____ نص',
                rtl: true,
                formatter: condenseUnderscores,
            },
            {
                name: 'doubleToSingleBrackets',
                description: 'Replace doubled brackets with single ones.',
                placeholder: '((text)) [[note]]',
                formatter: doubleToSingleBrackets,
            },
            {
                name: 'ensureSpaceBeforeBrackets',
                description: 'Ensure a single space before bracketed notes.',
                placeholder: 'word(aside)',
                formatter: ensureSpaceBeforeBrackets,
            },
            {
                name: 'ensureSpaceBeforeQuotes',
                description: 'Ensure spacing before Arabic guillemets.',
                placeholder: 'قال«مرحبا»',
                rtl: true,
                formatter: ensureSpaceBeforeQuotes,
            },
            {
                name: 'fixBracketTypos',
                description: 'Repair mismatched bracket pairs and typos.',
                placeholder: '([text))',
                formatter: fixBracketTypos,
            },
            {
                name: 'fixCurlyBraces',
                description: 'Normalize mismatched curly brace pairs.',
                placeholder: '{text}}',
                formatter: fixCurlyBraces,
            },
            {
                name: 'fixMismatchedQuotationMarks',
                description: 'Fix malformed Arabic guillemets and parentheses combos.',
                placeholder: '«مرحبا")',
                rtl: true,
                formatter: fixMismatchedQuotationMarks,
            },
            {
                name: 'formatStringBySentence',
                description: 'Reflow text by sentence while keeping numbered footnotes.',
                placeholder: '1- First sentence. Second sentence! ثالثة؟',
                rtl: true,
                formatter: formatStringBySentence,
            },
            {
                name: 'isAllUppercase',
                description: 'Detect whether the text is fully uppercase.',
                placeholder: 'THIS IS A TITLE',
                formatter: (input) => isAllUppercase(input),
            },
            {
                name: 'normalizeSlashInReferences',
                description: 'Normalize spaced fractions like 127 / 11 to 127/11.',
                placeholder: 'بِسْمِ اللَّهِ 127 / 11',
                rtl: true,
                formatter: normalizeSlashInReferences,
            },
            {
                name: 'normalizeSpaces',
                description: 'Collapse extra spaces and tabs to single spaces.',
                placeholder: 'This    has    many spaces',
                formatter: normalizeSpaces,
            },
            {
                name: 'removeRedundantPunctuation',
                description: 'Remove redundant punctuation after ؟ and ! marks.',
                placeholder: 'ما هذا؟؟!!',
                rtl: true,
                formatter: removeRedundantPunctuation,
            },
            {
                name: 'removeSpaceInsideBrackets',
                description: 'Trim internal spaces inside brackets or parentheses.',
                placeholder: '( Fasting is during ) [ the ] winter.',
                formatter: removeSpaceInsideBrackets,
            },
            {
                name: 'replaceDoubleBracketsWithArrows',
                description: 'Turn double brackets into Arabic guillemets.',
                placeholder: '((text)) [[array]]',
                formatter: replaceDoubleBracketsWithArrows,
            },
            {
                name: 'stripBoldStyling',
                description: 'Remove bold Unicode stylization.',
                placeholder: '𝗢𝗳 𝗮𝗹𝗹 𝗯𝗼𝗹𝗱 𝘁𝗲𝘅𝘁',
                formatter: stripBoldStyling,
            },
            {
                name: 'stripItalicsStyling',
                description: 'Remove italic Unicode stylization.',
                placeholder: '𝘢𝘯𝘥 𝘪𝘵𝘢𝘭𝘪𝘤 𝘵𝘦𝘹𝘵',
                formatter: stripItalicsStyling,
            },
            {
                name: 'stripStyling',
                description: 'Convenience combo of bold + italics stripping.',
                placeholder: '𝗢𝗳 𝗮𝗹𝗹 𝘀𝘁𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀 𝘢𝗻𝗱 𝘪𝘵𝘢𝘭𝘪𝘤𝘪𝘻𝘦𝘥 𝘁𝗲𝘅𝘁',
                formatter: stripStyling,
            },
            {
                name: 'toTitleCase',
                description: 'Convert strings to title case with Unicode support.',
                placeholder: 'the quick brown fox',
                formatter: toTitleCase,
            },
            {
                name: 'trimSpaceInsideQuotes',
                description: 'Remove spaces immediately inside quotes.',
                placeholder: '“ Fasting is during the winter. ”',
                formatter: trimSpaceInsideQuotes,
            },
        ],
    },
    {
        title: 'Parsing helpers',
        description: 'JSON normalization, quote splitting, and range parsing.',
        items: [
            {
                name: 'normalizeJsonSyntax',
                description: 'Normalize JSON-like strings with numeric keys and single quotes.',
                placeholder: "{10: 'abc', 20: 'def'}",
                formatter: normalizeJsonSyntax,
            },
            {
                name: 'isJsonStructureValid',
                description: 'Detect JSON-like key/value blobs that can be normalized.',
                placeholder: "{10: 'abc', 'key': 'value'}",
                formatter: (input) => isJsonStructureValid(input),
            },
            {
                name: 'splitByQuotes',
                description: 'Split by spaces while preserving quoted substrings.',
                placeholder: '"This is" "a part" of string',
                formatter: (input) => splitByQuotes(input),
            },
            {
                name: 'isBalanced',
                description: 'Ensure quotes and brackets are balanced and properly nested.',
                placeholder: 'He said "Hello (world)!"',
                formatter: (input) => isBalanced(input),
            },
            {
                name: 'parsePageRanges',
                description: 'Expand range/list strings into numeric arrays.',
                placeholder: '1-5',
                formatter: (input) => parsePageRanges(input),
            },
        ],
    },
    {
        title: 'Transliteration',
        description: 'Normalize transliterated Arabic text and salutations.',
        items: [
            {
                name: 'normalizeArabicPrefixesToAl',
                description: 'Normalize Arabic definite article prefixes to al-.',
                placeholder: 'wa-ash-shams al-qamar',
                formatter: normalizeArabicPrefixesToAl,
            },
            {
                name: 'normalizeDoubleApostrophes',
                description: 'Collapse duplicated Arabic apostrophes in transliteration.',
                placeholder: 'ʿʿabd al-ʿʿaziz',
                formatter: normalizeDoubleApostrophes,
            },
            {
                name: 'replaceSalutationsWithSymbol',
                description: 'Replace salutations like “sallallahu alayhi wasallam” with ﷺ.',
                placeholder: 'sallallahu alayhi wasallam',
                formatter: replaceSalutationsWithSymbol,
            },
            {
                name: 'normalize',
                description: 'Strip diacritics, apostrophes, and dashes from transliteration.',
                placeholder: 'al-ḥadīth',
                formatter: normalize,
            },
            {
                name: 'removeArabicPrefixes',
                description: 'Remove transliteration prefixes like al-, wa-, bi-, li-.',
                placeholder: 'al-quran wa-rahma',
                formatter: removeArabicPrefixes,
            },
            {
                name: 'normalizeTransliteratedEnglish',
                description: 'Combine prefix removal + diacritic stripping.',
                placeholder: 'al-ḥadīth wa-l-ḥaqq',
                formatter: normalizeTransliteratedEnglish,
            },
            {
                name: 'extractInitials',
                description: 'Extract initials from up to two transliterated words.',
                placeholder: 'Muhammad ibn Abdullah',
                formatter: extractInitials,
            },
        ],
    },
    {
        title: 'Preformatting pipeline',
        description: 'Single-pass formatter optimized for large Arabic text.',
        items: [
            {
                name: 'preformatArabicText',
                description: 'High-performance Arabic preformatting pipeline.',
                placeholder: 'بِسْمِ  اللَّهِ ( الرَّحْمَنِ ) 127 / 11 قَالَ ...',
                rtl: true,
                formatter: (input) => preformatArabicText(input),
            },
        ],
    },
];

const allFunctions = functionGroups.flatMap((group) => group.items);

    let selectedFunction: DemoFunction = allFunctions[0];
    let inputValue = selectedFunction.placeholder;
    // biome-ignore lint/correctness/noUnusedVariables
    let errorMessage = '';

    // biome-ignore lint/correctness/noUnusedVariables
    const selectFunction = (fn: DemoFunction) => {
        selectedFunction = fn;
        inputValue = fn.placeholder;
        errorMessage = '';
    };

const formatResult = (result: unknown) => {
    if (typeof result === 'string') {
        return result;
    }
    if (result instanceof RegExp) {
        return result.toString();
    }
    if (Array.isArray(result) || (result && typeof result === 'object')) {
        return JSON.stringify(result, null, 2);
    }
    return String(result);
};

    // biome-ignore lint/correctness/noUnusedVariables
    const handleFormat = () => {
        errorMessage = '';
        try {
            const result = selectedFunction.formatter(inputValue);
            inputValue = formatResult(result);
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unable to format this input.';
    }
};

    // biome-ignore lint/correctness/noUnusedVariables
    const bitaboomVersion = (demoPackage.dependencies?.bitaboom ?? '').replace(/^\^/, '');
    // biome-ignore lint/correctness/noUnusedVariables
    const libraryAuthor = typeof libraryPackage.author === 'string' ? libraryPackage.author : 'Bitaboom';
</script>

<svelte:head>
    <title>Bitaboom Demo</title>
</svelte:head>

<div class="app-shell">
    <aside class="sidebar">
        <div class="sidebar-header">
            <p class="eyebrow">Demo</p>
            <h1>Bitaboom</h1>
            <p class="sidebar-description">
                Browse every helper exported by the library and try it instantly.
            </p>
        </div>
        <nav class="sidebar-nav">
            {#each functionGroups as group}
                <div class="nav-group">
                    <p class="nav-title">{group.title}</p>
                    <p class="nav-description">{group.description}</p>
                    <ul>
                        {#each group.items as item}
                            <li>
                                <button
                                    class:active={selectedFunction.name === item.name}
                                    type="button"
                                    on:click={() => selectFunction(item)}
                                >
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </nav>
    </aside>

    <main class="content">
        <section class="hero">
            <p class="eyebrow">TypeScript-first string utilities</p>
            <h2>Arabic-aware formatting for publishers and editorial teams.</h2>
            <p>
                Bitaboom is a toolkit for Arabic and bilingual publishing workflows: it understands
                diacritics, punctuation, OCR artifacts, transliteration cleanup, and the tedious
                spacing rules that show up in manuscripts and scanned texts.
            </p>
            <p class="hero-meta">
                ESNext, Bun-native, and fully documented.
            </p>
        </section>

        <section class="function-card">
            <div class="function-header">
                <div>
                    <p class="function-label">Selected function</p>
                    <h3>{selectedFunction.name}</h3>
                    <p class="function-description">{selectedFunction.description}</p>
                </div>
                <div class="function-tags">
                    <span>{selectedFunction.rtl ? 'RTL-aware' : 'LTR / neutral'}</span>
                </div>
            </div>

            <label class="input-label" for="demo-input">Input</label>
            <textarea
                id="demo-input"
                bind:value={inputValue}
                dir={selectedFunction.rtl ? 'rtl' : 'ltr'}
                spellcheck="false"
                rows="8"
            ></textarea>

            <div class="actions">
                <button class="primary" type="button" on:click={handleFormat}>Format</button>
                <button type="button" class="secondary" on:click={() => (inputValue = selectedFunction.placeholder)}>
                    Reset sample
                </button>
            </div>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}
        </section>

        <footer class="app-footer">
            <div>
                Bitaboom demo · v{bitaboomVersion || 'unknown'}
            </div>
            <div>
                Author: {libraryAuthor}
            </div>
            <div>
                Live demo: <a href="https://bitaboom.surge.sh" target="_blank" rel="noreferrer">bitaboom.surge.sh</a>
            </div>
        </footer>
    </main>
</div>
