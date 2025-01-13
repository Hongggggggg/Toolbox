import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { BaseComponentProps } from '../../types/common';

/**
 * 布局组件
 * 包含导航栏和侧边栏
 */
const Layout: React.FC<BaseComponentProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout; 