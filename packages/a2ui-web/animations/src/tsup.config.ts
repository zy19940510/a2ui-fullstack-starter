import { defineConfig } from 'tsup'

export default defineConfig({
  // 使用 glob 模式匹配所有入口文件（相对于项目根目录）
  entry: [
    'src/lenis.ts',
    'src/motion.ts',
    'src/icons.ts',
    'src/components/**/*.{ts,tsx}',  // 自动包含 components 目录下的所有文件
  ],
  format: ['esm'],
  dts: true,
  bundle: false,  // 不 bundle，保留目录结构
  sourcemap: true,
  clean: true,
  // 外部化所有依赖，避免打包进 dist
  external: [
    'react',
    'react-dom',
    'framer-motion',
    'lucide-react',
    '@studio-freight/lenis',
  ],
  // 输出目录保留 src 之后的路径结构
  outDir: 'dist',
})
