import { defineConfig } from 'tsdown';

export default defineConfig({
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: true,
    platform: 'neutral',
    sourcemap: true,
    target: 'esnext',
});
