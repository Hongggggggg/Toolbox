import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 预加载的 SVG 图标组件
 */
// 魔法棒图标 - 用于"开始使用"按钮
const WandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 4-3 3 3 3-3 3 3 3-3 3"></path>
    <path d="m9 4 3 3-3 3 3 3-3 3 3 3"></path>
  </svg>
);

// 箭头图标 - 用于"了解更多"按钮
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

/**
 * Hero 组件 - 网站首页的主要展示区域
 * 包含标题、描述文本、操作按钮和图片预览
 */
const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/20 to-white">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.03] bg-[size:32px_32px]"></div>
      {/* 倾斜的背景装饰 */}
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50"></div>
      
      {/* 内容容器 */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文本内容 */}
            <div className="text-center lg:text-left">
              {/* 主标题 */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">在线图片工具箱</span>
                <span className="block mt-2 text-indigo-600">
                  让创作更简单
                </span>
              </h1>
              {/* 描述文本 */}
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto lg:mx-0">
                提供专业的图片处理工具，包括图片编辑、滤镜效果、九宫格切图、OCR文字识别等功能，让您的图片处理更加便捷。
              </p>
              {/* 操作按钮组 */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* 主要操作按钮 */}
                <Link
                  to="/image-editor"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <WandIcon />
                  <span className="ml-2">开始使用</span>
                </Link>
                {/* 次要操作按钮 */}
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl shadow-sm ring-1 ring-inset ring-gray-900/10 hover:ring-gray-900/20 transition-all duration-200"
                >
                  <span>了解更多</span>
                  <ArrowIcon />
                </a>
              </div>
            </div>

            {/* 右侧图片预览 */}
            <div className="relative lg:ml-8">
              <div className="relative mx-auto w-full max-w-lg">
                {/* 装饰性背景气泡 */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-4000"></div>
                {/* 图片容器 */}
                <div className="relative">
                  <div className="aspect-[4/3] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-gray-900/10">
                    {/* 顶部装饰线 */}
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-gray-500/0 via-gray-500/40 to-gray-500/0"></div>
                    {/* 预览图片 */}
                    <img
                      src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
                      alt="图片处理示例"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 过渡装饰元素 */}
        <div className="relative -mb-12 mt-4 flex justify-center">
          <div className="relative flex">
            {/* 水平分隔线 */}
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            {/* 中心圆点 */}
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-b from-gray-100 to-white p-[1px] ring-1 ring-gray-200">
              <div className="h-full w-full rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;