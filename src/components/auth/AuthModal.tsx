import React from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// 定义认证模态框的属性类型
type AuthModalProps = {
  isOpen: boolean;          // 控制模态框显示/隐藏
  onClose: () => void;      // 关闭模态框的回调函数
  mode: 'login' | 'register'; // 模态框模式：登录/注册
  onSwitchMode: () => void;  // 切换模式的回调函数
};

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) => {
  // 如果模态框未打开，返回 null
  if (!isOpen) return null;

  return (
    // 模态框容器
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={onClose} />
        
        {/* 模态框内容 */}
        <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* 标题区域 */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {mode === 'login' ? '登录以使用所有功能' : '注册以开始使用我们的服务'}
            </p>
          </div>

          {/* 根据模式显示不同的表单 */}
          {mode === 'login' ? <LoginForm /> : <RegisterForm />}

          {/* 切换登录/注册的链接 */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
            </span>
            <button
              onClick={onSwitchMode}
              className="ml-1 text-indigo-600 hover:text-indigo-500"
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;