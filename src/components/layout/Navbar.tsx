import React from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

/**
 * 导航栏组件
 */
const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30 lg:pl-64">
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        <button
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg"
          onClick={onMenuClick}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => {/* TODO: 处理登录 */}}
          >
            登录
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-primary-main hover:bg-primary-hover rounded-lg transition-colors"
            onClick={() => {/* TODO: 处理注册 */}}
          >
            注册
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;