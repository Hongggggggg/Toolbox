import React, { useState, useCallback, useMemo } from 'react';
import { diff_match_patch, Diff } from 'diff-match-patch';
import styles from './TextCompare.module.css';
import BasePage from '../../../components/layout/BasePage';
import { Card, Typography, message } from 'antd';

const { Title } = Typography;

// 最大文本长度限制（字符数）
const MAX_TEXT_LENGTH = 10000;

/**
 * 文本对比结果类型
 */
interface DiffResult {
  text: string;
  type: 'delete' | 'insert' | 'equal';
  isNewline?: boolean;
}

/**
 * 文本对比组件
 * 提供两个文本输入框和对比结果显示
 */
const TextCompare: React.FC = () => {
  // 状态管理
  const [leftText, setLeftText] = useState<string>('');
  const [rightText, setRightText] = useState<string>('');

  /**
   * 处理差异结果，将换行符转换为独立的差异项
   */
  const processDiffs = (diffs: Array<[number, string]>): DiffResult[] => {
    const results: DiffResult[] = [];
    
    diffs.forEach(([type, text]) => {
      // 如果是空文本，直接跳过
      if (!text) return;

      // 将文本分割成行，但保留空行
      const lines = text.split(/(\n)/);
      
      lines.forEach((line, index) => {
        // 对于换行符，添加特殊标记
        if (line === '\n') {
          results.push({
            text: '↵\n',
            type: type === -1 ? 'delete' : type === 1 ? 'insert' : 'equal',
            isNewline: true
          });
          return;
        }

        // 对于非换行符的内容，即使是空字符串也要显示
        if (line !== '') {
          results.push({
            text: line,
            type: type === -1 ? 'delete' : type === 1 ? 'insert' : 'equal'
          });
        }
      });
    });
    
    return results;
  };

  /**
   * 计算文本差异
   */
  const diffs = useMemo(() => {
    const dmp = new diff_match_patch();
    
    // 如果两个文本都为空，返回空数组
    if (!leftText && !rightText) return [];

    // 将文本按行分割，并过滤掉空行
    const leftLines = leftText.split('\n').filter(line => line.trim() !== '');
    const rightLines = rightText.split('\n').filter(line => line.trim() !== '');
    
    const results: DiffResult[] = [];
    
    // 逐行比较差异
    const maxLines = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || '';
      const rightLine = rightLines[i] || '';
      
      if (leftLine === rightLine) {
        // 完全相同的行
        results.push({
          text: leftLine,
          type: 'equal'
        });
      } else {
        // 行内容不同，使用diff-match-patch进行详细比较
        const lineDiff = dmp.diff_main(leftLine, rightLine);
        dmp.diff_cleanupEfficiency(lineDiff);
        
        // 处理行内差异
        lineDiff.forEach(([type, text]) => {
          if (text) {
            results.push({
              text,
              type: type === -1 ? 'delete' : type === 1 ? 'insert' : 'equal'
            });
          }
        });
      }
      
      // 每行后添加换行符（除了最后一行）
      if (i < maxLines - 1) {
        results.push({
          text: '\n',
          type: 'equal'
        });
      }
    }
    
    return results;
  }, [leftText, rightText]);

  /**
   * 处理文本输入变化
   */
  const handleLeftTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_TEXT_LENGTH) {
      message.warning('文本长度超出限制');
      return;
    }
    setLeftText(newText);
  }, []);

  const handleRightTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_TEXT_LENGTH) {
      message.warning('文本长度超出限制');
      return;
    }
    setRightText(newText);
  }, []);

  // 计算左右文本框的字符数
  const leftCharCount = useMemo(() => leftText.length, [leftText]);
  const rightCharCount = useMemo(() => rightText.length, [rightText]);

  return (
    <BasePage>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card title={
          <Title level={4} className="mb-0 text-lg bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            文本对比工具
          </Title>
        }>
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={styles.subtitle}>原始文本</h2>
                <span className={`text-xs ${leftCharCount > MAX_TEXT_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {leftCharCount}/{MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                className={styles.textarea}
                value={leftText}
                onChange={handleLeftTextChange}
                placeholder="请输入原始文本..."
                spellCheck={false}
                wrap="off"
                maxLength={MAX_TEXT_LENGTH}
              />
            </div>
            
            <div className={styles.inputWrapper}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={styles.subtitle}>对比文本</h2>
                <span className={`text-xs ${rightCharCount > MAX_TEXT_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {rightCharCount}/{MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                className={styles.textarea}
                value={rightText}
                onChange={handleRightTextChange}
                placeholder="请输入对比文本..."
                spellCheck={false}
                wrap="off"
                maxLength={MAX_TEXT_LENGTH}
              />
            </div>
          </div>

          <div className={styles.resultContainer}>
            <h2 className={styles.subtitle}>对比结果</h2>
            <pre className={styles.diffResult}>
              {diffs.map((diff, index) => (
                <span
                  key={index}
                  className={`${styles.diffText} ${styles[diff.type]}`}
                >
                  {diff.text}
                </span>
              ))}
            </pre>
          </div>
        </Card>
      </div>
    </BasePage>
  );
};

export default TextCompare; 