import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Tabs, Radio, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './TimestampConverter.module.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');

  // 验证时间戳格式
  const isValidTimestamp = (value: string): boolean => {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num > 0;
  };

  // 更新当前时间戳
  const updateCurrentTimestamp = () => {
    const now = Date.now();
    setTimestamp(unit === 'seconds' ? Math.floor(now / 1000).toString() : now.toString());
  };

  // 时间戳转日期时间
  const convertTimestampToDateTime = () => {
    if (!timestamp.trim()) {
      message.warning('请输入时间戳');
      return;
    }

    if (!isValidTimestamp(timestamp)) {
      message.error('请输入有效的时间戳');
      return;
    }

    try {
      const timestampNum = parseInt(timestamp);
      const date = unit === 'seconds' 
        ? dayjs.unix(timestampNum)
        : dayjs(timestampNum);
      
      setDateTime(date.format('YYYY-MM-DD HH:mm:ss'));
    } catch (error) {
      message.error('转换失败，请检查输入');
    }
  };

  // 日期时间转时间戳
  const convertDateTimeToTimestamp = () => {
    if (!dateTime.trim()) {
      message.warning('请输入日期时间');
      return;
    }

    try {
      const date = dayjs(dateTime);
      if (!date.isValid()) {
        message.error('请输入有效的日期时间');
        return;
      }

      const timestamp = unit === 'seconds' 
        ? date.unix().toString()
        : date.valueOf().toString();
      
      setTimestamp(timestamp);
    } catch (error) {
      message.error('转换失败，请检查输入');
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    if (!text) {
      message.warning('没有可复制的内容');
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => message.success('已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'));
  };

  // 获取当前时间
  const getCurrentDateTime = () => {
    const now = dayjs();
    setDateTime(now.format('YYYY-MM-DD HH:mm:ss'));
  };

  const items = [
    {
      key: '1',
      label: '时间戳转日期时间',
      children: (
        <div className={styles.content}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Group 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className={styles.radioGroup}
            >
              <Radio.Button value="seconds">秒</Radio.Button>
              <Radio.Button value="milliseconds">毫秒</Radio.Button>
            </Radio.Group>
            
            <div className={styles.inputGroup}>
              <Input
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="请输入时间戳"
                className={styles.input}
              />
              <Button onClick={updateCurrentTimestamp} size="middle">
                获取当前时间戳
              </Button>
            </div>

            <Button type="primary" onClick={convertTimestampToDateTime}>
              转换为日期时间
            </Button>

            {dateTime && (
              <div className={styles.result}>
                <Input
                  value={dateTime}
                  readOnly
                  addonAfter={
                    <CopyOutlined 
                      className={styles.copyIcon} 
                      onClick={() => copyToClipboard(dateTime)}
                    />
                  }
                />
              </div>
            )}
          </Space>
        </div>
      ),
    },
    {
      key: '2',
      label: '日期时间转时间戳',
      children: (
        <div className={styles.content}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Group 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className={styles.radioGroup}
            >
              <Radio.Button value="seconds">秒</Radio.Button>
              <Radio.Button value="milliseconds">毫秒</Radio.Button>
            </Radio.Group>

            <div className={styles.inputGroup}>
              <Input
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm:ss"
                className={styles.input}
              />
              <Button onClick={getCurrentDateTime} size="middle">
                获取当前时间
              </Button>
            </div>

            <Button type="primary" onClick={convertDateTimeToTimestamp}>
              转换为时间戳
            </Button>

            {timestamp && (
              <div className={styles.result}>
                <Input
                  value={timestamp}
                  readOnly
                  addonAfter={
                    <CopyOutlined 
                      className={styles.copyIcon} 
                      onClick={() => copyToClipboard(timestamp)}
                    />
                  }
                />
              </div>
            )}
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <Title level={2}>时间戳转换器</Title>
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default TimestampConverter; 