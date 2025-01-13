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
    
    // 将文本按行分割并处理
    diffs.forEach(([type, text]) => {
      // 保留换行符，使用正向预查确保换行符被保留在分割结果中
      const lines = text.split(/(?<=\n)/);
      
      lines.forEach((line) => {
        if (line === '') return;
        
        results.push({
          text: line,
          type: type === -1 ? 'delete' : type === 1 ? 'insert' : 'equal'
        });
      });
    });
    
    return results;
  };

  /**
   * 计算文本差异
   */
  const diffs = useMemo(() => {
    if (!leftText && !rightText) return [];
    
    const dmp = new diff_match_patch();
    // 设置更细粒度的差异检测
    dmp.Diff_Timeout = 2;
    dmp.Diff_EditCost = 4;

    // 确保文本以换行符结尾
    const normalizedLeftText = leftText.endsWith('\n') ? leftText : leftText + '\n';
    const normalizedRightText = rightText.endsWith('\n') ? rightText : rightText + '\n';

    // 计算差异
    const diff = dmp.diff_main(normalizedLeftText, normalizedRightText);
    dmp.diff_cleanupSemantic(diff);
    
    return processDiffs(diff);
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