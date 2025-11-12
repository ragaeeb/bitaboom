import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const run = async (cmd: string[]) => {
    const proc = Bun.spawn({
        cmd,
        stdout: 'inherit',
        stderr: 'inherit',
    });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
        throw new Error(`Command failed: ${cmd.join(' ')}`);
    }
};

const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(rootDir, '..', 'dist');

rmSync(distDir, { recursive: true, force: true });

await run([
    'bun',
    'build',
    join(rootDir, '..', 'src/index.ts'),
    '--outdir',
    distDir,
    '--format',
    'esm',
    '--target',
    'bun',
    '--sourcemap',
    '--minify',
]);

await run([
    'bun',
    'x',
    'tsc',
    '--project',
    join(rootDir, '..', 'tsconfig.json'),
    '--emitDeclarationOnly',
    '--outDir',
    distDir,
]);
