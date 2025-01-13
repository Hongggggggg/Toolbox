import { ReactNode } from 'react';

/**
 * 工具项接口
 */
export interface Tool {
  /** 工具名称 */
  name: string;
  /** 工具路径 */
  path: string;
  /** 工具描述 */
  description: string;
}

/**
 * 工具分类接口
 */
export interface Category {
  /** 分类唯一标识 */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类路径 */
  path: string;
  /** 分类图标 */
  icon: ReactNode;
  /** 分类下的工具列表 */
  tools: Tool[];
}

/**
 * 基础组件属性接口
 */
export interface BaseComponentProps {
  /** 子元素 */
  children?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 错误状态接口
 */
export interface ErrorState {
  /** 是否发生错误 */
  hasError: boolean;
  /** 错误信息 */
  error?: Error;
}

/**
 * 加载状态接口
 */
export interface LoadingState {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 加载进度（0-100） */
  progress?: number;
} 