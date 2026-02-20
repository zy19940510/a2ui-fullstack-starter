# @a2ui-web/assets

用于 a2ui-web 项目的共享静态资源（图标、图片）。

## 安装

```bash
# 从 GitLab 包注册表安装
npm install @a2ui-web/assets
# 或
yarn add @a2ui-web/assets
# 或
bun add @a2ui-web/assets
```

## 使用

### 图标

```typescript
// 导入图标路径
import iconPath from '@a2ui-web/assets/icons/example.svg';

// 在 JSX 中使用
<img src={iconPath} alt="Example Icon" />
```

### 图片

```typescript
// 导入图片路径
import imagePath from '@a2ui-web/assets/images/example.png';

// 在 JSX 中使用
<img src={imagePath} alt="Example" />
```

## 包导出

此包使用子路径导出：

- `@a2ui-web/assets/icons/*` - 所有图标文件
- `@a2ui-web/assets/images/*` - 所有图片文件

## 开发

### 本地开发认证

发布前，请配置本地认证：

1. 在以下地址创建个人访问令牌：
   `https://gitlab.longbridge-inc.com/-/user_settings/personal_access_tokens`

   所需权限范围：`api`、`write_repository`、`read_repository`

2. 添加到你的 `~/.npmrc`：

   ```bash
   //gitlab.longbridge-inc.com/api/v4/projects/4872/packages/npm/:_authToken=glpat-xxxxxxxxxxxxx
   ```

详细信息请参阅 `.npmrc.example`。

### 使用 Link 进行本地测试

```bash
# 在 assets 包目录中
cd packages/assets
bun link

# 在你的使用项目中
cd ../a2ui-react-renderer
bun link @a2ui-web/assets

# 验证链接
bun pm ls @a2ui-web/assets

# 测试后取消链接
bun unlink @a2ui-web/assets
cd ../assets
bun unlink
```

### 发布

#### 方法 1：通过 GitLab CI/CD 自动发布（推荐）

```bash
# 1. 更新版本
bun version patch  # 0.1.0 → 0.1.1
# 或 bun version minor  # 0.1.0 → 0.2.0
# 或 bun version major  # 0.1.0 → 1.0.0

# 2. 提交并推送
git add .
git commit -m "chore: bump version to v0.1.1"
git push

# 3. 创建并推送标签（这会触发 CI/CD）
git tag v0.1.1
git push origin v0.1.1

# 4. 前往 GitLab Pipeline 手动触发发布任务
# https://gitlab.longbridge-inc.com/long-bridge-frontend/a2ui-component/-/pipelines
```

#### 方法 2：从本地手动发布

```bash
# 确保你已在 ~/.npmrc 中配置了个人访问令牌
bun version patch
bun publish
```

已发布的包可在以下地址查看：
`https://gitlab.longbridge-inc.com/long-bridge-frontend/a2ui-component/-/packages`

## 许可证

MIT
