import React, { InputHTMLAttributes } from 'react';

// 扩展 HTML 输入框属性，添加图标支持
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode; // 可选的图标组件
}

// 通用输入框组件
const InputField = ({ icon, ...props }: InputFieldProps) => {
  return (
    <div className="relative">
      {/* 如果有图标，显示在输入框左侧 */}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </div>
      )}
      {/* 输入框 */}
      <input
        {...props}
        className={`w-full rounded-lg border border-gray-300 bg-white py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          icon ? 'pl-10' : 'pl-3' // 根据是否有图标调整左内边距
        } pr-3`}
      />
    </div>
  );
};

export default InputField;