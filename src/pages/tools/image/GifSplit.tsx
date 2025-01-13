import React, { useState, useCallback } from 'react';
import { Button, Upload, Card, Row, Col, Space, message, Progress, Spin, Modal, Tooltip, Typography } from 'antd';
import { UploadOutlined, SaveOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import BasePage from '../../../components/layout/BasePage';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { parseGIF, decompressFrames } from 'gifuct-js';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// 类型定义
interface FrameInfo {
  dataUrl: string;
  delay: number;
  index: number;
}

interface GifInfo {
  frames: FrameInfo[];
  width: number;
  height: number;
  size: string;
}

// 工具函数：格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 将帧数据绘制到 canvas 上
const renderFrameToCanvas = (
  frameData: any,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(frameData.patch);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

// GIF拆分组件
const GifSplit: React.FC = () => {
  // 状态管理
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [gifInfo, setGifInfo] = useState<GifInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number>(-1);
  const [progress, setProgress] = useState<number>(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 文件上传前的验证
  const beforeUpload = (file: RcFile) => {
    const isGif = file.type === 'image/gif';
    if (!isGif) {
      message.error('只能上传GIF格式的图片！');
      return Upload.LIST_IGNORE;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过10MB！');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 处理GIF文件
  const processGifFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // 读取文件
      const arrayBuffer = await file.arrayBuffer();
      
      // 解析GIF
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);
      
      if (!frames || frames.length === 0) {
        throw new Error('无法解析GIF文件');
      }

      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置canvas尺寸
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;

      // 创建临时canvas用于合成完整帧
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error('无法创建临时canvas上下文');
      }
      tempCanvas.width = frames[0].dims.width;
      tempCanvas.height = frames[0].dims.height;

      // 处理每一帧
      const frameInfos: FrameInfo[] = [];
      let lastImageData: ImageData | null = null;

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // 清除临时画布
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 如果有上一帧的数据且当前帧需要合成，则绘制上一帧
        if (lastImageData && !frame.disposalType) {
          tempCtx.putImageData(lastImageData, 0, 0);
        }

        // 创建当前帧的图像数据
        const imageData = tempCtx.createImageData(frame.dims.width, frame.dims.height);
        imageData.data.set(frame.patch);
        
        // 在正确的位置绘制当前帧
        tempCtx.putImageData(
          imageData,
          frame.dims.left,
          frame.dims.top,
          0,
          0,
          frame.dims.width,
          frame.dims.height
        );

        // 保存当前帧的完整图像数据
        lastImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 将临时画布的内容复制到主画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        frameInfos.push({
          dataUrl: canvas.toDataURL('image/png'),
          delay: frame.delay * 10, // 转换为毫秒
          index: i,
        });

        setProgress(Math.floor(((i + 1) / frames.length) * 100));
      }

      // 更新GIF信息
      setGifInfo({
        frames: frameInfos,
        width: frames[0].dims.width,
        height: frames[0].dims.height,
        size: formatFileSize(file.size),
      });
    } catch (error) {
      console.error('GIF处理失败:', error);
      message.error('GIF处理失败，请重试');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async (info) => {
    const { file, fileList } = info;
    
    // 更新文件列表状态
    setFileList(fileList);

    // 只在文件状态为 'done' 时处理
    if (file.status === 'done' && file.originFileObj) {
      await processGifFile(file.originFileObj);
    }
  };

  // 导出所有帧
  const handleExportAll = async () => {
    if (!gifInfo) return;
    setIsExporting(true);

    try {
      const zip = new JSZip();
      
      // 添加所有帧到zip
      for (let i = 0; i < gifInfo.frames.length; i++) {
        const frame = gifInfo.frames[i];
        const data = frame.dataUrl.split(',')[1];
        zip.file(`frame_${String(i + 1).padStart(3, '0')}.png`, data, { base64: true });
        setProgress(Math.floor((i + 1) / gifInfo.frames.length * 100));
      }

      // 生成并下载zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'gif_frames.zip');
      
      message.success('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  // 预览指定帧
  const handlePreview = (index: number) => {
    setCurrentPreviewIndex(index);
    setPreviewVisible(true);
  };

  // 上传组件属性配置
  const uploadProps: UploadProps = {
    name: 'gif',
    multiple: false,
    maxCount: 1,
    accept: '.gif',
    fileList: fileList,
    beforeUpload: beforeUpload,
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
            <Title level={4} className="mb-0 text-lg">GIF拆分工具</Title>
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
                    点击或拖拽GIF文件到此区域上传
                  </Paragraph>
                  <Paragraph className="text-gray-400 text-xs m-0">
                    支持大小不超过10MB的GIF文件
                  </Paragraph>
                </div>
              </Dragger>
            </div>

            {/* 处理进度 */}
            {(isProcessing || isExporting) && (
              <Card className="bg-gray-50" size="small">
                <Space direction="vertical" className="w-full" size="small">
                  <Progress 
                    percent={progress} 
                    status="active"
                    strokeColor={{
                      '0%': '#4F46E5',
                      '100%': '#818CF8',
                    }}
                    size="small"
                  />
                  <div className="text-center">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                    <div className="mt-1 text-gray-600 text-sm">
                      {isProcessing ? '正在处理GIF文件...' : '正在导出帧图片...'}
                    </div>
                  </div>
                </Space>
              </Card>
            )}

            {/* 图片信息和预览 */}
            {gifInfo && !isProcessing && (
              <>
                {/* 图片信息 */}
                <Card className="bg-gray-50" size="small">
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={6}>
                      <Text type="secondary" className="text-xs">尺寸</Text>
                      <div className="font-medium text-sm">{gifInfo.width} x {gifInfo.height}</div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary" className="text-xs">大小</Text>
                      <div className="font-medium text-sm">{gifInfo.size}</div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary" className="text-xs">总帧数</Text>
                      <div className="font-medium text-sm">{gifInfo.frames.length}</div>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleExportAll}
                        loading={isExporting}
                        size="small"
                        block
                      >
                        导出所有帧
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* 帧预览网格 */}
                <Row gutter={[8, 8]}>
                  {gifInfo.frames.map((frame, index) => (
                    <Col key={index} xs={6} sm={4} md={3} lg={3}>
                      <Card
                        hoverable
                        className="frame-card"
                        size="small"
                        bodyStyle={{ padding: '4px' }}
                        cover={
                          <div className="aspect-w-1 aspect-h-1 bg-gray-50">
                            <img
                              alt={`Frame ${index + 1}`}
                              src={frame.dataUrl}
                              className="object-contain w-full h-full p-1"
                            />
                          </div>
                        }
                        actions={[
                          <Tooltip title="预览" key="preview">
                            <EyeOutlined onClick={() => handlePreview(index)} />
                          </Tooltip>,
                          <Tooltip title="下载" key="save">
                            <SaveOutlined
                              onClick={() => saveAs(frame.dataUrl, `frame_${String(index + 1).padStart(3, '0')}.png`)}
                            />
                          </Tooltip>,
                        ]}
                      >
                        <Card.Meta
                          title={<div className="text-xs text-center">{index + 1}</div>}
                          description={<div className="text-xs text-center text-gray-400">{frame.delay}ms</div>}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Space>
        </Card>

        {/* 预览模态框 */}
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="auto"
          centered
          className="preview-modal"
          bodyStyle={{ padding: 0 }}
        >
          {gifInfo && currentPreviewIndex >= 0 && (
            <div className="preview-container">
              <div className="preview-image-wrapper">
                <img
                  src={gifInfo.frames[currentPreviewIndex].dataUrl}
                  alt={`Frame ${currentPreviewIndex + 1}`}
                  className="preview-image"
                />
              </div>
              <div className="preview-info">
                <Text strong className="text-sm">帧 {currentPreviewIndex + 1} / {gifInfo.frames.length}</Text>
                <br />
                <Text type="secondary" className="text-xs">延迟: {gifInfo.frames[currentPreviewIndex].delay}ms</Text>
              </div>
            </div>
          )}
        </Modal>
      </div>

      <style>{`
        .upload-container .ant-upload-drag {
          border-radius: 6px;
          border: 1px dashed #e5e7eb;
          background: #f9fafb;
          transition: all 0.3s;
          max-height: 110px;
        }
        .upload-container .ant-upload-drag:hover {
          border-color: #818CF8;
          background: #F5F3FF;
        }
        .upload-container .ant-upload {
          padding: 0 !important;
        }
        .upload-container .ant-upload-btn {
          padding: 0 !important;
        }
        .frame-card {
          margin-bottom: 0 !important;
        }
        .frame-card .ant-card-cover {
          background: #f9fafb;
        }
        .frame-card .ant-card-actions {
          border-top: none;
          background: transparent;
          line-height: 1.5;
          min-height: 24px;
        }
        .frame-card .ant-card-actions > li {
          margin: 4px 0;
        }
        .frame-card .ant-card-actions > li > span {
          padding: 0;
        }
        .frame-card .ant-card-meta-title {
          margin-bottom: 0 !important;
          font-size: 10px;
          line-height: 1.2;
        }
        .frame-card .ant-card-meta-description {
          font-size: 10px;
          line-height: 1.2;
          margin-top: -1px;
        }
        .preview-modal {
          max-width: 90vw;
        }
        .preview-modal .ant-modal-content {
          background: #f9fafb;
          padding: 0;
          width: fit-content;
          margin: 0 auto;
        }
        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
        }
        .preview-image-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-height: 60vh;
          overflow: hidden;
        }
        .preview-image {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }
        .preview-info {
          margin-top: 12px;
          text-align: center;
        }
      `}</style>
    </BasePage>
  );
};

export default GifSplit; 