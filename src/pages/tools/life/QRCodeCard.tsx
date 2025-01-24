import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd';
import QRCode from 'qrcode.react';
import { DownloadOutlined } from '@ant-design/icons';
import styles from './QRCodeCard.module.css';

const { Title } = Typography;

interface CardInfo {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}

const QRCodeCard: React.FC = () => {
  const [form] = Form.useForm<CardInfo>();
  const [qrCodeData, setQRCodeData] = useState<string>('');

  // 生成vCard格式的字符串
  const generateVCardString = (values: CardInfo): string => {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${values.name}`,
      `TITLE:${values.title}`,
      `ORG:${values.company}`,
      `TEL:${values.phone}`,
      `EMAIL:${values.email}`,
      `ADR:;;${values.address}`,
      'END:VCARD'
    ].join('\n');

    return vCard;
  };

  // 处理表单提交
  const handleSubmit = (values: CardInfo) => {
    try {
      const vCardString = generateVCardString(values);
      setQRCodeData(vCardString);
      message.success('二维码生成成功');
    } catch (error) {
      message.error('生成二维码时出错');
    }
  };

  // 下载二维码图片
  const handleDownload = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qrcode-card.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('二维码下载成功');
    } catch (error) {
      message.error('下载二维码时出错');
    }
  };

  return (
    <div className={styles.container}>
      <Card>
        <Title level={2}>二维码名片生成器</Title>
        <Row gutter={[24, 24]} className={styles.content}>
          <Col xs={24} md={12}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className={styles.form}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 50, message: '姓名不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入姓名" maxLength={50} />
              </Form.Item>

              <Form.Item
                name="title"
                label="职位"
                rules={[
                  { max: 100, message: '职位不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入职位" maxLength={100} />
              </Form.Item>

              <Form.Item
                name="company"
                label="公司"
                rules={[
                  { max: 100, message: '公司名称不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入公司名称" maxLength={100} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="电话"
                rules={[
                  { required: true, message: '请输入电话号码' },
                  { pattern: /^[0-9+\-\s()]{5,20}$/, message: '请输入有效的电话号码' }
                ]}
              >
                <Input placeholder="请输入电话号码" maxLength={20} />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' },
                  { max: 100, message: '邮箱不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" maxLength={100} />
              </Form.Item>

              <Form.Item
                name="address"
                label="地址"
                rules={[
                  { max: 200, message: '地址不能超过200个字符' }
                ]}
              >
                <Input.TextArea
                  placeholder="请输入地址"
                  maxLength={200}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  生成二维码
                </Button>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} md={12}>
            <div className={styles.qrcodeContainer}>
              {qrCodeData ? (
                <>
                  <div className={styles.qrcode}>
                    <QRCode
                      value={qrCodeData}
                      size={200}
                      level="H"
                      includeMargin
                      renderAs="canvas"
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    className={styles.downloadButton}
                  >
                    下载二维码
                  </Button>
                </>
              ) : (
                <div className={styles.placeholder}>
                  <p>填写信息并生成二维码</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default QRCodeCard; 