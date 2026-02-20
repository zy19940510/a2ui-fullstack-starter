/**
 * 注册应用特定的组件到全局 componentRegistry
 */
import { componentRegistry, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'
import { A2UIWeather } from '@/a2ui-components/weather'
import { A2UIText } from '@/a2ui-components/text'
import { A2UIDivider } from '@/a2ui-components/divider'

// 定义命名空间
export const APP_NAMESPACE = 'a2ui-test.web'

// 定义组件插件
const weatherPlugin = defineComponentPlugin('Weather', A2UIWeather)
const textPlugin = defineComponentPlugin('Text', A2UIText)
const dividerPlugin = defineComponentPlugin('Divider', A2UIDivider)

// 注册到全局 registry (模块加载时自动执行)
componentRegistry.use(weatherPlugin, APP_NAMESPACE)
componentRegistry.use(textPlugin, APP_NAMESPACE)
componentRegistry.use(dividerPlugin, APP_NAMESPACE)

console.log('[CustomCatalog] Components registered to namespace:', APP_NAMESPACE)

