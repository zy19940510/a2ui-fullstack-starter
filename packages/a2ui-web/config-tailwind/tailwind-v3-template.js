/**
 * Tailwind CSS v3 Design Tokens Template
 * 
 * 云溪专用 Design System
 * Source: https://www.figma.com/design/NnrCx3x3PVukxpFxxObdXg/云溪专用?node-id=23-18636
 * 
 * Usage:
 * 1. Copy this file to your project as tailwind.config.js
 * 2. Replace placeholder values with your design system tokens
 * 3. Run Tailwind build process
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  darkMode: ['class', '[data-theme="dark"]'],
  
  theme: {
    extend: {
      /* ============================================================
       * COLORS - 云溪专用设计规范
       * ============================================================ */
      colors: {
        /* --- 品牌色系 Brand Colors --- */
        brand: {
          DEFAULT: '#37A0FF',
          primary: '#37A0FF',
          secondary: '#EBF5FF',
        },

        /* --- 涨跌色系 Market Colors --- */
        market: {
          up: '#FF5000',
          down: '#00B99A',
        },

        /* --- 文本色系 Text Colors --- */
        'text-1': '#000000',
        'text-1-supplement': '#464F56',
        'text-2': '#82888D',
        'text-3': '#AFB3B6',

        /* --- 控件色系 Control Colors --- */
        control: {
          'card-border': '#E2E3E4',
          divider: '#EAEBEC',
          background: '#F5F6F6',
        },

        /* --- 框架色系 Frame Colors --- */
        frame: {
          card: '#FFFFFF',
          background: '#F8F9FA',
          header: '#F1F0F2',
        },

        /* --- 按钮色系 Button Colors --- */
        button: {
          primary: '#37A0FF',
          'primary-hover': '#289DFC',
          border: '#C7CACC',
          disabled: '#C7CACC',
          'hover-overlay': 'rgba(234, 235, 236, 0.25)',
        },

        /* --- 边框色系 Border Colors --- */
        border: {
          DEFAULT: '#EAEBEC',
          card: '#E2E3E4',
          outline: '#C7C4CC',
        },

        /* --- 语义化别名 Semantic Aliases --- */
        page: '#F8F9FA',
        card: '#FFFFFF',
        surface: '#F5F6F6',

        /* --- CSS 变量主题 Theme Variables --- */
        canvas: 'var(--canvas, #F8F9FA)',
        ink: 'var(--ink, #000000)',
        muted: 'var(--muted, #82888D)',
        accent: 'var(--accent, #37A0FF)',
        'accent-strong': 'var(--accent-strong, #37A0FF)',
        'accent-soft': 'var(--accent-soft, rgba(55, 160, 255, 0.1))',
        panel: 'var(--panel, #FFFFFF)',
        'panel-border': 'var(--panel-border, #EAEBEC)',

        /* --- 暗色模式基础色 --- */
        'dark-0': '#1C1C28',
      },
      
      /* ============================================================
       * TYPOGRAPHY - 字体规范
       * ============================================================ */
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

      fontSize: {
        'xs': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'xs-medium': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'sm-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'base': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'base-regular': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
      
      /* ============================================================
       * BORDER RADIUS - 圆角规范
       * ============================================================ */
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'lg-var': 'var(--radius-lg, 12px)',
        'md-var': 'var(--radius-md, 8px)',
        'sm-var': 'var(--radius-sm, 4px)',
      },
      
      /* ============================================================
       * SHADOWS - 阴影规范
       * ============================================================ */
      boxShadow: {
        'drawer': '0 -2px 8px rgba(0, 0, 0, 0.08)',
        'panel': 'var(--shadow, 0 -2px 8px rgba(0, 0, 0, 0.08))',
      },

      /* ============================================================
       * SPACING - 间距规范 (使用 Tailwind 默认)
       * ============================================================ */
      spacing: {},
    },
  },
  
  plugins: [],
}
