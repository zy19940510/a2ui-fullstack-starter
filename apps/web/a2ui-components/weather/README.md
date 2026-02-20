# A2UI Weather Component

一个基于 A2UI 0.8 协议的天气展示组件，支持数据绑定和用户交互。

## 📦 组件位置

```
a2ui-react-renderer/src/a2ui-components/shadcnui/weather/
├── index.tsx              # 主组件 (Server Component)
├── weather.client.tsx     # 客户端组件 (Client Component)
├── weather-types.ts       # TypeScript 类型定义
└── weather-data.ts        # 默认数据和翻译
```

## ✨ 功能特性

- ☀️ **实时天气信息** - 展示温度、湿度、风速、体感温度
- 🔄 **刷新操作** - 支持手动刷新天气数据
- 📍 **切换城市** - 在多个城市间切换
- 🌐 **多语言支持** - 中英文双语
- 🎨 **精美 UI** - 渐变背景 + 玻璃态效果
- ⚡ **事件驱动** - 使用 A2UI 数据绑定自动更新
- 🖼️ **动画效果** - Framer Motion 动画

## 🚀 使用方法

### 1. 注册组件

在你的 `customCatalog.ts` 中注册：

\`\`\`typescript
import { componentRegistry, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'
import { A2UIWeather } from '@a2ui-web/a2ui-react-renderer/a2ui-components/shadcnui'

const weatherPlugin = defineComponentPlugin('Weather', A2UIWeather)
componentRegistry.use(weatherPlugin, YOUR_NAMESPACE)
\`\`\`

### 2. 创建 A2UI 消息

\`\`\`typescript
const weatherMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'weather-surface',
      components: [{
        id: 'weather-widget',
        component: {
          Weather: {
            locale: { literalString: 'zh' },
            weatherData: { path: '/weather/current' },
            refreshAction: { name: 'refresh-weather' },
            changeCityAction: { name: 'change-city' }
          }
        }
      }]
    }
  },
  {
    dataModelUpdate: {
      surfaceId: 'weather-surface',
      path: '/weather',
      contents: [
        { key: 'current', valueString: JSON.stringify({
          city: 'Shanghai',
          temperature: 28,
          condition: 'sunny',
          humidity: 65,
          windSpeed: 12,
          feelsLike: 27
        })}
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'weather-surface',
      root: 'weather-widget'
    }
  }
]
\`\`\`

### 3. 在页面中使用

\`\`\`typescript
import { A2UIRenderer } from '@a2ui-web/a2ui-react-renderer'

function WeatherPage() {
  const { processor } = useA2UIEnvironment()

  const onUserAction = useCallback((message) => {
    if (message.userAction.name === 'refresh-weather') {
      // 处理刷新逻辑
      processor.processMessages([{
        dataModelUpdate: {
          surfaceId: 'weather-surface',
          path: '/weather/current',
          contents: [
            { key: 'temperature', valueNumber: 25 },
            { key: 'timestamp', valueString: new Date().toISOString() }
          ]
        }
      }])
    }
  }, [processor])

  return (
    <A2UIRenderer
      surfaceId="weather-surface"
      namespace={YOUR_NAMESPACE}
      initialMessages={weatherMessages}
      onUserAction={onUserAction}
      processor={processor}
    />
  )
}
\`\`\`

## 📋 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `weatherData` | `WeatherData` | 默认数据 | 天气数据对象 |
| `locale` | `'en' \| 'zh'` | `'en'` | 显示语言 |
| `translations` | `WeatherTranslations` | 默认翻译 | 自定义翻译文本 |
| `refreshAction` | `WeatherAction` | - | 刷新按钮的 action |
| `changeCityAction` | `WeatherAction` | - | 切换城市按钮的 action |

### WeatherData 类型

\`\`\`typescript
type WeatherData = {
  city: string              // 城市名
  temperature: number       // 温度 (°C)
  condition: WeatherCondition  // 天气状态
  humidity: number          // 湿度 (%)
  windSpeed: number         // 风速 (km/h)
  feelsLike: number         // 体感温度 (°C)
  timestamp?: string        // 更新时间
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy'
\`\`\`

## 🎯 运行示例

\`\`\`bash
# 1. 构建 a2ui-react-renderer 包
cd a2ui-react-renderer
bun run build

# 2. 运行示例项目
cd ../example/next12-react17
bun run dev

# 3. 访问
open http://localhost:3000/weather
\`\`\`

## 🎨 自定义样式

组件使用 `auicom:` 前缀的 Tailwind CSS 类，确保不会与宿主项目样式冲突。

主要样式：
- 渐变背景：`from-blue-400 to-blue-600`
- 玻璃态效果：`bg-white/10 backdrop-blur-sm`
- 圆角卡片：`rounded-2xl`
- 阴影效果：`shadow-2xl`

## 🔧 高级用法

### 集成真实 API

\`\`\`typescript
async function fetchWeatherData(city: string) {
  const response = await fetch(
    \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&units=metric&appid=YOUR_KEY\`
  )
  const data = await response.json()

  return {
    city: data.name,
    temperature: Math.round(data.main.temp),
    condition: mapCondition(data.weather[0].main),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6),
    feelsLike: Math.round(data.main.feels_like),
    timestamp: new Date().toISOString()
  }
}
\`\`\`

### SSR 支持 (Next.js)

\`\`\`typescript
export const getServerSideProps: GetServerSideProps = async () => {
  const weatherData = await fetchWeatherData('Shanghai')
  const messages = createWeatherMessages(weatherData)

  const processor = new v0_8.Data.A2uiMessageProcessor()
  processor.processMessages(messages)

  const surface = processor.getSurfaces().get(surfaceId)
  const snapshot = {
    tree: surface?.componentTree ?? null,
    version: surface?.components.size ?? 0,
    exists: !!surface
  }

  return {
    props: { initialSnapshot: snapshot, initialMessages: messages }
  }
}
\`\`\`

## 📚 相关文档

- [A2UI Custom Components Skill](/.claude/skills/a2ui-custom-components/SKILL.md)
- [A2UI React Migration Skill](/.claude/skills/a2ui-react-migration/SKILL.md)
- [A2UI 0.8 协议规范](https://a2ui.org/specification/v0.8-a2ui/)

## 📝 许可

MIT
