import type { WeatherData } from '@/a2ui-components/weather/weather-types'
import { getWeatherFromCode } from '@/a2ui-components/weather/weather-data'
import type { UserActionMessage } from '@a2ui-web/a2ui-react-renderer'
import type * as v0_8 from '@a2ui-web/lit-core'

export const surfaceId = 'weather-surface'

// 城市坐标映射
const cityCoords: Record<string, { lat: number; lon: number }> = {
  上海: { lat: 31.2304, lon: 121.4737 },
  北京: { lat: 39.9042, lon: 116.4074 },
  广州: { lat: 23.1291, lon: 113.2644 },
  深圳: { lat: 22.5431, lon: 114.0579 },
  杭州: { lat: 30.2741, lon: 120.1551 },
  成都: { lat: 30.5728, lon: 104.0668 },
}

// 获取真实天气数据
async function fetchWeatherData(city: string): Promise<WeatherData> {
  const coords = cityCoords[city] || cityCoords['上海']

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m`
    )
    const data = await response.json()
    const current = data.current_weather

    // 使用天气代码获取图标和描述
    const weatherInfo = getWeatherFromCode(current.weathercode)

    // Open-Meteo 不直接返回湿度，使用当前小时的湿度
    const currentHour = new Date().getHours()
    const humidity = data.hourly?.relative_humidity_2m?.[currentHour] || 60

    return {
      city,
      temperature: current.temperature,
      condition: weatherInfo.condition,
      humidity,
      windSpeed: current.windspeed,
      feelsLike: current.temperature - 2, // 简单估算体感温度
      timestamp: current.time,
      weatherCode: current.weathercode,
      weatherDescription: weatherInfo.description,
    }
  } catch (error) {
    console.error('获取天气数据失败:', error)
    // 返回默认数据
    return {
      city,
      temperature: 25,
      condition: 'sunny',
      humidity: 60,
      windSpeed: 15,
      feelsLike: 24,
      timestamp: new Date().toISOString(),
    }
  }
}

// 创建天气组件的 A2UI 消息
export function createWeatherMessages(weatherData?: Partial<WeatherData>) {
  const currentWeather: WeatherData = {
    city: weatherData?.city || '上海',
    temperature: weatherData?.temperature ?? 25,
    condition: weatherData?.condition || 'sunny',
    humidity: weatherData?.humidity ?? 60,
    windSpeed: weatherData?.windSpeed ?? 15,
    feelsLike: weatherData?.feelsLike ?? 24,
    timestamp: weatherData?.timestamp || new Date().toISOString(),
    weatherCode: weatherData?.weatherCode,
    weatherDescription: weatherData?.weatherDescription,
  }

  return [
    // 1. Surface Update - 定义组件树
    {
      surfaceUpdate: {
        surfaceId,
        components: [
          {
            id: 'weather-widget',
            component: {
              Weather: {
                // 使用中文
                locale: { literalString: 'zh' },

                // 使用 path 引用动态数据
                weatherData: { path: '/weather/current' },

                // 定义用户操作
                refreshAction: {
                  name: 'refresh-weather',
                  context: [],
                },
                changeCityAction: {
                  name: 'change-city',
                  context: [],
                },
              },
            },
          },
        ],
      },
    },

    // 2. Data Model Update - 存储天气数据
    {
      dataModelUpdate: {
        surfaceId,
        path: '/',
        contents: [
          { key: 'weather', valueString: JSON.stringify({ current: currentWeather }) },
          { key: 'locale', valueString: 'zh' },
        ],
      },
    },

    // 3. Begin Rendering
    {
      beginRendering: {
        surfaceId,
        root: 'weather-widget',
      },
    },
  ]
}

// 处理用户操作
export function handleUserAction(processor: v0_8.Types.MessageProcessor) {
  return async (message: UserActionMessage) => {
    const action = message.userAction
    console.log('[Weather] User action:', action)

    switch (action.name) {
      case 'refresh-weather':
        const currentCity =
          typeof action.context?.city === 'string'
            ? action.context.city
            : '上海'
        console.log('[Weather] Refreshing weather data for:', currentCity)

        // 获取真实天气数据
        const newWeather = await fetchWeatherData(currentCity)

        // 更新数据模型
        processor.processMessages([
          {
            dataModelUpdate: {
              surfaceId,
              path: '/weather/current',
              contents: [
                { key: 'temperature', valueNumber: newWeather.temperature },
                { key: 'humidity', valueNumber: newWeather.humidity },
                { key: 'windSpeed', valueNumber: newWeather.windSpeed },
                { key: 'feelsLike', valueNumber: newWeather.feelsLike },
                { key: 'timestamp', valueString: newWeather.timestamp || new Date().toISOString() },
                { key: 'weatherCode', valueNumber: newWeather.weatherCode ?? -1 },
                { key: 'weatherDescription', valueString: newWeather.weatherDescription ?? '' },
                { key: 'condition', valueString: newWeather.condition },
              ],
            },
          },
        ])

        console.log('[Weather] Data updated:', newWeather)
        break

      case 'change-city':
        const currentCityInContext =
          typeof action.context?.currentCity === 'string'
            ? action.context.currentCity
            : ''
        console.log('[Weather] Change city from:', currentCityInContext)

        // 切换到预设的城市列表
        const cities = ['上海', '北京', '广州', '深圳', '杭州', '成都']
        const currentIndex = cities.indexOf(currentCityInContext)
        const nextCity = cities[(currentIndex + 1) % cities.length]

        // 获取新城市的真实天气数据
        const cityWeather = await fetchWeatherData(nextCity)

        // 更新城市并刷新数据
        processor.processMessages([
          {
            dataModelUpdate: {
              surfaceId,
              path: '/weather/current',
              contents: [
                { key: 'city', valueString: nextCity },
                { key: 'temperature', valueNumber: cityWeather.temperature },
                { key: 'condition', valueString: cityWeather.condition },
                { key: 'humidity', valueNumber: cityWeather.humidity },
                { key: 'windSpeed', valueNumber: cityWeather.windSpeed },
                { key: 'feelsLike', valueNumber: cityWeather.feelsLike },
                { key: 'timestamp', valueString: cityWeather.timestamp || new Date().toISOString() },
                { key: 'weatherCode', valueNumber: cityWeather.weatherCode ?? -1 },
                { key: 'weatherDescription', valueString: cityWeather.weatherDescription ?? '' },
              ],
            },
          },
        ])

        console.log('[Weather] Changed to city:', nextCity, cityWeather)
        break
    }
  }
}
