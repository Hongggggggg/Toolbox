import React, { useState, useCallback } from 'react';
import { Button, Upload, Card, Row, Col, Space, message, Slider, Radio, Tooltip } from 'antd';
import { UploadOutlined, SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import BasePage from '../../../components/layout/BasePage';

// 添加 window 类型声明
declare global {
  interface Window {
    compressTimer?: number;
  }
}

/**
 * 图片压缩质量选项
 */
type QualityPreset = 'high' | 'medium' | 'low' | 'custom';

/**
 * 图片压缩配置接口
 */
interface CompressConfig {
  quality: number;         // 压缩质量 (0-100)
  preset: QualityPreset;   // 质量预设
}

/**
 * 图片信息接口
 */
interface ImageInfo {
  width: number;          // 原始宽度
  height: number;         // 原始高度
  size: string;          // 原始大小
  compressedSize?: string; // 压缩后大小
  compressionRatio?: number; // 压缩比率
}

/**
 * 质量预设配置
 */
const QUALITY_PRESETS: Record<QualityPreset, number> = {
  high: 90,
  medium: 75,
  low: 50,
  custom: 80,
};

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 从 base64 字符串中获取实际的二进制大小
 */
const getBase64Size = (base64String: string): number => {
  // 将 base64 转换为 Blob
  const byteString = atob(base64String.split(',')[1]);
  const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeString });
  return blob.size;
};

/**
 * 图片压缩组件
 */
