/**
 * 注册应用特定的组件到全局 componentRegistry
 */
import { componentRegistry, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'
import { A2UIWeather } from '@/a2ui-components/weather'

// 定义命名空间
export const APP_NAMESPACE = 'a2ui-test.web'

// 定义天气组件插件
const weatherPlugin = defineComponentPlugin('Weather', A2UIWeather)

// 注册到全局 registry (模块加载时自动执行)
componentRegistry.use(weatherPlugin, APP_NAMESPACE)

console.log('[CustomCatalog] Weather component registered to namespace:', APP_NAMESPACE)
