import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 基础页面组件属性接口
 */
interface BasePageProps {
  children: React.ReactNode;
}

/**
 * 基础页面布局组件
 * 提供统一的页面布局
 */
const BasePage: React.FC<BasePageProps> = ({ children }) => {
  const location = useLocation();
  const isToolsPage = location.pathname.startsWith('/tools');

  return (
    <div className={`min-h-screen bg-white ${isToolsPage ? 'lg:pl-64' : ''}`}>
      <div className="mx-auto pt-12 pb-16">
        {children}
      </div>
    </div>
  );
};

export default BasePage; 