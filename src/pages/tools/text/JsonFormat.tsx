import React, { useState, useCallback, useMemo } from 'react';
import { Card, Typography, Radio, message, InputNumber, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './JsonFormat.module.css';
import BasePage from '../../../components/layout/BasePage';

const { Title } = Typography;

// 最大文本长度限制（字符数）
const MAX_TEXT_LENGTH = 1000000;

// 格式化类型
type FormatType = 'format' | 'compress';

/**
 * JSON格式化工具组件
 */
const JsonFormat: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState<string>('');
  const [formatType, setFormatType] = useState<FormatType>('format');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [error, setError] = useState<string>('');

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
    setError('');
  }, []);

  /**
   * 处理格式化类型变化
   */
  const handleFormatTypeChange = useCallback((e: any) => {
    setFormatType(e.target.value as FormatType);
  }, []);

  /**
   * 处理缩进大小变化
   */
  const handleIndentSizeChange = useCallback((value: number | null) => {
    if (value !== null) {
      setIndentSize(value);
    }
  }, []);

  /**
   * 格式化JSON文本
   */
  const formattedText = useMemo(() => {
    if (!inputText) return '';

    try {
      // 首先解析JSON以验证其有效性
      const parsedJson = JSON.parse(inputText);

      // 根据选择的格式类型进行格式化
      if (formatType === 'format') {
        return JSON.stringify(parsedJson, null, indentSize);
      } else {
        return JSON.stringify(parsedJson);
      }
    } catch (err) {
      setError((err as Error).message);
      return '';
    }
  }, [inputText, formatType, indentSize]);

  /**
   * 复制格式化结果到剪贴板
   */
  const copyToClipboard = useCallback(() => {
    if (!formattedText) {
      message.warning('没有可复制的内容');
      return;
    }
    navigator.clipboard.writeText(formattedText)
      .then(() => message.success('已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'));
  }, [formattedText]);

  // 计算字符数
  const charCount = useMemo(() => inputText.length, [inputText]);

  return (
    <BasePage>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card title={
          <Title level={4} className="mb-0 text-lg bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            JSON格式化工具
          </Title>
        }>
          <div className={styles.controls}>
            <div className={styles.formatOptions}>
              <Radio.Group value={formatType} onChange={handleFormatTypeChange}>
                <Radio.Button value="format">格式化</Radio.Button>
                <Radio.Button value="compress">压缩</Radio.Button>
              </Radio.Group>
            </div>

            {formatType === 'format' && (
              <div className={styles.indentControl}>
                <span>缩进空格数:</span>
                <InputNumber
                  min={1}
                  max={8}
                  value={indentSize}
                  onChange={handleIndentSizeChange}
                  className={styles.numberInput}
                />
              </div>
            )}
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={styles.subtitle}>输入JSON</h2>
                <span className={`text-xs ${charCount > MAX_TEXT_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount}/{MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                className={styles.textarea}
                value={inputText}
                onChange={handleInputChange}
                placeholder="请输入需要格式化的JSON文本..."
                spellCheck={false}
                maxLength={MAX_TEXT_LENGTH}
              />
              {error && <div className={styles.errorText}>错误: {error}</div>}
            </div>
            
            <div className={styles.inputWrapper}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={styles.subtitle}>格式化结果</h2>
                {formattedText && (
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    复制
                  </Button>
                )}
              </div>
              <textarea
                className={styles.textarea}
                value={formattedText}
                readOnly
                placeholder="格式化后的JSON将显示在这里..."
                spellCheck={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </BasePage>
  );
};

export default JsonFormat; 