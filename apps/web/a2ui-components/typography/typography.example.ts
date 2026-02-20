/**
 * Typography Component Example Messages
 * 展示 Typography 组件的实际使用示例（与 example/next12-react17 中的使用方式一致）
 */

/**
 * Display 变体示例 - 用于大标题和英雄区域
 */
export const displayVariantsMessage = [
  {
    id: 'display-xl-demo',
    component: {
      Typography: {
        text: { literalString: 'Trading Growth' },
        variant: { literalString: 'display-xl' },
        color: { literalString: 'white' },
        as: { literalString: 'h1' },
      },
    },
  },
  {
    id: 'display-l-demo',
    component: {
      Typography: {
        text: { literalString: 'Market Overview' },
        variant: { literalString: 'display-l' },
        color: { literalString: 'white' },
        as: { literalString: 'h2' },
      },
    },
  },
  {
    id: 'display-m-demo',
    component: {
      Typography: {
        text: { literalString: 'Financial Platform' },
        variant: { literalString: 'display-m' },
        color: { literalString: 'white' },
        as: { literalString: 'h2' },
      },
    },
  },
  {
    id: 'display-s-demo',
    component: {
      Typography: {
        text: { literalString: 'Technology Excellence' },
        variant: { literalString: 'display-s' },
        color: { literalString: 'white' },
        as: { literalString: 'h2' },
      },
    },
  },
]

/**
 * Heading 变体示例 - 用于章节标题
 */
export const headingVariantsMessage = [
  {
    id: 'heading-xl-demo',
    component: {
      Typography: {
        text: { literalString: 'Section Heading XL' },
        variant: { literalString: 'heading-xl' },
        color: { literalString: 'white' },
        as: { literalString: 'h2' },
      },
    },
  },
  {
    id: 'heading-l-demo',
    component: {
      Typography: {
        text: { literalString: 'Section Heading L' },
        variant: { literalString: 'heading-l' },
        color: { literalString: 'white' },
        as: { literalString: 'h3' },
      },
    },
  },
  {
    id: 'heading-m-demo',
    component: {
      Typography: {
        text: { literalString: 'Section Heading M' },
        variant: { literalString: 'heading-m' },
        color: { literalString: 'white' },
        as: { literalString: 'h4' },
      },
    },
  },
  {
    id: 'heading-s-demo',
    component: {
      Typography: {
        text: { literalString: 'Section Heading S' },
        variant: { literalString: 'heading-s' },
        color: { literalString: 'white' },
        as: { literalString: 'h5' },
      },
    },
  },
  {
    id: 'heading-xs-demo',
    component: {
      Typography: {
        text: { literalString: 'Section Heading XS' },
        variant: { literalString: 'heading-xs' },
        color: { literalString: 'white' },
        as: { literalString: 'h6' },
      },
    },
  },
]

/**
 * Body & Utility 变体示例 - 用于正文和辅助文本
 */
export const bodyUtilityVariantsMessage = [
  {
    id: 'body-l-demo',
    component: {
      Typography: {
        text: {
          literalString:
            'Top 1 in trading growth for Hong Kong stocks among all technology brokers in Hong Kong. Experience the next generation of financial technology.',
        },
        variant: { literalString: 'body-l' },
        color: { literalString: 'muted' },
        as: { literalString: 'p' },
      },
    },
  },
  {
    id: 'body-m-demo',
    component: {
      Typography: {
        text: {
          literalString:
            'This is the default body text used throughout the application for standard content and descriptions.',
        },
        variant: { literalString: 'body-m' },
        color: { literalString: 'muted' },
        as: { literalString: 'p' },
      },
    },
  },
  {
    id: 'body-s-demo',
    component: {
      Typography: {
        text: {
          literalString: 'Smaller body text for secondary information and compact layouts.',
        },
        variant: { literalString: 'body-s' },
        color: { literalString: 'muted' },
        as: { literalString: 'p' },
      },
    },
  },
  {
    id: 'caption-demo',
    component: {
      Typography: {
        text: { literalString: 'Caption text for labels, timestamps, and metadata' },
        variant: { literalString: 'caption' },
        color: { literalString: 'muted' },
        as: { literalString: 'span' },
      },
    },
  },
  {
    id: 'overline-demo',
    component: {
      Typography: {
        text: { literalString: 'Category Label' },
        variant: { literalString: 'overline' },
        color: { literalString: 'muted' },
        as: { literalString: 'span' },
      },
    },
  },
]

