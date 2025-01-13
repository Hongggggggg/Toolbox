import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BaseComponentProps } from '../../types/common';
import { colors } from '../../theme/colors';
import { toolCategories } from '../../data/tools';

/**
 * 侧边栏组件属性接口
 */
interface SidebarProps extends BaseComponentProps {
  /** 是否展开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 样式配置
 */
const styles = {
  overlay: `fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`,
  sidebar: `fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out`,
  header: `flex items-center h-16 px-6 border-b`,
  closeButton: `lg:hidden p-2 mr-2 rounded-lg transition-colors text-gray-500 
               hover:bg-gray-100 hover:text-gray-700`,
  logo: {
    container: `flex items-center gap-3`,
    text: `text-xl font-semibold text-primary-main`,
  },
  nav: `h-[calc(100%-4rem)] overflow-y-auto py-6`,
  categoryList: `space-y-2 px-4`,
  categoryLink: (isActive: boolean) => `
    flex items-center gap-4 px-4 py-3.5 text-base font-medium rounded-lg 
    transition-colors duration-300
    ${isActive 
      ? 'text-primary-main bg-primary-light'
      : 'text-gray-600 hover:text-primary-main hover:bg-primary-light'
    }
  `,
  iconContainer: `flex h-6 w-6 items-center justify-center`
};

/**
 * Logo 组件
 */
const Logo: React.FC = () => (
  <svg
    className="w-7 h-7"
    style={{ color: colors.primary.main }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/**
 * 获取图标组件
 */
const getIcon = (iconName: string): React.ReactNode => {
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
      <svg xmlns="http://www.w3.org/20
      00/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  };
  return icons[iconName] || null;
};

/**
 * 侧边栏组件
 * 提供应用的主要导航功能
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  /**
   * 判断分类是否处于激活状态
   */
  const isActiveCategory = useCallback((path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* 侧边栏主体 */}
      <div 
        className={`${styles.sidebar} ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* 顶部区域：Logo 和移动端菜单按钮 */}
        <div className={styles.header}>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className={styles.logo.container}>
            <Logo />
            <span className={styles.logo.text}>
              工具箱
            </span>
          </Link>
        </div>

        {/* 导航区域 */}
        <nav className={styles.nav}>
          <div className={styles.categoryList}>
            {toolCategories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                className={styles.categoryLink(isActiveCategory(category.path))}
                onClick={onClose}
              >
                <div className={styles.iconContainer}>
                  {getIcon(category.icon)}
                </div>
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 