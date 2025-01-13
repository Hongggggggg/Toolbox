import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import InputField from '../common/InputField';

const RegisterForm = () => {
  // 表单状态管理
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // 获取认证上下文中的注册方法
  const { register } = useAuth();

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, username);
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 用户名输入框 */}
      <InputField
        icon={<User className="h-5 w-5" />}
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      {/* 邮箱输入框 */}
      <InputField
        icon={<Mail className="h-5 w-5" />}
        type="email"
        placeholder="邮箱地址"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      {/* 密码输入框 */}
      <InputField
        icon={<Lock className="h-5 w-5" />}
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* 注册按钮 */}
      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        注册
      </button>
    </form>
  );
};

export default RegisterForm;