import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import styles from './URLCodec.module.css';

const { TextArea } = Input;

const URLCodec: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (error) {
      message.error('URL编码失败，请检查输入内容');
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (error) {
      message.error('URL解码失败，请检查输入内容是否为有效的URL编码字符串');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      message.success('已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>URL编解码工具</h1>
      <div className={styles.description}>
        将文本进行URL编码或解码，支持Unicode字符。URL编码常用于处理URL中的特殊字符和非ASCII字符。
      </div>
      
      <div className={styles.inputSection}>
        <div className={styles.label}>输入文本：</div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入需要编码或解码的文本"
          className={styles.textarea}
          rows={6}
        />
      </div>

      <div className={styles.buttonGroup}>
        <Button type="primary" onClick={handleEncode}>
          URL编码
        </Button>
        <Button type="primary" onClick={handleDecode}>
          URL解码
        </Button>
        <Button onClick={handleClear}>
          清空
        </Button>
      </div>

      <div className={styles.outputSection}>
        <div className={styles.label}>输出结果：</div>
        <TextArea
          value={output}
          readOnly
          className={styles.textarea}
          rows={6}
        />
        <Button 
          type="primary"
          onClick={handleCopy}
          className={styles.copyButton}
          disabled={!output}
        >
          复制结果
        </Button>
      </div>
    </div>
  );
};

export default URLCodec; 