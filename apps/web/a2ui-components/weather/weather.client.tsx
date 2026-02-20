import * as React from 'react'
import { emitUserAction as emitAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'
import { motion } from 'framer-motion'
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="auicom:max-w-sm"
      data-component-id={component.id}
    >
      {/* 紧凑型卡片 */}
      <div className="auicom:bg-gradient-to-br auicom:from-blue-400 auicom:to-blue-600 auicom:rounded-xl auicom:shadow-lg auicom:overflow-hidden">
        {/* 头部 - 城市和操作按钮 */}
        <div className="auicom:flex auicom:justify-between auicom:items-center auicom:px-4 auicom:py-2.5 auicom:bg-white/10 auicom:backdrop-blur-sm">
          <h3 className="auicom:text-base auicom:font-semibold auicom:text-white">{weatherData.city}</h3>
          <div className="auicom:flex auicom:gap-1.5">
            {/* 刷新按钮 */}
            {refreshAction && (
              <button
                onClick={handleRefresh}
                className="auicom:px-2 auicom:py-1 auicom:bg-white/20 auicom:text-white auicom:rounded auicom:text-xs auicom:backdrop-blur-sm hover:auicom:bg-white/30 auicom:transition-colors"
                aria-label={t.actions.refresh}
                title={t.actions.refresh}
              >
                🔄
              </button>
            )}
            {/* 切换城市按钮 */}
            {changeCityAction && (
              <button
                onClick={handleChangeCity}
                className="auicom:px-2 auicom:py-1 auicom:bg-white/20 auicom:text-white auicom:rounded auicom:text-xs auicom:backdrop-blur-sm hover:auicom:bg-white/30 auicom:transition-colors"
                aria-label={t.actions.changeCity}
                title={t.actions.changeCity}
              >
                📍
              </button>
            )}
          </div>
        </div>

        {/* 主要天气信息 - 横向布局 */}
        <div className="auicom:flex auicom:items-center auicom:px-4 auicom:py-3 auicom:gap-3">
          {/* 左侧：天气图标 */}
          <div className="auicom:text-4xl auicom:flex-shrink-0">
            {weatherInfo.icon}
          </div>

          {/* 中间：温度和状态 */}
          <div className="auicom:flex-1">
            <div className="auicom:flex auicom:items-baseline auicom:gap-1">
              <span className="auicom:text-3xl auicom:font-bold auicom:text-white">
                {Math.round(weatherData.temperature)}
              </span>
              <span className="auicom:text-xl auicom:text-white/80">°C</span>
            </div>
            <p className="auicom:text-sm auicom:text-white/90 auicom:mt-0.5">{weatherInfo.description}</p>
            <p className="auicom:text-xs auicom:text-white/70 auicom:mt-0.5">
              体感 {Math.round(weatherData.feelsLike)}°C
            </p>
          </div>
        </div>

        {/* 底部详细信息 - 紧凑型 */}
        <div className="auicom:flex auicom:gap-4 auicom:px-4 auicom:py-2.5 auicom:bg-white/10 auicom:backdrop-blur-sm auicom:text-xs">
          {/* 湿度 */}
          <div className="auicom:flex auicom:items-center auicom:gap-1.5 auicom:flex-1">
            <span className="auicom:text-base">💧</span>
            <div>
              <div className="auicom:text-white/70">{t.labels.humidity}</div>
              <div className="auicom:font-semibold auicom:text-white">{weatherData.humidity}%</div>
            </div>
          </div>

          {/* 风速 */}
          <div className="auicom:flex auicom:items-center auicom:gap-1.5 auicom:flex-1">
            <span className="auicom:text-base">💨</span>
            <div>
              <div className="auicom:text-white/70">{t.labels.windSpeed}</div>
              <div className="auicom:font-semibold auicom:text-white">{weatherData.windSpeed} km/h</div>
            </div>
          </div>

          {/* 更新时间 */}
          {weatherData.timestamp && (
            <div className="auicom:flex auicom:items-center auicom:gap-1.5 auicom:flex-1">
              <span className="auicom:text-base">⏰</span>
              <div>
                <div className="auicom:text-white/70">更新</div>
                <div className="auicom:font-semibold auicom:text-white">{formatTime(weatherData.timestamp)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
