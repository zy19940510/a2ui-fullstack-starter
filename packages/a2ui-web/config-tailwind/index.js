/** @type {import('tailwindcss').Config} */

/**
 * 云溪专用 Design System - Tailwind CSS v3 Configuration
 * Source: https://www.figma.com/design/NnrCx3x3PVukxpFxxObdXg/云溪专用?node-id=23-18636
 * 
 * Design Token Categories:
 * ========================
 * 
 * 【品牌色系 Brand Colors】
 * - 品牌主色: #37A0FF
 * - 品牌辅助色: #EBF5FF
 * 
 * 【涨跌色系 Market Colors】
 * - 涨/买入/卖出色·橙: #FF5000
 * - 涨/买入/卖出色·绿: #00B99A
 * 
 * 【文本色系 Text Colors】
 * - 一级字体色: #000000
 * - 一级补充字: #464F56 (较重要但需与一级色拉开差异)
 * - 二级字体色: #82888D (副文本内容)
 * - 三级字体色: #AFB3B6 (辅助说明及弱文本信息)
 * 
 * 【控件色系 Control Colors】
 * - 卡片描边色: #E2E3E4
 * - 分割线色: #EAEBEC
 * - 控件背景色: #F5F6F6
 * 
 * 【框架色系 Frame Colors】
 * - 一级卡片色: #FFFFFF
 * - 背景色: #F8F9FA
 * - 表头背景色: #F1F0F2
 * 
 * 【按钮色系 Button Colors】
 * - 主按钮色: #37A0FF
 * - 辅助按钮描边色: #C7CACC
 * - 不可用按钮色: #C7CACC
 * - Hover 叠加色: #EAEBEC (25% opacity)
 * 
 * 【字体 Typography】
 * - 中文字体: PingFang SC
 * - 英文字体: SF Pro Display
 * 
 * 【字号规范 Font Size】
 * - 12/R: 12px / 18px / 400
 * - 12/M: 12px / 18px / 500
 * - 14/R: 14px / 20px / 400
 * - 14/M: 14px / 20px / 500
 * - 16/M: 16px / 24px / 500
 * 
 * 【圆角 Border Radius】
 * - sm: 4px
 * - md: 8px
 * - lg: 12px
 * 
 * 【阴影 Shadows】
 * - drawer: 0 -2px 8px rgba(0, 0, 0, 0.08)
 * 
 * 【按钮尺寸 Button Sizes】
 * - 大型按钮: 高度 40px, 圆角 8px, 边距 16px/20px
 * - 中型按钮: 高度 36px, 圆角 8px, 边距 16px
 * - 小型按钮: 高度 28px, 圆角 4px, 边距 12px
 */

const screenMap = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
  '2xl': 1560,
  '3xl': 1920,
  'md-max': 896,
  'xl-min': 1292,
  'xl-max': 1418,
  '2xl-min': 1529,
  'screen-860': 860,
}

const screens = Object.keys(screenMap).reduce((memo, key) => {
  memo[key] = `${screenMap[key]}px`
  memo[`max-${key}`] = { max: `${screenMap[key]}px` }
  return memo
}, {})

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens,
    extend: {
      fontFamily: {
        sans: [
          'PingFang SC',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },

      colors: {
        brand: {
          DEFAULT: '#37A0FF',
          primary: '#37A0FF',
          secondary: '#EBF5FF',
        },

        market: {
          up: '#FF5000',
          down: '#00B99A',
        },

        'text-1': '#000000',
        'text-1-supplement': '#464F56',
        'text-2': '#82888D',
        'text-3': '#AFB3B6',

        control: {
          'card-border': '#E2E3E4',
          divider: '#EAEBEC',
          background: '#F5F6F6',
        },

        frame: {
          card: '#FFFFFF',
          background: '#F8F9FA',
          header: '#F1F0F2',
        },

        button: {
          primary: '#37A0FF',
          'primary-hover': '#289DFC',
          border: '#C7CACC',
          disabled: '#C7CACC',
          'hover-overlay': 'rgba(234, 235, 236, 0.25)',
        },

        border: {
          DEFAULT: '#EAEBEC',
          card: '#E2E3E4',
          outline: '#C7C4CC',
        },

        page: '#F8F9FA',
        card: '#FFFFFF',
        surface: '#F5F6F6',

        canvas: 'var(--canvas, #F8F9FA)',
        ink: 'var(--ink, #000000)',
        muted: 'var(--muted, #82888D)',
        accent: 'var(--accent, #37A0FF)',
        'accent-strong': 'var(--accent-strong, #37A0FF)',
        'accent-soft': 'var(--accent-soft, rgba(55, 160, 255, 0.1))',
        panel: 'var(--panel, #FFFFFF)',
        'panel-border': 'var(--panel-border, #EAEBEC)',
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'xs-medium': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'sm-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'base': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'base-regular': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },

      boxShadow: {
        'drawer': '0 -2px 8px rgba(0, 0, 0, 0.08)',
        'panel': 'var(--shadow, 0 -2px 8px rgba(0, 0, 0, 0.08))',
      },

      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'lg-var': 'var(--radius-lg, 12px)',
        'md-var': 'var(--radius-md, 8px)',
        'sm-var': 'var(--radius-sm, 4px)',
      },

      spacing: {
      },
    },
  },
  plugins: [],
}
