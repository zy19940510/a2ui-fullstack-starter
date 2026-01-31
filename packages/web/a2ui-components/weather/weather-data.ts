import type { WeatherData, WeatherTranslations, WeatherCondition } from './weather-types'

// 默认天气数据
export const defaultWeatherData: WeatherData = {
  city: 'San Francisco',
  temperature: 22,
  condition: 'sunny',
  humidity: 65,
  windSpeed: 12,
  feelsLike: 21,
  timestamp: new Date().toISOString(),
}

// 天气代码到状态的映射（Open-Meteo API）
export function getWeatherFromCode(code: number): { condition: WeatherCondition; icon: string; description: string } {
  if (code === 0) return { condition: 'sunny', icon: '☀️', description: '晴空' }
  if (code >= 1 && code <= 3) {
    if (code === 1) return { condition: 'sunny', icon: '🌤️', description: '基本晴' }
    if (code === 2) return { condition: 'cloudy', icon: '⛅', description: '局部多云' }
    return { condition: 'cloudy', icon: '☁️', description: '阴天' }
  }
  if (code === 45 || code === 48) return { condition: 'foggy', icon: '🌫️', description: '雾' }
  if (code >= 51 && code <= 57) return { condition: 'rainy', icon: '🌧️', description: '毛毛雨' }
  if (code >= 61 && code <= 67) return { condition: 'rainy', icon: '🌧️', description: '雨' }
  if (code >= 71 && code <= 77) return { condition: 'snowy', icon: '❄️', description: '降雪' }
  if (code >= 80 && code <= 82) return { condition: 'rainy', icon: '🌧️', description: '阵雨' }
  if (code >= 85 && code <= 86) return { condition: 'snowy', icon: '🌨️', description: '阵雪' }
  if (code === 95) return { condition: 'stormy', icon: '⛈️', description: '雷暴' }
  if (code === 96 || code === 99) return { condition: 'stormy', icon: '⛈️', description: '雷暴伴冰雹' }

  return { condition: 'sunny', icon: '🌡️', description: '未知' }
}

// 天气图标映射（保留旧版本兼容）
export const weatherIcons: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
  foggy: '🌫️',
}

// 多语言翻译
export const defaultTranslations: WeatherTranslations = {
  en: {
    labels: {
      temperature: 'Temperature',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      feelsLike: 'Feels Like',
      lastUpdated: 'Last Updated',
    },
    conditions: {
      sunny: 'Sunny',
      cloudy: 'Cloudy',
      rainy: 'Rainy',
      snowy: 'Snowy',
      stormy: 'Stormy',
      foggy: 'Foggy',
    },
    actions: {
      refresh: 'Refresh',
      changeCity: 'Change City',
    },
  },
  zh: {
    labels: {
      temperature: '温度',
      humidity: '湿度',
      windSpeed: '风速',
      feelsLike: '体感温度',
      lastUpdated: '更新时间',
    },
    conditions: {
      sunny: '晴天',
      cloudy: '多云',
      rainy: '雨天',
      snowy: '雪天',
      stormy: '暴风雨',
      foggy: '雾天',
    },
    actions: {
      refresh: '刷新',
      changeCity: '切换城市',
    },
  },
}