/**
 * Live Demo 示例 - 组合使用多个变体
 */
export const liveDemoMessage = [
  {
    id: 'display-xl-live',
    component: {
      Typography: {
        text: { literalString: 'Trading Growth' },
        variant: { literalString: 'display-xl' },
        color: { literalString: 'white' },
        as: { literalString: 'h1' },
      },
    },
  },
  {
    id: 'heading-l-live',
    component: {
      Typography: {
        text: { literalString: 'Market Overview' },
        variant: { literalString: 'heading-l' },
        color: { literalString: 'white' },
        as: { literalString: 'h2' },
      },
    },
  },
  {
    id: 'body-l-live',
    component: {
      Typography: {
        text: {
          literalString:
            'Top 1 in trading growth for Hong Kong stocks among all technology brokers in Hong Kong. Experience the next generation of financial technology.',
        },
        variant: { literalString: 'body-l' },
        color: { literalString: 'muted' },
        as: { literalString: 'p' },
      },
    },
  },
]

/**
 * 完整的使用示例 - 演示如何在 A2UI surfaceUpdate 消息中使用
 *
 * @example
 * ```typescript
 * import { displayVariantsMessage } from '@a2ui-web/a2ui-react-renderer/a2ui-components/shadcnui/typography.example'
 *
 * processor.processMessages([
 *   {
 *     surfaceUpdate: {
 *       surfaceId: 'typography-demo',
 *       components: [
 *         {
 *           id: 'column',
 *           component: {
 *             Column: {
 *               children: { explicitList: ['display-xl-demo', 'display-l-demo', 'display-m-demo'] },
 *               distribution: { literalString: 'start' },
 *               alignment: { literalString: 'stretch' },
 *               gap: { literalNumber: 24 },
 *             },
 *           },
 *         },
 *         ...displayVariantsMessage,
 *       ],
 *     },
 *   },
 *   {
 *     beginRendering: {
 *       surfaceId: 'typography-demo',
 *       root: 'column',
 *     },
 *   },
 * ])
 * ```
 */

/**
 * 数据绑定示例 - 使用 path 从数据模型获取文本
 */
export const dataBindingExample = [
  {
    id: 'title',
    component: {
      Typography: {
        text: { path: 'article.title' },
        variant: { literalString: 'heading-l' },
        color: { literalString: 'white' },
        as: { literalString: 'h1' },
      },
    },
  },
  {
    id: 'author',
    component: {
      Typography: {
        text: { path: 'article.author' },
        variant: { literalString: 'caption' },
        color: { literalString: 'muted' },
        as: { literalString: 'span' },
      },
    },
  },
  {
    id: 'content',
    component: {
      Typography: {
        text: { path: 'article.content' },
        variant: { literalString: 'body-m' },
        as: { literalString: 'p' },
      },
    },
  },
]

/**
 * 所有可用的 variant 值
 */
export type TypographyVariant =
  | 'display-xl'  // 72px, Bold, -1.677px
  | 'display-l'   // 60px, Bold, -1.4px
  | 'display-m'   // 48px, Bold, -1.2px
  | 'display-s'   // 40px, Bold, -1px
  | 'heading-xl'  // 48px, Bold, 0.5px
  | 'heading-l'   // 36px, Bold, 0.37px
  | 'heading-m'   // 30px, Bold, 0.3px
  | 'heading-s'   // 24px, Bold, 0.25px
  | 'heading-xs'  // 20px, Bold, 0.2px
  | 'body-l'      // 18px, Light, -0.44px
  | 'body-m'      // 16px, Normal (默认)
  | 'body-s'      // 14px, Normal
  | 'caption'     // 12px, Normal
  | 'overline'    // 12px, Medium, Uppercase, 1px

/**
 * 所有可用的 color 值
 */
export type TypographyColor =
  | 'default'      // text-foreground
  | 'primary'      // text-primary
  | 'secondary'    // text-secondary-foreground
  | 'muted'        // text-muted-foreground
  | 'accent'       // text-accent-foreground
  | 'destructive'  // text-destructive
  | 'white'        // text-white
  | 'inherit'      // text-inherit

