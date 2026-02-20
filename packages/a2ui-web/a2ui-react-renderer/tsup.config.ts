import { defineConfig } from 'tsup'

export default defineConfig({
  // 使用 glob 模式自动包含所有源文件，排除类型声明文件
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',  // 排除 .d.ts 文件（如 globals.d.ts）
  ],
  format: ['esm'],
  dts: {
    // 使用专门的构建配置，避免 noEmit: true 的问题
    tsconfig: './tsconfig.build.json',
    // 编译选项会与 tsconfig 合并，这里显式设置确保生效
    compilerOptions: {
      skipLibCheck: true,  // 跳过对 node_modules 类型文件的检查
    },
  },
  bundle: false,  // 保留模块结构和目录结构
  sourcemap: true,
  clean: true,
  // 外部化所有依赖，避免打包
  external: [
    'react',
    'react-dom',
    '@a2ui-web/lit-core',
    '@a2ui-web/animations',
    '@a2ui-web/assets',
    // 外部化所有 @a2ui-web/animations 的子路径
    /^@a2ui-web\/animations\//,
    // 外部化所有 @a2ui-web/lit-core 的子路径
    /^@a2ui-web\/lit-core\//,
  ],
  // bundle: false 会保留 src/ 目录结构输出到 dist/
})
