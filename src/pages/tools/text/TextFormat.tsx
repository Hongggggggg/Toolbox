import React, { useState, useCallback, useMemo } from 'react';
import { Card, Typography, Radio, message } from 'antd';
import styles from './TextFormat.module.css';
import BasePage from '../../../components/layout/BasePage';

const { Title } = Typography;

// 最大文本长度限制（字符数）
const MAX_TEXT_LENGTH = 10000;

// 格式化类型
type FormatType = 'uppercase' | 'lowercase' | 'capitalize';

/**
 * 英文格式化工具组件
 */
const TextFormat: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState<string>('');
  const [formatType, setFormatType] = useState<FormatType>('uppercase');

  /**
   * 处理文本输入变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_TEXT_LENGTH) {
      message.warning('文本长度超出限制');
      return;
    }
    setInputText(newText);
  }, []);

  /**
   * 处理格式化类型变化
   */
  const handleFormatTypeChange = useCallback((e: any) => {
    setFormatType(e.target.value as FormatType);
  }, []);

  /**
   * 格式化文本
   */
  const formattedText = useMemo(() => {
    if (!inputText) return '';

    switch (formatType) {
      case 'uppercase':
        return inputText.toUpperCase();
      case 'lowercase':
        return inputText.toLowerCase();
      case 'capitalize':
        // 将文本按句子分割，每个句子首字母大写
        return inputText
          .toLowerCase()
          .replace(/(^|\.\s+|\!\s+|\?\s+)([a-z])/g, (match, p1, p2) => 
            p1 + p2.toUpperCase()
          );
      default:
        return inputText;
    }
  }, [inputText, formatType]);

  // 计算字符数
  const charCount = useMemo(() => inputText.length, [inputText]);

  return (
    <BasePage>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card title={
          <Title level={4} className="mb-0 text-lg bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            英文格式化工具
          </Title>
        }>
          <div className={styles.formatOptions}>
            <Radio.Group value={formatType} onChange={handleFormatTypeChange}>
              <Radio.Button value="uppercase">全部大写</Radio.Button>
              <Radio.Button value="lowercase">全部小写</Radio.Button>
              <Radio.Button value="capitalize">句首大写</Radio.Button>
            </Radio.Group>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={styles.subtitle}>输入文本</h2>
                <span className={`text-xs ${charCount > MAX_TEXT_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount}/{MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                className={styles.textarea}
                value={inputText}
                onChange={handleInputChange}
                placeholder="请输入需要格式化的英文文本..."
                spellCheck={false}
                maxLength={MAX_TEXT_LENGTH}
              />
            </div>
            
            <div className={styles.inputWrapper}>
              <h2 className={styles.subtitle}>格式化结果</h2>
              <textarea
                className={styles.textarea}
                value={formattedText}
                readOnly
                placeholder="格式化后的文本将显示在这里..."
                spellCheck={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </BasePage>
  );
};

export default TextFormat; 