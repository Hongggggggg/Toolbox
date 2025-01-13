/**
 * 主题颜色配置
 */
export const colors = {
  primary: {
    main: 'rgb(79,70,228)',
    light: 'rgba(79,70,228,0.1)',
    hover: 'rgba(79,70,228,0.9)',
  },
  text: {
    primary: '#1f2937',   // gray-800
    secondary: '#4b5563', // gray-600
    light: '#6b7280',     // gray-500
  },
  background: {
    main: '#ffffff',
    overlay: 'rgba(0,0,0,0.2)',
    hover: '#f3f4f6',     // gray-100
  },
  border: {
    main: '#e5e7eb',      // gray-200
  },
  shadow: {
    sm: '0 2px 8px -3px rgba(6,24,44,0.04), 0 4px 12px -2px rgba(6,24,44,0.03)',
    md: '0 8px 24px -4px rgba(6,24,44,0.08), 0 8px 28px -6px rgba(6,24,44,0.04)',
  }
} as const;

/**
 * 获取颜色值的辅助函数
 */
export const getColor = (path: string) => {
  return path.split('.').reduce((obj, key) => obj[key], colors as any);
}; 