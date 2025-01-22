export interface Tool {
  name: string;
  path: string;
  description: string;
  icon?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  path: string;
  icon: string;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'all',
    name: '全部工具',
    path: '/',
    icon: 'grid',
    tools: [],
  },
  {
    id: 'text',
    name: '文本工具',
    path: '/tools/text',
    icon: 'type',
    tools: [
      { name: '文本对比', path: '/tools/text/compare', description: '对比两段文本之间的差异，支持高亮显示不同之处' },
      { name: '英文格式化', path: '/tools/text/format', description: '英文文本格式化工具，支持全部大写、全部小写、句首大写等功能' },
    ],
  },
  {
    id: 'image',
    name: '图片工具',
    path: '/tools/image',
    icon: 'image',
    tools: [
      { name: '图片编辑', path: '/tools/image/editor', description: '提供旋转，调色，滤镜等基础图片编辑功能' },
      { name: '图片格式转换', path: '/tools/image/convert', description: '支持多种图片格式之间的转换，如PNG、JPG、WEBP等' },
      { name: '九宫格切图', path: '/tools/image/grid', description: '将图片分割成九宫格，适合社交媒体发布' },
      { name: '图片拼接', path: '/tools/image/merge', description: '多张图片拼接，支持横向和纵向拼接' },
      { name: '线稿提取', path: '/tools/image/sketch', description: '从图片中提取线条轮廓，生成清晰的线稿效果' },
      { name: '黑白转换', path: '/tools/image/grayscale', description: '将彩色图片转换为黑白效果，支持多种转换模式' },
      { name: '添加水印', path: '/tools/image/watermark', description: '为图片添加文字或图片水印，支持自定义位置和样式' },
      { name: '图片压缩', path: '/tools/image/compress', description: '压缩图片大小，支持批量处理' },
      { name: '图片缩放', path: '/tools/image/resize', description: '调整图片尺寸，支持等比例缩放和自定义尺寸' },
      { name: 'GIF拆分', path: '/tools/image/gif-split', description: 'GIF动图拆分为单帧图片，支持预览和批量导出' },
      { name: 'GIF合成', path: '/tools/image/gif-create', description: '将多张图片合成为GIF动图，支持自定义帧率和时长' },
    ],
  },
  {
    id: 'document',
    name: '文档工具',
    path: '/tools/document',
    icon: 'file-text',
    tools: [
      { name: 'PDF转图片', path: '/tools/document/pdf-to-image', description: '将PDF文档转换为高质量图片，支持批量转换和自定义设置' },
      { name: '图片转PDF', path: '/tools/document/image-to-pdf', description: '将多张图片合成为PDF文档，支持自定义页面大小和布局' },
      { name: 'Word转PDF', path: '/tools/document/word-to-pdf', description: '将Word文档转换为PDF格式，支持批量转换和格式设置' },
    ],
  },
  {
    id: 'audio',
    name: '音频工具',
    path: '/tools/audio',
    icon: 'music',
    tools: [
      { name: '音频编辑', path: '/tools/audio/editor', description: '剪辑、调整音量、添加特效等基础音频编辑功能' },
      { name: '格式转换', path: '/tools/audio/converter', description: '支持多种音频格式转换，保持音质' },
      { name: '音频合并', path: '/tools/audio/merge', description: '多个音频文件合并，可调整顺序和过渡效果' },
    ],
  },
  {
    id: 'video',
    name: '视频工具',
    path: '/tools/video',
    icon: 'video',
    tools: [
      { name: '视频编辑', path: '/tools/video/editor', description: '剪辑、添加字幕、调整速度等基础视频编辑功能' },
      { name: '格式转换', path: '/tools/video/converter', description: '支持多种视频格式转换，可自定义质量' },
      { name: '视频合并', path: '/tools/video/merge', description: '多个视频片段合并，支持添加转场效果' },
    ],
  },
  {
    id: 'life',
    name: '生活工具',
    path: '/tools/life',
    icon: 'check-circle',
    tools: [
      { name: '单位转换', path: '/tools/life/converter', description: '支持长度、面积、体积等多种单位转换' },
    ],
  },
  {
    id: 'development',
    name: '开发工具',
    path: '/tools/development',
    icon: 'code',
    tools: [
      { name: 'JSON格式化', path: '/tools/development/json-format', description: 'JSON数据格式化和验证工具' },
      { name: 'Base64转换', path: '/tools/development/base64', description: '支持文本和文件的Base64编码和解码' },
      { name: 'URL编解码', path: '/tools/development/url-codec', description: 'URL编码和解码工具' },
      { name: '时间戳转换', path: '/tools/development/timestamp', description: '时间戳和日期时间的相互转换' },
      { name: '正则测试', path: '/tools/development/regex', description: '正则表达式在线测试工具' },
      { name: 'MD5计算器', path: '/tools/development/md5', description: '快速计算文本的MD5哈希值，支持复制结果' },
    ],
  }
]; 