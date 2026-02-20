// 天气数据类型
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy'

export type WeatherData = {
  city: string
  temperature: number // 摄氏度
  condition: WeatherCondition
  humidity: number // 百分比
  windSpeed: number // km/h
  feelsLike: number // 体感温度
  timestamp?: string // 更新时间
  weatherCode?: number // Open-Meteo 天气代码（可选）
  weatherDescription?: string // 天气描述（可选，从代码生成）
}

// 翻译类型
export type WeatherTranslations = Record<
  'en' | 'zh',
  {
    labels: {
      temperature: string
      humidity: string
      windSpeed: string
      feelsLike: string
      lastUpdated: string
    }
    conditions: Record<WeatherCondition, string>
    actions: {
      refresh: string
      changeCity: string
    }
  }
>

// 组件 action 类型
export type WeatherAction = {
  name: 'refresh-weather' | 'change-city'
  context?: Array<{ key: string; value: unknown }>
}