const ImageCompress: React.FC = () => {
  // 状态管理
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [compressedImage, setCompressedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string>('');
  const [config, setConfig] = useState<CompressConfig>({
    quality: QUALITY_PRESETS.high,
    preset: 'high',
  });

  /**
   * 压缩图片
   */
  const compressImage = useCallback(async (file: File, config: CompressConfig): Promise<{ dataUrl: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          // 如果质量为100，直接返回原图
          if (config.quality === 100) {
            resolve({
              dataUrl: e.target?.result as string,
              blob: file
            });
            return;
          }

          const img = new Image();
          img.onload = () => {
            // 创建 canvas，保持原始尺寸
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('无法创建 canvas 上下文'));
              return;
            }

            // 绘制图片
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

            // 根据图片格式选择压缩方式
            if (originalFormat === 'image/png') {
              // PNG 格式转换为 JPEG 进行压缩
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('压缩失败'));
                    return;
                  }

                  // 转换 blob 为 dataURL
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                      resolve({
                        dataUrl: reader.result,
                        blob: blob
                      });
                    } else {
                      reject(new Error('转换失败'));
                    }
                  };
                  reader.readAsDataURL(blob);
                },
                'image/jpeg',
                config.quality / 100
              );
            } else {
              // JPEG 格式直接压缩
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('压缩失败'));
                    return;
                  }

                  // 如果压缩后大小大于原始大小，使用原图
                  if (blob.size > file.size) {
                    resolve({
                      dataUrl: e.target?.result as string,
                      blob: file
                    });
                    return;
                  }

                  // 转换 blob 为 dataURL
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                      resolve({
                        dataUrl: reader.result,
                        blob: blob
                      });
                    } else {
                      reject(new Error('转换失败'));
                    }
                  };
                  reader.readAsDataURL(blob);
                },
                originalFormat,
                config.quality / 100
              );
            }
          };
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }, [originalFormat]);

  /**
   * 更新图片信息
   */
  const updateImageInfo = useCallback((originalFile: File, compressedBlob: Blob, compressedDataUrl: string) => {
    const originalSize = originalFile.size;
    const compressedSize = compressedBlob.size;

    setImageInfo({
      width: 0,
      height: 0,
      size: formatFileSize(originalSize),
      compressedSize: formatFileSize(compressedSize),
    });
  }, []);

  /**
   * 处理文件上传
   */
  const handleUpload: UploadProps['onChange'] = async ({ file }) => {
    if (file.status === 'error') {
      message.error('图片上传失败，请重试');
      return;
    }

    if (!file.originFileObj) return;

    // 保存原图格式
    const format = file.originFileObj.type;
    if (!format.startsWith('image/')) {
      message.error('不支持的图片格式');
      return;
    }
    
    setOriginalFormat(format);
    setIsProcessing(true);
    
    try {
      const { dataUrl, blob } = await compressImage(file.originFileObj, config);
      setCompressedImage(dataUrl);
      updateImageInfo(file.originFileObj, blob, dataUrl);
      setFileList([file as UploadFile]);

      // 如果是 PNG 格式，显示提示信息
      if (format === 'image/png') {
        message.info('PNG 图片将转换为 JPG 格式压缩，文件大小会显著减小，但透明背景会变为白色');
      }
    } catch (error) {
      console.error('压缩失败:', error);
      message.error('图片压缩失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 检查文件类型和大小
   */
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    
    return true;
  };

  /**
   * 处理保存压缩后的图片
   */
  const handleSave = () => {
    if (!compressedImage) return;

    // 将 base64 转换为 Blob
    const byteString = atob(compressedImage.split(',')[1]);
    const mimeType = compressedImage.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const originalFileName = fileList[0]?.name || 'image';
    const fileName = originalFileName.replace(/\.[^/.]+$/, '') + '_compressed.' + originalFileName.split('.').pop();
    link.download = fileName;
    
    link.onclick = () => {
      // 清理 URL 对象
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 150);
    };
    
    link.click();
  };

  /**
   * 处理质量滑动条变化
   */
  const handleQualityChange = (value: number) => {
    setConfig(prev => ({
      ...prev,
      quality: value,
      preset: 'custom'
    }));

    // 使用防抖处理压缩操作
    if (fileList[0]?.originFileObj) {
      if (window.compressTimer) {
        clearTimeout(window.compressTimer);
      }
      window.compressTimer = window.setTimeout(() => {
        compressImage(fileList[0].originFileObj!, {
          quality: value,
          preset: 'custom'
        })
          .then(({ dataUrl, blob }) => {
            setCompressedImage(dataUrl);
            updateImageInfo(fileList[0].originFileObj!, blob, dataUrl);
          })
          .catch(() => {
            message.error('图片压缩失败');
          });
      }, 300);
    }
  };

  return (
    <BasePage>
      <div className="p-4 md:p-6">
        <Card title="图片压缩" className="mb-6 max-w-2xl mx-auto">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="bg-gray-100 p-4 rounded-lg min-h-[250px] md:min-h-[450px] flex flex-col items-center justify-center relative">
                {!compressedImage ? (
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleUpload}
                    maxCount={1}
                    disabled={isProcessing}
                    customRequest={({ onSuccess }) => {
                      if (onSuccess) onSuccess("ok");
                    }}
                  >
                    <div className="text-center cursor-pointer p-4 md:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-main transition-colors">
                      <UploadOutlined className="text-xl md:text-2xl mb-2" />
                      <div className="mt-2">
                        <p className="text-sm md:text-base">点击或拖拽图片到此处</p>
                        <p className="text-xs md:text-sm text-gray-500">支持 JPG、PNG 等格式，大小不超过 5MB</p>
                      </div>
                    </div>
                  </Upload>
                ) : (
                  <>
                    <div className="relative group w-full flex justify-center">
                      <div 
                        className="absolute top-2 right-2 z-10 cursor-pointer bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setCompressedImage('');
                          setFileList([]);
                          setImageInfo(null);
                          setOriginalFormat('');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <img
                        src={compressedImage}
                        alt="压缩预览"
                        style={{ maxHeight: '350px', maxWidth: '100%' }}
                        className="rounded-lg shadow-md object-contain"
                      />
                    </div>
                    {imageInfo && (
                      <div className="mt-4 text-sm text-gray-500 text-center w-full px-2">
                        <Space direction="vertical" className="w-full">
                          <Space wrap className="justify-center">
                            <span>原始大小：{imageInfo.size}</span>
                            <span className="mx-2">|</span>
                            <span>压缩后大小：{imageInfo.compressedSize}</span>
                          </Space>
                          {originalFormat === 'image/png' && (
                            <div className="text-xs text-orange-500 px-4">
                              注意：PNG 图片会转换为 JPG 格式压缩，透明背景会变为白色，文件大小会显著减小
                            </div>
                          )}
                        </Space>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Col>
            {compressedImage && (
              <Col span={24}>
                <div className="bg-white p-4 rounded-lg shadow-sm max-w-lg mx-auto w-full">
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col span={14}>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">压缩质量</span>
                          <span className="text-gray-500">{config.quality}</span>
                        </div>
                        <Slider
                          min={1}
                          max={100}
                          value={config.quality}
                          onChange={handleQualityChange}
                          tooltip={{
                            formatter: (value) => value
                          }}
                        />
                        <div className="text-xs text-gray-400 mt-2">
                          数值越小，压缩程度越高，图片质量越低
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        disabled={!compressedImage}
                        block
                        size="middle"
                      >
                        保存
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      </div>
    </BasePage>
  );
};

export default ImageCompress; 