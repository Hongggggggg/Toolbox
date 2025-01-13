import React, { useState, useCallback } from 'react';
import { Button, Upload, Card, Row, Col, Space, message, InputNumber, Radio, Tooltip, Slider } from 'antd';
import { UploadOutlined, SaveOutlined, InfoCircleOutlined, CloseOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import BasePage from '../../../components/layout/BasePage';

/**
 * 缩放模式
 */
type ResizeMode = 'percentage' | 'dimensions';

/**
 * 图片缩放配置接口
 */
interface ResizeConfig {
  mode: ResizeMode;           // 缩放模式
  width?: number;             // 目标宽度
  height?: number;            // 目标高度
  percentage?: number;        // 缩放百分比
  maintainAspectRatio: boolean; // 保持宽高比
}

/**
 * 图片信息接口
 */
interface ImageInfo {
  originalWidth: number;     // 原始宽度
  originalHeight: number;    // 原始高度
  originalSize: string;      // 原始大小
  resizedWidth: number;      // 缩放后宽度
  resizedHeight: number;     // 缩放后高度
  resizedSize: string;       // 缩放后大小
}

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
 * 图片缩放组件
 */
const ImageResize: React.FC = () => {
  // 状态管理
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [resizedImage, setResizedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [config, setConfig] = useState<ResizeConfig>({
    mode: 'percentage',
    percentage: 100,  // 默认100%
    maintainAspectRatio: false  // 默认为保持宽高比
  });

  /**
   * 缩放图片
   */
  const resizeImage = useCallback(async (file: File, config: ResizeConfig): Promise<{ dataUrl: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            try {
              // 计算目标尺寸
              let targetWidth: number;
              let targetHeight: number;

              // 添加内存使用预估
              const estimatedMemoryUsage = (img.naturalWidth * img.naturalHeight * 4) / (1024 * 1024); // 预估MB
              if (estimatedMemoryUsage > 500) { // 如果预估内存使用超过500MB
                message.error('图片过大，可能导致浏览器崩溃，请尝试较小的图片！');
                reject(new Error('图片尺寸过大，内存不足'));
                return;
              }

              if (config.mode === 'percentage') {
                // 确保百分比值在1-200之间
                const percentage = Math.min(200, Math.max(1, config.percentage || 100));
                const scale = percentage / 100;
                
                // 计算缩放后的尺寸，并确保不超过限制
                targetWidth = Math.min(15000, Math.floor(img.naturalWidth * scale));
                targetHeight = Math.min(15000, Math.floor(img.naturalHeight * scale));
              } else {
                if (config.maintainAspectRatio) {
                  targetWidth = Math.min(15000, config.width || img.naturalWidth);
                  targetHeight = Math.min(15000, config.height || img.naturalHeight);
                } else {
                  const aspectRatio = img.naturalWidth / img.naturalHeight;
                  if (config.width && !config.height) {
                    targetWidth = Math.min(15000, config.width);
                    targetHeight = Math.min(15000, Math.floor(targetWidth / aspectRatio));
                  } else if (config.height && !config.width) {
                    targetHeight = Math.min(15000, config.height);
                    targetWidth = Math.min(15000, Math.floor(targetHeight * aspectRatio));
                  } else if (config.width && config.height) {
                    targetWidth = Math.min(15000, config.width);
                    targetHeight = Math.min(15000, config.height);
                  } else {
                    targetWidth = Math.min(15000, img.naturalWidth);
                    targetHeight = Math.min(15000, img.naturalHeight);
                  }
                }
              }

              // 确保最小尺寸
              targetWidth = Math.max(1, targetWidth);
              targetHeight = Math.max(1, targetHeight);

              // 检查最终尺寸是否合理
              if (targetWidth * targetHeight > 40000000) {
                message.error('缩放后的图片像素数过大，请调整参数！');
                reject(new Error('缩放后的图片过大'));
                return;
              }

              // 使用 OffscreenCanvas 如果可用
              let canvas: HTMLCanvasElement | OffscreenCanvas;
              if (typeof OffscreenCanvas !== 'undefined') {
                try {
                  canvas = new OffscreenCanvas(targetWidth, targetHeight);
                } catch (err) {
                  canvas = document.createElement('canvas');
                  canvas.width = targetWidth;
                  canvas.height = targetHeight;
                }
              } else {
                canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
              }

              const ctx = canvas.getContext('2d', {
                alpha: true,
                willReadFrequently: true
              });

              if (!ctx) {
                reject(new Error('无法创建画布上下文'));
                return;
              }

              // 使用高质量的图像缩放
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // 对于极端宽高比的图片，使用分步缩放以提高质量
              if (img.naturalWidth / img.naturalHeight > 4 || img.naturalHeight / img.naturalWidth > 4) {
                const steps = Math.ceil(Math.log2(Math.max(
                  img.naturalWidth / targetWidth,
                  img.naturalHeight / targetHeight
                )));

                if (steps > 1) {
                  let currentWidth = img.naturalWidth;
                  let currentHeight = img.naturalHeight;
                  const stepCanvas = document.createElement('canvas');
                  const stepCtx = stepCanvas.getContext('2d');

                  for (let i = 0; i < steps - 1; i++) {
                    currentWidth = Math.max(targetWidth, currentWidth / 2);
                    currentHeight = Math.max(targetHeight, currentHeight / 2);
                    stepCanvas.width = currentWidth;
                    stepCanvas.height = currentHeight;
                    
                    if (stepCtx) {
                      stepCtx.imageSmoothingEnabled = true;
                      stepCtx.imageSmoothingQuality = 'high';
                      stepCtx.drawImage(i === 0 ? img : canvas, 0, 0, currentWidth, currentHeight);
                      ctx.drawImage(stepCanvas, 0, 0, targetWidth, targetHeight);
                    }
                  }
                }
              }

              // 最终绘制
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              // 转换为blob
              if (canvas instanceof OffscreenCanvas) {
                canvas.convertToBlob({
                  type: file.type,
                  quality: 0.92
                }).then(blob => {
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
                });
              } else {
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      reject(new Error('转换失败'));
                      return;
                    }

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
                  file.type,
                  0.92
                );
              }
            } catch (error) {
              console.error('图片处理过程中发生错误:', error);
              reject(error);
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
  }, []);

  /**
   * 更新图片信息
   */
  const updateImageInfo = useCallback((originalFile: File, resizedBlob: Blob, resizedDataUrl: string, percentage: number) => {
    // 创建两个图片对象，分别用于获取原始尺寸和缩放后的尺寸
    const originalImg = new Image();
    const resizedImg = new Image();
    
    // 使用 Promise.all 等待两个图片都加载完成
    Promise.all([
      new Promise<void>((resolve) => {
        originalImg.onload = () => {
          resolve();
        };
        originalImg.src = URL.createObjectURL(originalFile);
      }),
      new Promise<void>((resolve) => {
        resizedImg.onload = () => {
          resolve();
        };
        resizedImg.src = resizedDataUrl;
      })
    ]).then(() => {
      setImageInfo({
        originalWidth: originalImg.naturalWidth,
        originalHeight: originalImg.naturalHeight,
        originalSize: formatFileSize(originalFile.size),
        resizedWidth: resizedImg.naturalWidth,
        resizedHeight: resizedImg.naturalHeight,
        resizedSize: formatFileSize(resizedBlob.size)
      });
      
      // 释放创建的 URL 对象
      URL.revokeObjectURL(originalImg.src);
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

    setIsProcessing(true);
    
    try {
      // 保存原始文件，用于后续缩放
      setFileList([file as UploadFile]);
      const { dataUrl, blob } = await resizeImage(file.originFileObj, config);
      setResizedImage(dataUrl);
      updateImageInfo(file.originFileObj, blob, dataUrl, config.percentage || 100);
    } catch (error) {
      console.error('缩放失败:', error);
      message.error('图片缩放失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 上传前校验
   */
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 增加到10MB
    if (file.size > maxSize) {
      message.error('图片大小不能超过10MB！');
      return false;
    }

    // 创建一个Promise来检查图片尺寸
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 检查图片尺寸是否合理
          if (img.naturalWidth * img.naturalHeight > 40000000) { // 约40MP
            message.error('图片像素数过大，请使用较小的图片！');
            reject(false);
          } else if (img.naturalWidth > 15000 || img.naturalHeight > 15000) {
            message.error('图片单边最大尺寸不能超过15000像素！');
            reject(false);
          } else if (img.naturalWidth < 1 || img.naturalHeight < 1) {
            message.error('图片尺寸无效！');
            reject(false);
          } else if (img.naturalWidth / img.naturalHeight > 50 || img.naturalHeight / img.naturalWidth > 50) {
            message.warning('警告：图片宽高比例过于极端，可能影响处理效果');
            resolve(true);
          } else {
            resolve(true);
          }
        };
        img.onerror = () => {
          message.error('图片文件已损坏或格式不支持！');
          reject(false);
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(false);
        }
      };
      reader.onerror = () => {
        message.error('图片文件读取失败！');
        reject(false);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 保存处理后的图片
   */
  const handleSave = () => {
    if (!resizedImage) {
      message.warning('请先上传并处理图片');
      return;
    }

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = `resized_${fileList[0]?.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * 处理配置变更
   */
  const handleConfigChange = (changes: Partial<ResizeConfig>) => {
    const newConfig = { ...config };
    
    // 处理百分比值
    if ('percentage' in changes) {
      const value = changes.percentage;
      if (value === null || value === undefined) {
        newConfig.percentage = 100; // 空值时使用默认值
      } else {
        // 直接使用输入的值，不需要额外处理
        newConfig.percentage = Math.min(200, Math.max(1, value));
      }
    }

    // 处理宽度值
    if ('width' in changes) {
      const value = changes.width;
      if (value === null || value === undefined) {
        newConfig.width = undefined;
      } else {
        newConfig.width = Math.max(1, value);
      }
    }

    // 处理高度值
    if ('height' in changes) {
      const value = changes.height;
      if (value === null || value === undefined) {
        newConfig.height = undefined;
      } else {
        newConfig.height = Math.max(1, value);
      }
    }

    // 处理模式切换
    if ('mode' in changes && changes.mode) {
      newConfig.mode = changes.mode;
      if (changes.mode === 'percentage' && !newConfig.percentage) {
        newConfig.percentage = 100;
      }
    }

    // 处理宽高比设置
    if ('maintainAspectRatio' in changes && typeof changes.maintainAspectRatio === 'boolean') {
      newConfig.maintainAspectRatio = changes.maintainAspectRatio;
    }
    
    setConfig(newConfig);

    // 如果有原始图片，使用原始图片重新处理
    if (fileList[0]?.originFileObj) {
      const originalFile = fileList[0].originFileObj;
      resizeImage(originalFile, newConfig).then(({ dataUrl, blob }) => {
        setResizedImage(dataUrl);
        updateImageInfo(originalFile, blob, dataUrl, newConfig.percentage || 100);
      }).catch((error) => {
        console.error('缩放失败:', error);
        message.error('图片缩放失败，请重试');
      });
    }
  };

  return (
    <BasePage>
      <Row gutter={[24, 24]}>
        {/* 左侧：预览和上传区域 */}
        <Col span={14}>
          <Card 
            size="small" 
            title="图片预览"
          >
            <div style={{ 
              width: '100%',
              height: '500px',
              overflow: 'hidden',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {resizedImage ? (
                <>
                  <div style={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '400px',
                      height: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${(config.percentage || 100) / 100})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.3s ease',
                      position: 'relative'
                    }}>
                      <img
                        src={resizedImage}
                        alt="预览"
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => {
                          setFileList([]);
                          setResizedImage('');
                          setImageInfo(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          padding: '4px',
                          height: 'auto',
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 1
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <Upload
                  accept="image/*"
                  maxCount={1}
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onChange={handleUpload}
                  showUploadList={false}
                >
                  <div style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '20px'
                  }}>
                    <p style={{ fontSize: '64px', color: '#999', marginBottom: '8px' }}>
                      <PictureOutlined />
                    </p>
                    <Button icon={<UploadOutlined />} loading={isProcessing}>
                      选择图片
                    </Button>
                  </div>
                </Upload>
              )}
            </div>
            {resizedImage && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  block
                >
                  保存图片
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：设置区域 */}
        <Col span={10}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 缩放设置 */}
            <Card size="small" title="缩放设置">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Radio.Group
                  value={config.mode}
                  onChange={(e) => handleConfigChange({ mode: e.target.value })}
                >
                  <Radio value="percentage">按百分比缩放</Radio>
                  <Radio value="dimensions">指定尺寸</Radio>
                </Radio.Group>

                {config.mode === 'percentage' ? (
                  <div style={{ padding: '8px 0' }}>
                    <Slider
                      min={1}
                      max={200}
                      value={config.percentage || 100}
                      onChange={(value) => {
                        handleConfigChange({ percentage: value });
                      }}
                      marks={{
                        1: '1%',
                        50: '50%',
                        100: '100%',
                        150: '150%',
                        200: '200%'
                      }}
                      included={true}
                      tooltip={{
                        formatter: (value) => `${value}%`
                      }}
                    />
                  </div>
                ) : (
                  <Space direction="vertical">
                    <Space>
                      <span>宽：</span>
                      <InputNumber
                        min={1}
                        max={10000}
                        value={config.width}
                        onStep={(value) => {
                          if (value > 10000) {
                            message.warning('宽度不能超过10000像素');
                          } else if (value < 1) {
                            message.warning('宽度不能小于1像素');
                          }
                        }}
                        onChange={(value) => {
                          const numValue = Number(value);
                          if (numValue > 10000) {
                            message.warning('宽度不能超过10000像素');
                          } else if (numValue < 1 && numValue !== 0) {
                            message.warning('宽度不能小于1像素');
                          }
                          handleConfigChange({ width: value === null ? undefined : Math.min(10000, Math.max(1, Math.round(numValue))) });
                        }}
                        addonAfter="px"
                        placeholder="宽度"
                        style={{ width: 120 }}
                        precision={0}
                        step={1}
                      />
                      <span>高：</span>
                      <InputNumber
                        min={1}
                        max={10000}
                        value={config.height}
                        onStep={(value) => {
                          if (value > 10000) {
                            message.warning('高度不能超过10000像素');
                          } else if (value < 1) {
                            message.warning('高度不能小于1像素');
                          }
                        }}
                        onChange={(value) => {
                          const numValue = Number(value);
                          if (numValue > 10000) {
                            message.warning('高度不能超过10000像素');
                          } else if (numValue < 1 && numValue !== 0) {
                            message.warning('高度不能小于1像素');
                          }
                          handleConfigChange({ height: value === null ? undefined : Math.min(10000, Math.max(1, Math.round(numValue))) });
                        }}
                        addonAfter="px"
                        placeholder="高度"
                        style={{ width: 120 }}
                        precision={0}
                        step={1}
                      />
                    </Space>
                    <Radio.Group
                      value={config.maintainAspectRatio}
                      onChange={(e) => handleConfigChange({ maintainAspectRatio: e.target.value })}
                    >
                      <Radio value={false}>保持宽高比</Radio>
                      <Radio value={true}>自由调整</Radio>
                    </Radio.Group>
                  </Space>
                )}
              </Space>
            </Card>

            {/* 图片信息 */}
            {imageInfo && (
              <Card size="small" title="图片信息">
                <Space direction="vertical" size="small" style={{ width: '100%', fontSize: '12px' }}>
                  <div>原始尺寸：{imageInfo.originalWidth} × {imageInfo.originalHeight} px</div>
                  <div>原始大小：{imageInfo.originalSize}</div>
                  <div>缩放尺寸：{imageInfo.resizedWidth} × {imageInfo.resizedHeight} px</div>
                  <div>处理后大小：{imageInfo.resizedSize}</div>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
      <style>{`
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
        .ant-radio-wrapper-checked .ant-radio-inner {
          border-color: #4F46E5 !important;
          background-color: #4F46E5 !important;
        }
        .ant-radio-wrapper-checked .ant-radio-inner::after {
          background-color: #fff;
        }
        .ant-radio-wrapper:hover .ant-radio-inner {
          border-color: #4F46E5;
        }
        .ant-slider-track {
          background-color: #4F46E5 !important;
        }
        .ant-slider-handle {
          border-color: #4F46E5 !important;
        }
        .ant-slider-handle:focus {
          box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.12);
        }
        .ant-slider-handle:hover {
          border-color: #6366F1 !important;
        }
      `}</style>
    </BasePage>
  );
};

export default ImageResize; 