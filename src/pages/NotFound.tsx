import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 页面组件
 * 当访问不存在的路由时显示
 */
const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">页面未找到</h2>
          <p className="mt-2 text-base text-gray-600">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 