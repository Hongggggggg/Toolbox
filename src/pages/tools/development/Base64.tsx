import React, { useState, useCallback, useMemo } from 'react';
import { Card, Typography, Radio, message, Button, Input } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import BasePage from '../../../components/layout/BasePage';
import styles from './Base64.module.css';

const { Title } = Typography;
const { TextArea } = Input;

// 最大输入长度限制
const MAX_INPUT_LENGTH = 10000;

const Base64: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string>('');

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_INPUT_LENGTH) {
      message.warning('输入长度超出限制');
      return;
    }
    setInputText(newText);
    setError('');
  }, []);

  // 处理模式切换
  const handleModeChange = useCallback((e: RadioChangeEvent) => {
    setMode(e.target.value);
    setError('');
  }, []);

  // 计算结果
  const result = useMemo(() => {
    try {
      if (!inputText) return '';
      
      if (mode === 'encode') {
        // 编码时先将字符串转换为UTF-8编码，然后进行Base64编码
        return btoa(unescape(encodeURIComponent(inputText)));
      } else {
        // 解码时先进行Base64解码，然后将UTF-8编码转换为字符串
        return decodeURIComponent(escape(atob(inputText)));
      }
    } catch (err) {
      setError(mode === 'encode' ? '编码失败，请检查输入' : '解码失败，请确保输入为有效的Base64字符串');
      return '';
    }
  }, [inputText, mode]);

  // 复制结果到剪贴板
  const handleCopy = useCallback(async () => {
    if (!result) {
      message.warning('没有可复制的内容');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(result);
      message.success('已复制到剪贴板');
    } catch (err) {
      message.error('复制失败');
    }
  }, [result]);

  // 清空输入
  const handleClear = useCallback(() => {
    setInputText('');
    setError('');
  }, []);

  return (
    <BasePage>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card title={
          <Title level={4} className="mb-0 text-lg bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Base64 转换工具
          </Title>
        }>
          <div className={styles.container}>
            <div className={styles.controls}>
              <Radio.Group value={mode} onChange={handleModeChange}>
                <Radio.Button value="encode">编码</Radio.Button>
                <Radio.Button value="decode">解码</Radio.Button>
              </Radio.Group>
              
              <div className={styles.buttons}>
                <Button onClick={handleClear}>清空</Button>
                <Button 
                  type="primary" 
                  icon={<CopyOutlined />} 
                  onClick={handleCopy}
                  disabled={!result}
                >
                  复制结果
                </Button>
              </div>
            </div>

            <div className={styles.inputSection}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={styles.subtitle}>输入文本</h3>
                <span className={`text-xs ${inputText.length > MAX_INPUT_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {inputText.length}/{MAX_INPUT_LENGTH}
                </span>
              </div>
              <TextArea
                className={styles.textarea}
                value={inputText}
                onChange={handleInputChange}
                placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'}
                maxLength={MAX_INPUT_LENGTH}
                rows={6}
              />
            </div>

            <div className={styles.resultSection}>
              <h3 className={styles.subtitle}>转换结果</h3>
              {error ? (
                <div className={styles.error}>{error}</div>
              ) : (
                <div className={styles.result}>
                  {result || '等待输入...'}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </BasePage>
  );
};

export default Base64; 