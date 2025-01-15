import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Tabs, Upload, Progress } from 'antd';
import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import crypto from 'crypto-js';
import styles from './MD5.module.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

// 定义分块大小：2MB
const CHUNK_SIZE = 2 * 1024 * 1024;
// 最大文件大小：500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

const MD5: React.FC = () => {
  const [input, setInput] = useState('');
  const [md5Result, setMd5Result] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculateTextMD5 = () => {
    if (!input.trim()) {
      message.warning('请输入需要计算MD5的文本');
      return;
    }
    const hash = crypto.MD5(input).toString();
    setMd5Result(hash);
  };

  const calculateFileMD5 = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.error('文件对象无效');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      message.error('文件大小超过500MB限制');
      return;
    }

    setCalculating(true);
    setMd5Result('');
    setProgress(0);

    try {
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      let currentChunk = 0;
      let md5Hash = crypto.algo.MD5.create();

      const processChunk = async () => {
        const start = currentChunk * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              if (e.target?.result) {
                const wordArray = crypto.lib.WordArray.create(e.target.result as any);
                md5Hash.update(wordArray);
                currentChunk++;
                const progress = Math.round((currentChunk / chunks) * 100);
                setProgress(progress);
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(chunk);
        });
      };

      while (currentChunk < chunks) {
        await processChunk();
      }

      const hash = md5Hash.finalize();
      setMd5Result(hash.toString());
    } catch (error) {
      console.error('处理文件错误:', error);
      message.error('处理文件时发生错误');
    } finally {
      setCalculating(false);
      setProgress(0);
    }
  };

  const handleFileChange = (info: any) => {
    const file = info.file;
    if (file.size > MAX_FILE_SIZE) {
      message.error('文件大小超过500MB限制');
      return;
    }
    setFileList(info.fileList.slice(-1));
    setMd5Result('');
    setProgress(0);
  };

  const copyToClipboard = () => {
    if (!md5Result) {
      message.warning('没有可复制的MD5值');
      return;
    }
    navigator.clipboard.writeText(md5Result)
      .then(() => message.success('MD5值已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'));
  };

  const items = [
    {
      key: '1',
      label: '文本MD5',
      children: (
        <div className={styles.content}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入需要计算MD5的文本"
            rows={6}
            className={styles.textarea}
          />
          <Button type="primary" onClick={calculateTextMD5} className={styles.button}>
            计算MD5
          </Button>
        </div>
      ),
    },
    {
      key: '2',
      label: '文件MD5',
      children: (
        <div className={styles.content}>
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>
              选择文件
            </Button>
          </Upload>
          <Text type="secondary" className={styles.sizeLimit}>
            支持最大500MB的文件
          </Text>
          <Button 
            type="primary" 
            onClick={calculateFileMD5} 
            loading={calculating}
            disabled={fileList.length === 0}
            className={styles.button}
          >
            计算文件MD5
          </Button>
          {calculating && (
            <Progress percent={progress} status="active" />
          )}
          {fileList.length > 0 && (
            <div className={styles.fileInfo}>
              文件名：{fileList[0].name}
              <br />
              大小：{(fileList[0].size! / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <Title level={2}>MD5计算器</Title>
        <Tabs items={items} />
        {md5Result && (
          <div className={styles.result}>
            <Input
              value={md5Result}
              readOnly
              addonAfter={
                <CopyOutlined onClick={copyToClipboard} className={styles.copyIcon} />
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default MD5; 