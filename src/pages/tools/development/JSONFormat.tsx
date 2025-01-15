import React, { useState } from 'react';
import { Card, Input, Button, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './JSONFormat.module.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const MAX_LENGTH = 5000;

const JSONFormat: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setInput(value);
    }
  };

  const formatJSON = () => {
    if (!input.trim()) return;

    try {
      const parsedJSON = JSON.parse(input);
      const formattedJSON = JSON.stringify(parsedJSON, null, 4);
      setOutput(formattedJSON);
    } catch (error) {
      setOutput('无效的JSON格式，请检查输入');
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) return;

    try {
      const parsedJSON = JSON.parse(input);
      const minifiedJSON = JSON.stringify(parsedJSON);
      setOutput(minifiedJSON);
    } catch (error) {
      setOutput('无效的JSON格式，请检查输入');
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  return (
    <div className={styles.container}>
      <Card bordered={false}>
        <Title level={3}>JSON格式化工具</Title>
        <div className={styles.editorContainer}>
          <div className={styles.inputSection}>
            <div className={styles.buttonGroup}>
              <Button type="primary" onClick={formatJSON}>
                格式化
              </Button>
              <Button type="primary" onClick={minifyJSON}>
                压缩
              </Button>
              <Text type="secondary" className={styles.charCount}>
                {input.length}/{MAX_LENGTH}
              </Text>
            </div>
            <TextArea
              value={input}
              onChange={handleInputChange}
              placeholder="请输入需要处理的JSON文本"
              className={styles.jsonInput}
              rows={12}
              maxLength={MAX_LENGTH}
            />
          </div>
          <div className={styles.outputSection}>
            <TextArea
              value={output}
              readOnly
              className={styles.jsonOutput}
              rows={12}
              placeholder="格式化/压缩后的结果将显示在这里"
            />
            {output && (
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
                className={styles.copyButton}
              >
                复制结果
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JSONFormat; 