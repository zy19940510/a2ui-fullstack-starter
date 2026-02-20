/**
 * A2UI Icon Component - 标准图标组件
 *
 * 封装 lucide-react 图标库，提供数据驱动的图标渲染
 * 作为 A2UI 标准组件库的一部分，所有项目都可以直接使用
 *
 * 特点：
 * - 支持 60+ 常用 lucide-react 图标
 * - 数据绑定（name、size、className、color）
 * - 完全符合 A2UI 0.8 协议
 * - SSR 安全
 *
 * A2UI 协议支持：
 * - name: 图标名称（literalString 或 path）
 * - size: 图标尺寸（literalNumber 或 path，默认 20）
 * - className: 自定义样式类（literalString 或 path）
 * - color: 图标颜色（literalString 或 path，默认 currentColor）
 */

import * as LucideIcons from '@a2ui-web/animations/icons'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'

// 图标映射表 - 包含所有常用图标
const iconMap: Record<string, typeof LucideIcons.Search> = {
  // 导航和操作
  search: LucideIcons.Search,
  globe: LucideIcons.Globe,
  menu: LucideIcons.Menu,
  x: LucideIcons.X,
  home: LucideIcons.Home,
  settings: LucideIcons.Settings,
  moreHorizontal: LucideIcons.MoreHorizontal,
  moreVertical: LucideIcons.MoreVertical,

  // 箭头
  arrowLeft: LucideIcons.ArrowLeft,
  arrowRight: LucideIcons.ArrowRight,
  arrowUp: LucideIcons.ArrowUp,
  arrowDown: LucideIcons.ArrowDown,
  chevronLeft: LucideIcons.ChevronLeft,
  chevronRight: LucideIcons.ChevronRight,
  chevronUp: LucideIcons.ChevronUp,
  chevronDown: LucideIcons.ChevronDown,

  // 用户和账户
  user: LucideIcons.User,
  users: LucideIcons.Users,
  userPlus: LucideIcons.UserPlus,
  userMinus: LucideIcons.UserMinus,
  userCheck: LucideIcons.UserCheck,

  // 文件和文档
  file: LucideIcons.File,
  fileText: LucideIcons.FileText,
  folder: LucideIcons.Folder,
  folderOpen: LucideIcons.FolderOpen,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,

  // 编辑和操作
  edit: LucideIcons.Edit,
  edit2: LucideIcons.Edit2,
  edit3: LucideIcons.Edit3,
  trash: LucideIcons.Trash,
  trash2: LucideIcons.Trash2,
  copy: LucideIcons.Copy,
  check: LucideIcons.Check,
  checkCircle: LucideIcons.CheckCircle,
  plus: LucideIcons.Plus,
  minus: LucideIcons.Minus,

  // 通知和状态
  bell: LucideIcons.Bell,
  bellOff: LucideIcons.BellOff,
  alertCircle: LucideIcons.AlertCircle,
  alertTriangle: LucideIcons.AlertTriangle,
  info: LucideIcons.Info,
  helpCircle: LucideIcons.HelpCircle,

  // 社交和通信
  mail: LucideIcons.Mail,
  messageCircle: LucideIcons.MessageCircle,
  messageSquare: LucideIcons.MessageSquare,
  phone: LucideIcons.Phone,
  share: LucideIcons.Share,
  share2: LucideIcons.Share2,

  // 媒体
  image: LucideIcons.Image,
  video: LucideIcons.Video,
  music: LucideIcons.Music,
  camera: LucideIcons.Camera,
  play: LucideIcons.Play,
  pause: LucideIcons.Pause,
  skipBack: LucideIcons.SkipBack,
  skipForward: LucideIcons.SkipForward,

  // 工具
  calendar: LucideIcons.Calendar,
  clock: LucideIcons.Clock,
  bookmark: LucideIcons.Bookmark,
  link: LucideIcons.Link,
  link2: LucideIcons.Link2,
  externalLink: LucideIcons.ExternalLink,
  paperclip: LucideIcons.Paperclip,

  // 界面元素
  heart: LucideIcons.Heart,
  star: LucideIcons.Star,
  eye: LucideIcons.Eye,
  eyeOff: LucideIcons.EyeOff,
  lock: LucideIcons.Lock,
  unlock: LucideIcons.Unlock,
  filter: LucideIcons.Filter,
  sliders: LucideIcons.Sliders,

  // 商业和购物
  shoppingCart: LucideIcons.ShoppingCart,
  shoppingBag: LucideIcons.ShoppingBag,
  creditCard: LucideIcons.CreditCard,
  dollarSign: LucideIcons.DollarSign,

  // 技术
  code: LucideIcons.Code,
  terminal: LucideIcons.Terminal,
  database: LucideIcons.Database,
  server: LucideIcons.Server,
  gitBranch: LucideIcons.GitBranch,
  github: LucideIcons.Github,

  // 其他
  sun: LucideIcons.Sun,
  moon: LucideIcons.Moon,
  zap: LucideIcons.Zap,
  wifi: LucideIcons.Wifi,
  wifiOff: LucideIcons.WifiOff,
  battery: LucideIcons.Battery,
  loader: LucideIcons.Loader,
  loader2: LucideIcons.Loader2,
}

export type IconName = keyof typeof iconMap

/**
 * A2UIIcon - A2UI 标准图标组件
 *
 * 使用示例（在 A2UI 消息中）：
 * ```typescript
 * {
 *   id: "my-icon",
 *   component: {
 *     Icon: {
 *       name: { literalString: "search" },
 *       size: { literalNumber: 24 },
 *       className: { literalString: "text-blue-500" },
 *     },
 *   },
 * }
 * ```
 *
 * 支持数据绑定：
 * ```typescript
 * {
 *   id: "dynamic-icon",
 *   component: {
 *     Icon: {
 *       name: { path: "/ui/iconName" },
 *       size: { path: "/ui/iconSize" },
 *     },
 *   },
 * }
 * ```
 */
export function A2UIIcon(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const name = useA2UIValue<IconName>(
    componentProps.name,
    'search',
    processor,
    component,
    surfaceId,
  )

  const size = useA2UIValue<number>(
    componentProps.size,
    20,
    processor,
    component,
    surfaceId,
  )

  const className = useA2UIValue<string>(
    componentProps.className,
    '',
    processor,
    component,
    surfaceId,
  )

  const color = useA2UIValue<string>(
    componentProps.color,
    'currentColor',
    processor,
    component,
    surfaceId,
  )

  // 获取图标组件
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(
      `[A2UIIcon] Icon "${name}" not found in iconMap. Available icons:`,
      Object.keys(iconMap).slice(0, 10).join(', ') + '...',
    )
    // 降级显示默认图标
    const DefaultIcon = iconMap.search
    return (
      <DefaultIcon
        className={className}
        size={size}
        color={color}
        aria-hidden="true"
        data-component-id={component.id}
        data-icon-name={name}
        data-icon-error="not-found"
      />
    )
  }

  return (
    <IconComponent
      className={className}
      size={size}
      color={color}
      aria-hidden="true"
      data-component-id={component.id}
      data-icon-name={name}
    />
  )
}

// 导出可用的图标列表
export const availableIcons = Object.keys(iconMap) as IconName[]
