# @a2ui-web/config-typescript

用于 a2ui-web 项目的共享 TypeScript 配置。

## 可用配置

### 1. 基础配置

适用于非 React 项目（Node.js、工具库等）

```json
{
  "extends": "@a2ui-web/config-typescript/base"
}
```

### 2. React 配置

适用于 React 项目（Vite、Create React App 等）

```json
{
  "extends": "@a2ui-web/config-typescript/react"
}
```

### 3. Next.js 配置

适用于 Next.js 应用

```json
{
  "extends": "@a2ui-web/config-typescript/nextjs"
}
```

## 特性

所有配置都包含：

- **严格模式**：启用以确保类型安全
- **模块解析**：Bundler 模式
- **跳过库检查**：更快的构建速度
- **增量编译**：更快的重新构建速度
- **JSON 导入支持**：将 JSON 文件作为模块导入

## 自定义

你可以扩展和覆盖任何配置：

```json
{
  "extends": "@a2ui-web/config-typescript/nextjs",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
