import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte()],
    // The browser demo uses the default builder; this switch is for server benchmarks.
    define: { 'process.env.BITABOOM_PREFORMAT_BUILDER': 'undefined' },
});
