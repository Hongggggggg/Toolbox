import React, { useState, useCallback } from 'react';
import { Button, Upload, Card, Row, Col, Space, message, Select, Typography, Tooltip, Image, Spin } from 'antd';
import { UploadOutlined, SaveOutlined, InfoCircleOutlined, InboxOutlined, SwapOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import BasePage from '../../../components/layout/BasePage';
import { saveAs } from 'file-saver';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

// 支持的图片格式
const SUPPORTED_FORMATS = {
  'image/jpeg': { ext: 'jpg', name: 'jpeg', mime: 'image/jpeg' },
  'image/png': { ext: 'png', name: 'png', mime: 'image/png' },
  'image/webp': { ext: 'webp', name: 'webp', mime: 'image/webp' },
  'image/bmp': { ext: 'bmp', name: 'bmp', mime: 'image/bmp' },
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ConvertedImage {
  dataUrl: string;
  fileName: string;
  originalSize: number;
  convertedSize: number;
}

const ImageConvert: React.FC = () => {
  // 状态管理
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [convertedImage, setConvertedImage] = useState<ConvertedImage | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState<number>(0.92);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // 文件验证
  const beforeUpload = (file: RcFile) => {
    // 验证文件类型
    const isImage = Object.keys(SUPPORTED_FORMATS).includes(file.type);
    if (!isImage) {
      message.error('只能上传PNG、JPG、WebP、BMP格式的图片！');
      return Upload.LIST_IGNORE;
    }

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过10MB！');
      return Upload.LIST_IGNORE;
    }

    // 设置预览
    setOriginalFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 保存当前文件
    setCurrentFile(file);
    // 清除之前的转换结果
    setConvertedImage(null);

    return true;
  };

  // 处理图片转换
  const convertImage = useCallback(async () => {
    if (!currentFile) {
      message.error('请先上传图片！');
      return;
    }

    setIsConverting(true);
    try {
      // 创建图片对象
      const img = document.createElement('img');
      const reader = new FileReader();

      const loadImage = new Promise((resolve, reject) => {
        reader.onload = (e) => {
          img.src = e.target?.result as string;
          img.onload = () => resolve(img);
          img.onerror = reject;
        };
        reader.onerror = reject;
        reader.readAsDataURL(currentFile);
      });

      // 等待图片加载
      await loadImage;

      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片
      ctx.drawImage(img, 0, 0);

      // 转换格式
      const format = SUPPORTED_FORMATS[targetFormat as keyof typeof SUPPORTED_FORMATS];
      const dataUrl = canvas.toDataURL(format.mime, quality);

      // 计算转换后的大小
      const convertedSize = Math.round((dataUrl.length - 22) * 3 / 4);

      setConvertedImage({
        dataUrl,
        fileName: `${originalFileName.split('.')[0]}.${format.ext}`,
        originalSize: currentFile.size,
        convertedSize,
      });

      message.success('转换成功！');
      // 自动下载
      saveAs(dataUrl, `${originalFileName.split('.')[0]}.${format.ext}`);

    } catch (error) {
      console.error('转换失败:', error);
      message.error('转换失败，请重试');
    } finally {
      setIsConverting(false);
    }
  }, [currentFile, targetFormat, quality, originalFileName]);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if (file.status === 'done' && file.originFileObj) {
      setCurrentFile(file.originFileObj);
    }
  };

  // 处理下载
  const handleDownload = () => {
    if (!convertedImage) return;
    
    try {
      saveAs(convertedImage.dataUrl, convertedImage.fileName);
      message.success('下载成功！');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败，请重试');
    }
  };

  // 上传组件配置
  const uploadProps: UploadProps = {
    name: 'image',
    multiple: false,
    maxCount: 1,
    accept: Object.keys(SUPPORTED_FORMATS).join(','),
    fileList,
    beforeUpload,
    onChange: handleUpload,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess?.(null, null as any);
      }, 0);
    }
  };

  return (
    <BasePage>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card title={
          <div className="flex items-center justify-between">
            <Title level={4} className="mb-0 text-lg">图片格式转换</Title>
            <Tooltip title="支持PNG、JPG、WebP、BMP格式互转">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
        }>
          <Space direction="vertical" className="w-full" size="large">
            {/* 上传区域 */}
            <div className="upload-container">
              <Dragger {...uploadProps}>
                <div className="py-4 px-6">
                  <p className="text-xl text-gray-400 mb-2">
                    <InboxOutlined />
                  </p>
                  <Paragraph className="text-gray-600 mb-1 text-sm">
                    点击或拖拽图片文件到此区域上传
                  </Paragraph>
                  <Paragraph className="text-gray-400 text-xs m-0">
                    支持png、jpg、Webp、bmp格式，大小不超过10MB
                  </Paragraph>
                </div>
              </Dragger>
            </div>

            {/* 图片预览 */}
            {previewUrl && (
              <Card className="preview-card" size="small">
                <Row gutter={[16, 16]} align="middle">
                  <Col span={8}>
                    <div className="preview-image-container">
                      <Image
                        src={previewUrl}
                        alt="预览图"
                        className="preview-image"
                        style={{ maxHeight: '100px', objectFit: 'contain' }}
                      />
                    </div>
                  </Col>
                  <Col span={16}>
                    <Text strong className="text-sm block mb-1">原始文件</Text>
                    <Text className="text-xs text-gray-500">{originalFileName}</Text>
                  </Col>
                </Row>
              </Card>
            )}

            {/* 转换选项 */}
            {currentFile && (
              <Card className="bg-gray-50" size="small">
                <Space direction="vertical" className="w-full" size="middle">
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={12}>
                      <Text className="text-sm mb-2 block">目标格式</Text>
                      <Select
                        value={targetFormat}
                        onChange={setTargetFormat}
                        style={{ width: '100%' }}
                        size="small"
                        disabled={isConverting}
                      >
                        {Object.entries(SUPPORTED_FORMATS).map(([mimeType, format]) => (
                          <Option key={mimeType} value={mimeType}>
                            {format.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={12}>
                      <Text className="text-sm mb-2 block">图片质量</Text>
                      <Select
                        value={quality}
                        onChange={setQuality}
                        style={{ width: '100%' }}
                        size="small"
                        disabled={isConverting}
                      >
                        <Option value={0.92}>高质量</Option>
                        <Option value={0.85}>中质量</Option>
                        <Option value={0.75}>低质量</Option>
                      </Select>
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    onClick={convertImage}
                    loading={isConverting}
                    block
                  >
                    开始转换
                  </Button>
                </Space>
              </Card>
            )}

            {/* 转换结果 */}
            {convertedImage && (
              <Card className="bg-gray-50" size="small">
                <Row gutter={[16, 16]} align="middle">
                  <Col span={8}>
                    <Text type="secondary" className="text-xs">原始大小</Text>
                    <div className="font-medium text-sm">
                      {formatFileSize(convertedImage.originalSize)}
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary" className="text-xs">转换后大小</Text>
                    <div className="font-medium text-sm">
                      {formatFileSize(convertedImage.convertedSize)}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleDownload}
                        size="small"
                        style={{ width: '80px' }}
                      >
                        下载
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </Space>
        </Card>

        <style>{`
          .upload-container .ant-upload-drag {
            border-radius: 6px;
            border: 1px dashed #e5e7eb;
            background: #f9fafb;
            transition: all 0.3s;
            max-height: 110px;
          }
          .upload-container .ant-upload-drag:hover {
            border-color: #4F46E5;
            background: #F5F3FF;
          }
          .upload-container .ant-upload {
            padding: 0 !important;
          }
          .upload-container .ant-upload-btn {
            padding: 0 !important;
          }
          .preview-card {
            background: #fafafa;
          }
          .preview-image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
            padding: 4px;
            border-radius: 4px;
            border: 1px solid #f0f0f0;
          }
          .ant-btn-primary {
            background: #4F46E5;
          }
          .ant-btn-primary:hover {
            background: #6366F1 !important;
          }
          .ant-btn-primary:active {
            background: #4338CA !important;
          }
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: #F5F3FF;
          }
          .ant-select-focused .ant-select-selector,
          .ant-select-selector:hover {
            border-color: #4F46E5 !important;
          }
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: #F5F3FF;
          }
        `}</style>
      </div>
    </BasePage>
  );
};

export default ImageConvert; 