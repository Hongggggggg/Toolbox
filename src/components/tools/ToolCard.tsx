import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 获取图标组件
 */
const getIcon = (iconName: string = 'grid'): React.ReactNode => {
  const icons: { [key: string]: React.ReactNode } = {
    'grid': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    'image': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
      </svg>
    ),
    'file-text': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" x2="8" y1="13" y2="13"></line>
        <line x1="16" x2="8" y1="17" y2="17"></line>
        <line x1="10" x2="8" y1="9" y2="9"></line>
      </svg>
    ),
    'music': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20"></path>
        <path d="M2 10h20"></path>
        <path d="M2 14h20"></path>
        <path d="M2 6h20"></path>
        <path d="M2 18h20"></path>
      </svg>
    ),
    'video': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
      </svg>
    ),
    'check-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    ),
    'code': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
  };
  return icons[iconName] || icons['grid'];
};

/**
 * 工具卡片组件属性接口
 */
interface ToolCardProps {
  /** 工具名称 */
  name: string;
  /** 工具路径 */
  path: string;
  /** 工具图标 */
  icon?: string;
  /** 工具描述 */
  description?: string;
}

/**
 * 工具卡片组件
 * 展示单个工具的信息，包括名称、图标和描述
 */
const ToolCard: React.FC<ToolCardProps> = ({ name, path, icon, description }) => {
  // 基础样式常量
  const baseStyles = {
    card: `group relative block p-6 bg-white rounded-xl border border-gray-200 
           shadow-[0_2px_8px_-3px_rgba(6,24,44,0.04),0_4px_12px_-2px_rgba(6,24,44,0.03)] 
           hover:shadow-[0_8px_24px_-4px_rgba(6,24,44,0.08),0_8px_28px_-6px_rgba(6,24,44,0.04)] 
           hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out`,
    iconContainer: `flex h-12 w-12 items-center justify-center rounded-xl 
                   bg-[rgb(79,70,228)]/[0.02] text-[rgb(79,70,228)] 
                   group-hover:bg-[rgb(79,70,228)]/90 group-hover:text-white 
                   transition-colors duration-500 shadow-md`,
    title: `text-lg font-semibold text-gray-800 group-hover:text-[rgb(79,70,228)]/90 
            transition-colors duration-300`,
    description: `text-sm text-gray-600 group-hover:text-gray-700 
                 transition-colors duration-300 leading-relaxed`
  };

  return (
    <Link to={path} className={baseStyles.card}>
      {/* 悬停效果 - 顶部渐变 */}
      <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                    group-hover:opacity-100 bg-gradient-to-br from-[rgb(79,70,228)]/[0.01] 
                    via-transparent to-transparent" />
      
      <div className="relative">
        {/* 标题区域 */}
        <div className="flex items-center gap-4 mb-4">
          <div className={baseStyles.iconContainer}>
            {getIcon(icon)}
          </div>
          <h3 className={baseStyles.title}>
            {name}
          </h3>
        </div>

        {/* 描述文本 */}
        {description && (
          <p className={baseStyles.description}>
            {description}
          </p>
        )}
      </div>

      {/* 悬停效果 - 边框光晕 */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r 
                    from-[rgb(79,70,228)]/[0.08] via-[rgb(79,70,228)]/[0.04] 
                    to-[rgb(79,70,228)]/[0.01] opacity-0 blur 
                    group-hover:opacity-100 transition duration-500" 
           style={{ zIndex: -1 }} />
    </Link>
  );
};

export default ToolCard; 