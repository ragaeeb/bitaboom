<script lang="ts">
// biome-ignore lint/correctness/noUnusedImports: used in the Svelte template.
import libraryPackage from '../../package.json';
// biome-ignore lint/correctness/noUnusedImports: mockTexts is used in the Svelte template.
import { allFunctions, type DemoFunction, functionGroups, mockTexts } from './catalog';

const initialFunction = allFunctions.find((fn) => fn.name === 'preformatArabicText')!;
let selectedFunction = $state<DemoFunction>(initialFunction);
let inputValue = $state(initialFunction.sample);
// biome-ignore lint/style/useConst: updated by Svelte template bindings.
let search = $state('');
// biome-ignore lint/style/useConst: updated by Svelte template bindings.
let category = $state('All functions');
// biome-ignore lint/style/useConst: updated by Svelte template bindings.
let showWhitespace = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
let copyStatus = $state('');

const filteredGroups = $derived(
    functionGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (fn) =>
                    (category === 'All functions' || group.title === category) &&
                    `${fn.name} ${fn.description}`.toLowerCase().includes(search.trim().toLowerCase()),
            ),
        }))
        .filter((group) => group.items.length),
);
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const matchCount = $derived(filteredGroups.reduce((count, group) => count + group.items.length, 0));
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const selectedGroup = $derived(
    functionGroups.find((group) => group.items.some((fn) => fn.name === selectedFunction.name))!,
);

const result = $derived.by(() => {
    try {
        const value = selectedFunction.formatter(inputValue);
        const text =
            typeof value === 'string'
                ? value
                : value instanceof RegExp
                  ? value.toString()
                  : typeof value === 'object' && value !== null
                    ? JSON.stringify(value, null, 2)
                    : String(value);
        return {
            text,
            type: value instanceof RegExp ? 'RegExp' : Array.isArray(value) ? 'array' : typeof value,
            error: '',
        };
    } catch (error) {
        return { text: '', type: '', error: error instanceof Error ? error.message : 'Unable to process this input.' };
    }
});
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const displayOutput = $derived(
    showWhitespace ? result.text.replace(/ /g, '·').replace(/\t/g, '→').replace(/\n/g, '↵\n') : result.text,
);
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const usage = $derived(
    `import { ${selectedFunction.name} } from 'bitaboom';\n\n${selectedFunction.name}(${JSON.stringify(inputValue)}${selectedFunction.arguments ?? ''});`,
);

const loadSample = (text: string) => {
    inputValue = text;
    copyStatus = '';
};
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const selectFunction = (fn: DemoFunction) => {
    selectedFunction = fn;
    loadSample(fn.sample);
};
// biome-ignore lint/correctness/noUnusedVariables: used in the Svelte template.
const copyOutput = async () => {
    const output = result.text;
    copyStatus = '';
    try {
        await navigator.clipboard.writeText(output);
        if (result.text === output) {
            copyStatus = 'Copied to clipboard';
        }
    } catch {
        copyStatus = 'Copy unavailable. Select the output text to copy it.';
    }
};
</script>

<svelte:head>
    <title>Bitaboom · Text playground</title>
    <meta name="description" content="Explore Bitaboom’s Arabic and English text helpers with live examples, input/output comparisons and ready-to-use code." />
</svelte:head>

