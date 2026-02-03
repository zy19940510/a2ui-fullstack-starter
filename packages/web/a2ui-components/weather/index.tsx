import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { valueMapToObject } from '@a2ui-web/a2ui-react-renderer/utils/valueMap'
import { WeatherClient } from './weather.client'
import type { WeatherData, WeatherTranslations } from './weather-types'
import { defaultWeatherData, defaultTranslations } from './weather-data'

/**
 * Weather - A2UI 天气展示组件
 *
 * 这是一个基于 A2UI 0.8 协议的自定义天气组件，展示城市天气信息。
 *
 * 支持的属性:
 * - weatherData: WeatherData - 天气数据（支持数据绑定）
 * - locale: 'en' | 'zh' - 语言
 * - translations: WeatherTranslations - 翻译文本
 * - refreshAction: WeatherAction - 刷新操作
 * - changeCityAction: WeatherAction - 切换城市操作
 */
export function A2UIWeather(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 1. 使用 useA2UIValue 解析所有数据绑定
  // 注意：useA2UIValue 返回的可能是 ValueMap 数组，需要转换为普通对象
  const rawWeatherData = useA2UIValue(
    componentProps.weatherData,
    defaultWeatherData,
    processor,
    component,
    surfaceId
  )

  // 2. 将 ValueMap 或 Map 转换为普通对象
  // Debug: 查看原始数据结构
  console.log('🔍 rawWeatherData:', rawWeatherData)

  let weatherData: WeatherData
  if (rawWeatherData instanceof Map) {
    // 如果是 JavaScript Map，转换为普通对象
    weatherData = Object.fromEntries(rawWeatherData) as WeatherData
  } else if (typeof rawWeatherData === 'object' && rawWeatherData !== null && 'valueMap' in rawWeatherData) {
    // 如果是 ValueMap 格式（对象包含 valueMap 属性）
    weatherData = valueMapToObject((rawWeatherData as any).valueMap) as WeatherData
  } else if (Array.isArray(rawWeatherData)) {
    // 如果是 ValueMap 数组
    weatherData = valueMapToObject(rawWeatherData) as WeatherData
  } else {
    // 已经是普通对象
    weatherData = rawWeatherData as WeatherData
  }

  console.log('✅ weatherData after conversion:', weatherData)

  const locale = useA2UIValue<'en' | 'zh'>(
    componentProps.locale,
    'en',
    processor,
    component,
    surfaceId
  )

  const translations = useA2UIValue<WeatherTranslations>(
    componentProps.translations,
    defaultTranslations,
    processor,
    component,
    surfaceId
  )

  // 3. 获取 actions
  const refreshAction = componentProps.refreshAction as any
  const changeCityAction = componentProps.changeCityAction as any

  // 4. 传递给 Client Component
  return (
    <WeatherClient
      component={component}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
      weatherData={weatherData}
      locale={locale}
      translations={translations}
      refreshAction={refreshAction}
      changeCityAction={changeCityAction}
    />
  )
}
