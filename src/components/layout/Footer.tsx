import React from 'react';
import { Link } from 'react-router-dom';

// 内联 GitHub 图标
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 左侧 Logo 和描述 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                图片工具箱
              </h3>
              <p className="text-base text-gray-500 max-w-xs">
                提供专业的图片处理工具，让您的创作更加便捷高效。
              </p>
            </div>

            {/* 中间链接 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                功能
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    to="/image-editor"
                    className="text-base text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    图片编辑
                  </Link>
                </li>
                <li>
                  <Link
                    to="/image-editor"
                    className="text-base text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    滤镜效果
                  </Link>
                </li>
                <li>
                  <Link
                    to="/image-editor"
                    className="text-base text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    九宫格切图
                  </Link>
                </li>
              </ul>
            </div>

            {/* 右侧链接 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                关注我们
              </h3>
              <div className="mt-4">
                <a
                  href="https://github.com"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} 图片工具箱. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;