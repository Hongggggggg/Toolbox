import React, { useState, useCallback } from 'react';
import { Button, Upload, Card, Space, message, Progress, Modal, Tooltip, Typography, InputNumber, Form } from 'antd';
import { SaveOutlined, InfoCircleOutlined, InboxOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import BasePage from '../../../components/layout/BasePage';
import { saveAs } from 'file-saver';
import GIF from 'gif.js';
// 导入 worker 脚本
import 'gif.js/dist/gif.worker.js';

const { Title } = Typography;
const { Dragger } = Upload;

// 类型定义
interface ImageInfo {
  dataUrl: string;
  file: File;
  index: number;
}

interface GifSettings {
  frameDelay: number | null;
  duration: number | null;
}

// 工具函数：格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// GIF合成组件
const GifCreate: React.FC = () => {
  // 状态管理
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [settings, setSettings] = useState<GifSettings>({
    frameDelay: 100, // 默认帧延迟100ms
    duration: 1,    // 默认时长1秒
  });
  const [gifPreview, setGifPreview] = useState<string | null>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);

  // 处理帧延时变化
  const handleFrameDelayChange = (value: number | null) => {
    if (value === null) {
      setSettings(prev => ({
        ...prev,
        frameDelay: value
      }));
      return;
    }
    const duration = (value * images.length) / 1000;
    setSettings({
      frameDelay: value,
      duration: Number(duration.toFixed(1))
    });
  };

  // 处理总时长变化
  const handleDurationChange = (value: number | null) => {
    if (value === null) {
      setSettings(prev => ({
        ...prev,
        duration: value
      }));
      return;
    }
    const frameDelay = (value * 1000) / (images.length || 1);
    setSettings({
      duration: value,
      frameDelay: Math.round(frameDelay)
    });
  };

  // 文件上传前的验证
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return Upload.LIST_IGNORE;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过5MB！');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 处理图片文件
  const processImageFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async (info) => {
    const { fileList: newFileList } = info;
    
    // 处理新上传的文件
    const updatedFileList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj && !file.url && !file.preview) {
          const dataUrl = await processImageFile(file.originFileObj);
          return {
            ...file,
            preview: dataUrl
          };
        }
        return file;
      })
    );
    
    setFileList(updatedFileList);

    // 处理图片数据
    const newImages: ImageInfo[] = [];
    for (let i = 0; i < updatedFileList.length; i++) {
      const file = updatedFileList[i];
      if (file.originFileObj) {
        try {
          const dataUrl = file.preview || await processImageFile(file.originFileObj);
          newImages.push({
            dataUrl,
            file: file.originFileObj,
            index: i,
          });
        } catch (error) {
          console.error('处理图片失败:', error);
          message.error(`处理图片 ${file.name} 失败`);
        }
      }
    }
    setImages(newImages);
    
    // 更新时长和帧延时
    if (newImages.length > 0 && settings.duration !== null) {
      const frameDelay = (settings.duration * 1000) / newImages.length;
      setSettings(prev => ({
        ...prev,
        frameDelay: Math.round(frameDelay)
      }));
    }
  };

  // 处理图片删除
  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    const newImages = images.filter(item => item.file.name !== file.name);
    setImages(newImages);

    // 更新时长和帧延时
    if (newImages.length > 0 && settings.duration !== null) {
      const frameDelay = (settings.duration * 1000) / newImages.length;
      setSettings(prev => ({
        ...prev,
        frameDelay: Math.round(frameDelay)
      }));
    }
  };

  // 生成GIF
  const handleCreateGif = async () => {
    if (images.length === 0) {
      message.error('请先上传图片！');
      return;
    }

    if (images.length > 50) {
      message.error('图片数量不能超过50张！');
      return;
    }

    if (!settings.frameDelay) {
      message.error('请设置帧延迟！');
      return;
    }

    console.log('[GIF Create] 开始生成GIF...');
    console.log('[GIF Create] 图片数量:', images.length);
    console.log('[GIF Create] 帧延迟:', settings.frameDelay);

    setIsProcessing(true);
    setProgress(0);

    // 显示持续的加载消息
    const loadingKey = 'gifProgress';
    message.loading({
      content: '正在初始化...',
      key: loadingKey,
      duration: 0
    });

    try {
      console.log('[GIF Create] 初始化GIF实例...');
      // 创建GIF实例
      const gif = new GIF({
        workers: 2,
        workerScript: '/assets/gif.worker.js',
        quality: 10,
        debug: true,
        background: '#FFFFFF' // 设置白色背景
      });

      console.log('[GIF Create] GIF实例配置:', {
        workers: 2,
        workerScript: '/assets/gif.worker.js',
        quality: 10,
        debug: true
      });

      let renderStarted = false;

      // 添加错误处理
      gif.on('error', (error: Error) => {
        console.error('[GIF Create] GIF生成错误:', error);
        console.error('[GIF Create] 错误堆栈:', error.stack);
        message.error({ content: `GIF生成失败: ${error.message}`, key: loadingKey });
        setIsProcessing(false);
        setProgress(0);
      });

      // 添加进度监听
      gif.on('progress', (p: number) => {
        console.log('[GIF Create] 渲染进度:', Math.floor(p * 100) + '%');
        if (!renderStarted) {
          renderStarted = true;
          console.log('[GIF Create] 开始渲染...');
          setProgress(30);
        }
        const percent = Math.floor(30 + p * 70);
        setProgress(percent);
        message.loading({
          content: `正在渲染GIF... ${percent}%`,
          key: loadingKey,
          duration: 0
        });
      });

      // 完成回调
      gif.on('finished', (blob: Blob) => {
        console.log('[GIF Create] GIF生成完成');
        console.log('[GIF Create] 生成的GIF大小:', formatFileSize(blob.size));
        try {
          const url = URL.createObjectURL(blob);
          setGifPreview(url);
          // 保存 blob 用于后续下载
          setGifBlob(blob);
          message.success({ content: 'GIF生成成功！', key: loadingKey });
        } catch (error) {
          console.error('[GIF Create] 保存文件失败:', error);
          message.error({ content: '保存文件失败，请重试', key: loadingKey });
        } finally {
          setIsProcessing(false);
          setProgress(0);
        }
      });

      // 逐个加载和添加图片
      console.log('[GIF Create] 开始处理图片...');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`[GIF Create] 处理第 ${i + 1}/${images.length} 张图片:`, image.file.name);
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            console.log(`[GIF Create] 图片 ${i + 1} 加载成功:`, {
              width: img.width,
              height: img.height,
              name: image.file.name
            });

            // 创建临时canvas来处理图片
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
              const error = new Error('无法创建canvas上下文');
              console.error('[GIF Create] Canvas错误:', error);
              reject(error);
              return;
            }

            // 设置canvas尺寸
            if (i === 0) {
              // 使用第一张图片的尺寸作为基准
              canvas.width = img.width;
              canvas.height = img.height;
              console.log('[GIF Create] 设置GIF尺寸:', {
                width: img.width,
                height: img.height
              });
              gif.setOptions({
                width: img.width,
                height: img.height
              });
            } else {
              // 调整其他图片尺寸以匹配第一张图片
              canvas.width = gif.options.width!;
              canvas.height = gif.options.height!;
            }

            // 在绘制之前清空画布并设置白色背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 计算缩放和居中绘制的参数
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;

            console.log(`[GIF Create] 图片 ${i + 1} 绘制参数:`, {
              scale,
              x,
              y,
              canvasWidth: canvas.width,
              canvasHeight: canvas.height
            });

            // 绘制图片（保持比例并居中）
            ctx.drawImage(
              img,
              x, y,
              img.width * scale,
              img.height * scale
            );

            // 添加帧
            console.log(`[GIF Create] 添加第 ${i + 1} 帧`);
            gif.addFrame(canvas, {
              delay: settings.frameDelay || 100,
              copy: true,
              dispose: 2, // 清除上一帧
              transparent: null // 不使用透明色
            });

            // 更新进度
            const loadProgress = Math.floor(((i + 1) / images.length) * 30);
            setProgress(loadProgress);
            message.loading({
              content: `正在处理第 ${i + 1}/${images.length} 张图片...`,
              key: loadingKey,
              duration: 0
            });

            resolve();
          };
          img.onerror = (error) => {
            console.error(`[GIF Create] 图片 ${i + 1} 加载失败:`, error);
            reject(new Error(`加载图片失败: ${image.file.name}`));
          };
          img.src = image.dataUrl;
        });
      }

      // 开始渲染
      console.log('[GIF Create] 所有图片处理完成，开始渲染GIF...');
      message.loading({
        content: '正在生成GIF...',
        key: loadingKey,
        duration: 0
      });
      gif.render();
    } catch (error) {
      console.error('[GIF Create] GIF处理失败:', error);
      message.error({ content: 'GIF处理失败，请重试', key: loadingKey });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await processImageFile(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  // 上传组件属性配置
  const uploadProps: UploadProps = {
    name: 'image',
    multiple: true,
    listType: 'picture-card',
    fileList: fileList,
    beforeUpload: beforeUpload,
    onChange: handleUpload,
    onRemove: handleRemove,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess?.(null, null as any);
      }, 0);
    }
  };

  return (
    <BasePage>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card title={
          <div className="flex items-center justify-between">
            <Title level={4} className="mb-0 text-lg bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">GIF合成工具</Title>
            <Tooltip title="支持将多张图片合成为GIF动图，可自定义帧率和时长">
              <InfoCircleOutlined className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
        }>
          <Space direction="vertical" className="w-full" size="large">
            {/* 参数设置和按钮区域 */}
            <div className="flex justify-between items-start">
              <Form layout="horizontal" className="flex-1 max-w-lg">
                <Form.Item label="总时长(秒)" tooltip="GIF动画的总播放时长">
                  <InputNumber
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={settings.duration ?? undefined}
                    onChange={handleDurationChange}
                    style={{ width: 160 }}
                  />
                </Form.Item>
                <Form.Item 
                  label="帧延迟(ms)" 
                  tooltip={
                    <div>
                      <p>每一帧显示的时间，单位毫秒</p>
                      <p>当前帧数：{images.length || 0}帧</p>
                    </div>
                  }
                  className="mb-0"
                >
                  <InputNumber
                    min={10}
                    max={1000}
                    value={settings.frameDelay ?? undefined}
                    onChange={handleFrameDelayChange}
                    style={{ width: 160 }}
                  />
                </Form.Item>
              </Form>
              <Space direction="vertical" size={12}>
                <Button
                  type="primary"
                  onClick={handleCreateGif}
                  loading={isProcessing}
                  disabled={images.length === 0}
                  icon={<SaveOutlined />}
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 border-none hover:from-indigo-500 hover:to-blue-400"
                >
                  生成GIF
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    if (gifBlob) {
                      saveAs(gifBlob, 'animated.gif');
                    } else {
                      message.info('请先生成GIF');
                    }
                  }}
                  icon={<DownloadOutlined />}
                  disabled={!gifBlob}
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-500"
                >
                  下载GIF
                </Button>
              </Space>
            </div>

            {/* 图片上传和预览区域 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 左侧：上传区域 */}
              <div className="space-y-6">
                {/* 上传区域 */}
                <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg hover:border-indigo-500 transition-colors">
                  <Dragger {...uploadProps}>
                    <div className="ant-upload-drag-icon mb-4">
                      <InboxOutlined className="text-[64px] text-indigo-600" />
                    </div>
                    <p className="ant-upload-text text-gray-900">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint text-gray-500">
                      支持单次或批量上传，每个文件不超过5MB，最多50张图片
                    </p>
                  </Dragger>
                </div>

                {/* 图片列表 */}
                {fileList.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {fileList.map((file) => (
                      <div key={file.uid} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:border-indigo-500 transition-colors">
                          {file.preview && (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <Button
                          type="text"
                          size="small"
                          className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemove(file)}
                        />
                        <div className="absolute bottom-1 left-1 right-1 text-center bg-black/50 text-white text-xs py-0.5 rounded truncate px-1">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 右侧：GIF预览区域 */}
              <div className="border-2 border-gray-200 rounded-lg p-4 flex flex-col">
                <div className="text-lg font-medium mb-4 text-gray-900">GIF 预览</div>
                <div className="flex-1 flex items-center justify-center bg-white rounded-lg">
                  {gifPreview ? (
                    <img 
                      src={gifPreview} 
                      alt="Generated GIF" 
                      className="max-w-full max-h-full object-contain"
                      style={{ background: 'white' }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <p>生成的GIF将在这里显示</p>
                      <p className="text-sm">支持预览和下载</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 进度条 */}
            {isProcessing && (
              <Progress 
                percent={progress} 
                status="active"
                strokeColor={{
                  '0%': '#4f46e5',
                  '100%': '#3b82f6',
                }}
                size={4}
                className="mt-2"
              />
            )}
          </Space>
        </Card>
      </div>
    </BasePage>
  );
};

export default GifCreate; 