<div class="app-shell">
    <aside class="sidebar" aria-label="Function browser">
        <a class="brand" href="https://github.com/ragaeeb/bitaboom" aria-label="Bitaboom on GitHub">
            <span class="brand-mark" aria-hidden="true">ب</span>
            <span>bitaboom<span class="brand-caption">THE TEXT TOOLKIT</span></span>
        </a>
        <div class="browse-controls">
            <label for="function-search">Find a function</label>
            <input id="function-search" type="search" bind:value={search} placeholder="Search names or purpose…" />
            <label class="sr-only" for="category">Category</label>
            <select id="category" bind:value={category}>
                <option>All functions</option>
                {#each functionGroups as group}<option>{group.title}</option>{/each}
            </select>
            <p class="browse-count" role="status">{matchCount} of {allFunctions.length} functions</p>
        </div>
        <nav class="sidebar-nav" aria-label="Functions">
            {#each filteredGroups as group}
                <div class="nav-group">
                    <h2>{group.title}<span>{group.items.length}</span></h2>
                    {#each group.items as item}
                        <button class:active={selectedFunction.name === item.name} aria-current={selectedFunction.name === item.name ? 'true' : undefined} type="button" onclick={() => selectFunction(item)} title={item.description}>
                            {item.name}
                        </button>
                    {/each}
                </div>
            {/each}
            {#if matchCount === 0}
                <div class="empty-search"><p>No functions found.</p><button type="button" onclick={() => { search = ''; category = 'All functions'; }}>Clear filters</button></div>
            {/if}
        </nav>
        <div class="sidebar-footer">v{libraryPackage.version} <span>Arabic + English</span></div>
    </aside>

    <main class="content">
        <header class="page-header">
            <div><p class="eyebrow">Interactive reference</p><h1>A little order for your text.</h1></div>
            <a class="text-link" href="https://github.com/ragaeeb/bitaboom#readme" target="_blank" rel="noreferrer">Documentation ↗</a>
        </header>
        <section class="workbench" aria-labelledby="function-name">
            <div class="function-header">
                <p class="eyebrow">{selectedGroup.title}</p>
                <h2 id="function-name">{selectedFunction.name}</h2>
                <p class="function-description">{selectedFunction.description}</p>
            </div>
            <div class="sample-bar">
                <span>Try an example</span>
                <button type="button" class:chosen={inputValue === selectedFunction.sample} onclick={() => loadSample(selectedFunction.sample)}>Focused example</button>
                {#if selectedFunction.comparison}
                    <button type="button" class:chosen={inputValue === selectedFunction.comparison} onclick={() => loadSample(selectedFunction.comparison!)}>Compare behavior</button>
                {/if}
                {#each mockTexts as sample}
                    <button type="button" class:chosen={inputValue === sample.text} onclick={() => loadSample(sample.text)}>{sample.label}</button>
                {/each}
            </div>
            <div class="editors">
                <div class="editor-pane">
                    <div class="pane-header"><label for="demo-input">Input <span>editable</span></label><span>{inputValue.length} chars</span></div>
                    <textarea id="demo-input" bind:value={inputValue} oninput={() => copyStatus = ''} dir="auto" spellcheck="false" rows="9" aria-describedby="input-help"></textarea>
                    <div class="pane-footer"><span id="input-help">Paste your text. Results update as you type.</span><button type="button" onclick={() => loadSample(selectedFunction.sample)}>Reset</button></div>
                </div>
                <div class="editor-pane output-pane">
                    <div class="pane-header"><h3>Output <span>{result.type || 'error'}</span></h3><span>{result.error ? '—' : result.text.length + ' chars'}</span></div>
                    <div class="output-body">
                        {#if result.error}<p class="error" role="alert">{result.error}</p>
                        {:else if result.text === ''}<p class="empty-output">Empty string <code>""</code></p>
                        {:else}<pre dir="auto" class:structured={result.type !== 'string'}>{displayOutput}</pre>{/if}
                    </div>
                    <div class="pane-footer"><span>{result.error ? 'Check the input and try again.' : result.type === 'string' ? result.text === inputValue ? 'Unchanged · input is already compatible' : 'Transformed · original input preserved' : 'Returned value'}</span><button type="button" onclick={copyOutput} disabled={!!result.error}>Copy output</button></div>
                </div>
            </div>
            <div class="result-options"><label><input type="checkbox" bind:checked={showWhitespace} /> Show whitespace <span>· space &nbsp; → tab &nbsp; ↵ newline</span></label><span role="status">{copyStatus}</span></div>
            <details class="code-example" open>
                <summary>Use in your code <span>TypeScript / JavaScript</span></summary>
                <pre><code>{usage}</code></pre>
            </details>
        </section>
        <footer class="app-footer"><span>Small helpers. Readable text.</span><span>Bitaboom · MIT · {libraryPackage.author}</span></footer>
    </main>
</div>
