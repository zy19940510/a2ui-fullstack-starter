'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  A2UIRenderer,
  useA2UIEnvironment,
  type UserActionMessage,
} from '@a2ui-web/a2ui-react-renderer'
import { createWeatherMessages, handleUserAction, surfaceId } from '@/lib/weather-messages'
import { APP_NAMESPACE } from '@/lib/customCatalog'
import type { WeatherData } from '@/a2ui-components/weather/weather-types'
import { getWeatherFromCode } from '@/a2ui-components/weather/weather-data'

/**
 * Weather Page - A2UI 天气组件演示
 */
export default function WeatherPage() {
  const { processor } = useA2UIEnvironment()
  const [initialWeather, setInitialWeather] = useState<Partial<WeatherData> | null>(null)

  // 加载初始天气数据
  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current_weather=true&hourly=temperature_2m,relative_humidity_2m'
        )
        const data = await response.json()
        const current = data.current_weather
        const weatherInfo = getWeatherFromCode(current.weathercode)
        const currentHour = new Date().getHours()
        const humidity = data.hourly?.relative_humidity_2m?.[currentHour] || 60

        setInitialWeather({
          city: '上海',
          temperature: current.temperature,
          condition: weatherInfo.condition,
          humidity,
          windSpeed: current.windspeed,
          feelsLike: current.temperature - 2,
          timestamp: current.time,
          weatherCode: current.weathercode,
          weatherDescription: weatherInfo.description,
        })
      } catch (error) {
        console.error('加载天气数据失败:', error)
        // 使用默认数据
        setInitialWeather({
          city: '上海',
          temperature: 25,
          condition: 'sunny',
          humidity: 60,
          windSpeed: 15,
          feelsLike: 24,
        })
      }
    }

    loadWeather()
  }, [])

  const onUserAction = useCallback(
    (message: UserActionMessage) => {
      handleUserAction(processor)(message)
    },
    [processor]
  )

  // 等待数据加载
  if (!initialWeather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">☁️</div>
          <p className="text-lg text-slate-600 dark:text-slate-400">加载天气数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
            A2UI 天气组件
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            实时天气展示 · 数据绑定 · 事件驱动
          </p>
        </div>

        {/* 天气组件 */}
        <div className="mb-16">
          <A2UIRenderer
            surfaceId={surfaceId}
            namespace={APP_NAMESPACE}
            initialMessages={createWeatherMessages(initialWeather)}
            onUserAction={onUserAction}
            processor={processor}
          />
        </div>

        {/* 使用说明卡片 */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            功能演示
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                刷新天气
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                点击右上角的"刷新"按钮，调用 Open-Meteo API 获取最新天气数据。
                温度、湿度、风速都会实时更新。
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                切换城市
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                点击"切换城市"按钮，在 6 个城市间循环：
                上海、北京、广州、深圳、杭州、成都。每个城市显示真实天气。
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
              技术特性
            </h3>
            <ul className="grid md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>基于 A2UI 0.8 协议</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Open-Meteo 真实天气数据</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>事件驱动数据更新</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Server/Client 组件分离</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Framer Motion 动画</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Tailwind CSS 渐变设计</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>天气代码智能映射</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>中英文双语支持</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
              代码位置
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                  组件注册
                </code>
                <code className="text-slate-600 dark:text-slate-400">
                  lib/customCatalog.ts
                </code>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                  消息数据
                </code>
                <code className="text-slate-600 dark:text-slate-400">
                  lib/weather-messages.ts
                </code>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                  页面文件
                </code>
                <code className="text-slate-600 dark:text-slate-400">
                  app/weather/page.tsx
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
