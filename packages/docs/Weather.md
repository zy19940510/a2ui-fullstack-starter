# Weather Component

Displays weather information with a beautiful, compact card UI.

## Component Type

`Weather`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `weatherData` | BoundValue<WeatherData> | Yes | Weather data object or path binding |
| `locale` | BoundValue<'en' \| 'zh'> | No | Display language (default: 'en') |
| `translations` | BoundValue<WeatherTranslations> | No | Custom translations object |
| `refreshAction` | WeatherAction | No | Action triggered when refresh button clicked |
| `changeCityAction` | WeatherAction | No | Action triggered when change city button clicked |

## WeatherData Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `city` | string | Yes | City name |
| `temperature` | number | Yes | Temperature in Celsius |
| `condition` | string | Yes | Weather condition (e.g., "sunny", "cloudy", "rainy") |
| `humidity` | number | Yes | Humidity percentage (0-100) |
| `windSpeed` | number | Yes | Wind speed in km/h |
| `feelsLike` | number | Yes | Feels-like temperature in Celsius |
| `timestamp` | string | No | ISO 8601 timestamp (e.g., "2026-01-31T09:00") |
| `weatherCode` | number | No | Weather code for icon mapping |
| `weatherDescription` | string | No | Detailed weather description |

## Example Usage

### Basic Weather Display

```json
[
  {"surfaceUpdate": {"surfaceId": "weather", "components": [
    {"id": "root", "component": {"Weather": {
      "weatherData": {"path": "/weather/data"},
      "locale": {"literalString": "zh"},
      "refreshAction": {"name": "refresh-weather"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "weather", "contents": [
    {"key": "weather", "valueMap": [
      {"key": "data", "valueMap": [
        {"key": "city", "valueString": "北京"},
        {"key": "temperature", "valueNumber": 15.5},
        {"key": "condition", "valueString": "晴天"},
        {"key": "humidity", "valueNumber": 45},
        {"key": "windSpeed", "valueNumber": 12.3},
        {"key": "feelsLike", "valueNumber": 14.2},
        {"key": "timestamp", "valueString": "2026-01-31T15:30:00"}
      ]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "weather", "root": "root"}}
]
```

### With Actions

```json
{"Weather": {
  "weatherData": {"path": "/weather/data"},
  "locale": {"literalString": "en"},
  "refreshAction": {"name": "refresh-weather"},
  "changeCityAction": {"name": "change-city"}
}}
```

## User Actions

When users interact with the Weather component, it emits user actions:

### Refresh Action

Triggered when the refresh button is clicked:

```json
{
  "userAction": {
    "name": "refresh-weather",
    "surfaceId": "weather",
    "sourceComponentId": "root",
    "timestamp": "2026-01-31T15:30:00Z",
    "context": {
      "city": "北京",
      "timestamp": "2026-01-31T15:30:00Z"
    }
  }
}
```

### Change City Action

Triggered when the change city button is clicked:

```json
{
  "userAction": {
    "name": "change-city",
    "surfaceId": "weather",
    "sourceComponentId": "root",
    "timestamp": "2026-01-31T15:30:00Z",
    "context": {
      "currentCity": "北京"
    }
  }
}
```

## Supported Weather Conditions

Common condition strings:
- `"晴天"` / `"sunny"` / `"clear"` - Clear sky ☀️
- `"多云"` / `"cloudy"` - Cloudy ☁️
- `"阴天"` / `"overcast"` - Overcast 🌥️
- `"小雨"` / `"light rain"` - Light rain 🌦️
- `"中雨"` / `"rain"` - Rain 🌧️
- `"大雨"` / `"heavy rain"` - Heavy rain ⛈️
- `"雷阵雨"` / `"thunderstorm"` - Thunderstorm ⚡
- `"雪"` / `"snow"` - Snow ❄️
- `"雾"` / `"fog"` - Fog 🌫️

## Styling

The Weather component displays as a compact card with:
- Blue gradient background
- City name and action buttons in header
- Weather icon and temperature prominently displayed
- Additional info (humidity, wind speed, update time) at bottom
- Responsive design with maximum width of 384px (max-w-sm)

## Notes

- Temperature values are automatically rounded to nearest integer for display
- If `weatherData` is bound to a path (e.g., `{"path": "/weather/data"}`), the component will automatically update when the data changes
- The component supports both English and Chinese locales
- All timestamps should be in ISO 8601 format
