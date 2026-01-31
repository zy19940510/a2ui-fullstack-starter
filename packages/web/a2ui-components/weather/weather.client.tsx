import * as React from 'react'
import { emitUserAction as emitAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'
import { motion } from '@a2ui-web/animations/motion'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import type { WeatherData, WeatherTranslations, WeatherAction } from './weather-types'
import { weatherIcons, defaultTranslations, getWeatherFromCode } from './weather-data'

type WeatherClientProps = A2UIComponentProps & {
  weatherData: WeatherData
  locale: 'en' | 'zh'
  translations: WeatherTranslations
  refreshAction?: WeatherAction
  changeCityAction?: WeatherAction
}

export function WeatherClient({
  component,
  surfaceId,
  emitUserAction,
  weatherData,
  locale,
  translations,
  refreshAction,
  changeCityAction,
}: WeatherClientProps) {
  // 获取当前语言的翻译
  const t = translations[locale] ?? defaultTranslations[locale]

  // 格式化时间
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '--:--'
    const date = new Date(timestamp)
    return date.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 处理刷新操作
  const handleRefresh = React.useCallback(() => {
    if (!refreshAction || !emitUserAction) return

    console.log('[Weather] Refresh clicked')

    emitAction(emitUserAction, {
      name: refreshAction.name,
      surfaceId,
      componentId: component.id,
      context: {
        city: weatherData.city,
        timestamp: new Date().toISOString(),
      },
    })
  }, [refreshAction, emitUserAction, surfaceId, component.id, weatherData.city])

  // 处理切换城市操作
  const handleChangeCity = React.useCallback(() => {
    if (!changeCityAction || !emitUserAction) return

    console.log('[Weather] Change city clicked')

    emitAction(emitUserAction, {
      name: changeCityAction.name,
      surfaceId,
      componentId: component.id,
      context: {
        currentCity: weatherData.city,
      },
    })
  }, [changeCityAction, emitUserAction, surfaceId, component.id, weatherData.city])

  // 获取天气图标和描述
  const weatherInfo = React.useMemo(() => {
    // 如果有天气代码，使用代码映射
    if (weatherData.weatherCode !== undefined) {
      return getWeatherFromCode(weatherData.weatherCode)
    }
    // 否则使用原有逻辑
    return {
      condition: weatherData.condition,
      icon: weatherIcons[weatherData.condition] || '🌡️',
      description: weatherData.weatherDescription || t.conditions[weatherData.condition] || weatherData.condition,
    }
  }, [weatherData.weatherCode, weatherData.condition, weatherData.weatherDescription, t.conditions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="auicom:max-w-md auicom:mx-auto"
      data-component-id={component.id}
    >
      {/* 主卡片 */}
      <div className="auicom:bg-gradient-to-br auicom:from-blue-400 auicom:to-blue-600 auicom:rounded-2xl auicom:shadow-2xl auicom:overflow-hidden">
        {/* 头部 - 城市和操作按钮 */}
        <div className="auicom:flex auicom:justify-between auicom:items-center auicom:p-6 auicom:bg-white/10 auicom:backdrop-blur-sm">
          <h2 className="auicom:text-2xl auicom:font-bold auicom:text-white">{weatherData.city}</h2>
          <div className="auicom:flex auicom:gap-2">
            {/* 刷新按钮 */}
            {refreshAction && (
              <button
                onClick={handleRefresh}
                className="auicom:px-3 auicom:py-1.5 auicom:bg-white/20 auicom:text-white auicom:rounded-lg auicom:text-sm auicom:font-medium auicom:backdrop-blur-sm hover:auicom:bg-white/30 auicom:transition-colors"
                aria-label={t.actions.refresh}
              >
                🔄 {t.actions.refresh}
              </button>
            )}
            {/* 切换城市按钮 */}
            {changeCityAction && (
              <button
                onClick={handleChangeCity}
                className="auicom:px-3 auicom:py-1.5 auicom:bg-white/20 auicom:text-white auicom:rounded-lg auicom:text-sm auicom:font-medium auicom:backdrop-blur-sm hover:auicom:bg-white/30 auicom:transition-colors"
                aria-label={t.actions.changeCity}
              >
                📍 {t.actions.changeCity}
              </button>
            )}
          </div>
        </div>

        {/* 主要天气信息 */}
        <div className="auicom:p-8 auicom:text-center">
          {/* 天气图标 */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="auicom:text-8xl auicom:mb-4"
          >
            {weatherInfo.icon}
          </motion.div>

          {/* 温度 */}
          <div className="auicom:flex auicom:items-center auicom:justify-center auicom:gap-2">
            <span className="auicom:text-7xl auicom:font-bold auicom:text-white">
              {Math.round(weatherData.temperature)}
            </span>
            <span className="auicom:text-4xl auicom:text-white/80">°C</span>
          </div>

          {/* 天气状态 */}
          <p className="auicom:text-xl auicom:text-white/90 auicom:mt-2">{weatherInfo.description}</p>

          {/* 体感温度 */}
          <p className="auicom:text-sm auicom:text-white/70 auicom:mt-2">
            {t.labels.feelsLike} {Math.round(weatherData.feelsLike)}°C
          </p>
        </div>

        {/* 详细信息网格 */}
        <div className="auicom:grid auicom:grid-cols-2 auicom:gap-4 auicom:p-6 auicom:bg-white/10 auicom:backdrop-blur-sm">
          {/* 湿度 */}
          <div className="auicom:text-center auicom:p-4 auicom:bg-white/10 auicom:rounded-xl">
            <div className="auicom:text-3xl auicom:mb-2">💧</div>
            <div className="auicom:text-sm auicom:text-white/70 auicom:mb-1">{t.labels.humidity}</div>
            <div className="auicom:text-2xl auicom:font-bold auicom:text-white">{weatherData.humidity}%</div>
          </div>

          {/* 风速 */}
          <div className="auicom:text-center auicom:p-4 auicom:bg-white/10 auicom:rounded-xl">
            <div className="auicom:text-3xl auicom:mb-2">💨</div>
            <div className="auicom:text-sm auicom:text-white/70 auicom:mb-1">{t.labels.windSpeed}</div>
            <div className="auicom:text-2xl auicom:font-bold auicom:text-white">{weatherData.windSpeed} km/h</div>
          </div>
        </div>

        {/* 更新时间 */}
        {weatherData.timestamp && (
          <div className="auicom:px-6 auicom:py-3 auicom:text-center auicom:text-xs auicom:text-white/60">
            {t.labels.lastUpdated}: {formatTime(weatherData.timestamp)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
