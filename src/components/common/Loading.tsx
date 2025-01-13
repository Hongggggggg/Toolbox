import React from 'react';
import { BaseComponentProps, LoadingState } from '../../types/common';
import { colors } from '../../theme/colors';

/**
 * 加载组件属性接口
 */
interface LoadingProps extends BaseComponentProps, LoadingState {
  /** 加载提示文本 */
  message?: string;
  /** 是否显示进度条 */
  showProgress?: boolean;
}

/**
 * 加载状态组件
 * 用于展示加载中的状态和进度
 */
const Loading: React.FC<LoadingProps> = ({
  isLoading,
  progress = 0,
  message = '加载中...',
  showProgress = false,
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center">
      {/* 加载动画 */}
      <div className="relative w-12 h-12 mb-4">
        <div
          className="absolute w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${colors.primary.light} transparent transparent transparent` }}
        />
      </div>

      {/* 加载提示文本 */}
      <p className="text-gray-600 mb-2">{message}</p>

      {/* 进度条 */}
      {showProgress && (
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.primary.main,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Loading; 