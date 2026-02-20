#!/usr/bin/env node

/**
 * 修复 TypeScript 编译后的 JSON import assertions
 * 将 `import x from './file.json' with { type: "json" };`
 * 转换为 `import x from './file.json';`
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');

async function fixJsonImports() {
  // 查找所有 .js 文件
  const files = await glob(`${distDir}/**/*.js`);

  console.log(`Found ${files.length} JavaScript files`);

  let fixedCount = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    const originalContent = content;

    // 正则表达式：匹配 import ... from '....json' with { type: "json" };
    const regex = /import\s+(\w+)\s+from\s+(['"].*?\.json['"])\s+with\s+\{\s*type:\s*['"]json['"]\s*\};?/g;

    content = content.replace(regex, 'import $1 from $2;');

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`✓ Fixed: ${file}`);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);
}

fixJsonImports().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
