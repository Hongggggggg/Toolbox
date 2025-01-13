import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 内联 SVG 图标组件集合
 * 使用 Lucide Icons 的设计风格
 * 统一使用 currentColor 以支持动态颜色变化
 */
const icons = {
  // 图片编辑图标
  image: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
      <circle cx="9" cy="9" r="2"></circle>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
    </svg>
  ),
  // 魔法棒图标（用于滤镜效果）
  wand: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 4-3 3 3 3-3 3 3 3-3 3"></path>
      <path d="m9 4 3 3-3 3 3 3-3 3 3 3"></path>
    </svg>
  ),
  // 九宫格图标
  grid: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
      <path d="M3 9h18"></path>
      <path d="M3 15h18"></path>
      <path d="M9 3v18"></path>
      <path d="M15 3v18"></path>
    </svg>
  ),
  // 文字识别图标
  fileText: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" x2="8" y1="13" y2="13"></line>
      <line x1="16" x2="8" y1="17" y2="17"></line>
      <line x1="10" x2="8" y1="9" y2="9"></line>
    </svg>
  ),
  // 图片拼接图标
  images: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-2"></path>
      <path d="M18 8h4v8h-4"></path>
      <path d="m15 8-3 3-3-3"></path>
    </svg>
  ),
};

/**
 * 功能特性数据配置
 * 包含每个功能的名称、描述、图标和跳转链接
 */
const features = [
  {
    name: '基础编辑',
    description: '提供裁剪、旋转、调整大小等基础图片编辑功能',
    icon: icons.image,
    to: '/image-editor',
  },
  {
    name: '滤镜效果',
    description: '丰富的滤镜效果，一键实现专业级照片处理',
    icon: icons.wand,
    to: '/image-editor',
  },
  {
    name: '九宫格',
    description: '轻松将图片切割成九宫格，完美适配社交媒体',
    icon: icons.grid,
    to: '/image-editor',
  },
  {
    name: '文字识别',
    description: '智能OCR文字识别，快速提取图片中的文字内容',
    icon: icons.fileText,
    to: '/image-editor',
  },
  {
    name: '图片拼接',
    description: '多张图片拼接，支持自定义布局和样式',
    icon: icons.images,
    to: '/image-editor',
  },
];

/**
 * 功能特性网格组件
 * 展示所有可用的图片处理功能
 */
const FeatureGrid = () => {
  return (
    <div className="relative py-12 sm:py-16 lg:py-20 bg-white" id="features">
      {/* 背景装饰：点阵图案和渐变遮罩 */}
      <div className="absolute inset-0">
        {/* 点阵背景 */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>
      
      {/* 内容容器 */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            功能特性
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 max-w-2xl mx-auto">
            专业的图片处理工具，满足您的各种创作需求
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.to}
              className="relative flex flex-col group rounded-xl bg-white p-6 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md ring-1 ring-gray-200"
            >
              {/* 卡片头部：图标和标题 */}
              <div className="flex items-center gap-4">
                {/* 图标容器 */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <div className="text-indigo-600">{feature.icon}</div>
                </div>
                {/* 功能名称 */}
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.name}
                </h3>
              </div>
              {/* 功能描述 */}
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
              {/* 操作按钮 */}
              <div className="mt-3 flex items-center text-sm font-medium text-indigo-600">
                <span>立即使用</span>
                {/* 箭头图标 */}
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;