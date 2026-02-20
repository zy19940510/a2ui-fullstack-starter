import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],  // 支持 ESM 和 CJS
  dts: true,
  sourcemap: true,
  clean: true,
})
