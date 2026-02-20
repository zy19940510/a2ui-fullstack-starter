#!/usr/bin/env node

/**
 * 使用 esbuild 将编译后的 ES2022 代码降级到 ES2020
 * 确保 Webpack 5 / Next.js 12 兼容性
 */

import { buildSync } from 'esbuild';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');

async function downlevelSyntax() {
  // 查找所有 .js 文件（排除 .d.ts 和 .map）
  const files = await glob(`${distDir}/**/*.js`);

  console.log(`Processing ${files.length} JavaScript files with esbuild`);

  for (const file of files) {
    try {
      buildSync({
        entryPoints: [file],
        outfile: file,
        format: 'esm',
        target: 'es2020',
        allowOverwrite: true,
        charset: 'utf8',
        keepNames: true,
        minify: false,
      });
      console.log(`✓ Downleveled: ${file}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ Successfully downleveled ${files.length} files to ES2020`);
}

downlevelSyntax().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
