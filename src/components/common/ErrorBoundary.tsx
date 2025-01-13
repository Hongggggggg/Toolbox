import React, { Component, ErrorInfo } from 'react';
import { BaseComponentProps, ErrorState } from '../../types/common';
import { colors } from '../../theme/colors';

/**
 * 错误边界组件属性接口
 */
interface ErrorBoundaryProps extends BaseComponentProps {
  /** 自定义错误回调函数 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 自定义错误展示组件 */
  fallback?: React.ReactNode;
}

/**
 * 默认错误展示组件
 */
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-white px-4">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        出错了
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || '发生了一些错误，请稍后再试'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        style={{ borderColor: colors.border.main }}
      >
        刷新页面
      </button>
    </div>
  </div>
);

/**
 * 错误边界组件
 * 用于捕获子组件中的 JavaScript 错误
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo);
    
    // 可以在这里添加错误上报逻辑
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || <DefaultErrorFallback error={error!} />;
    }

    return children;
  }
}

export default ErrorBoundary; 