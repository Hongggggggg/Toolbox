import React, { useState, useRef, useEffect } from 'react';
import BasePage from '../../../components/layout/BasePage';
import { convertToGrayscale, downloadImage } from '../../../utils/imageProcessing';

interface ImageState {
  original: string | null;
  preview: string | null;
}

const Grayscale = () => {
  const [images, setImages] = useState<ImageState>({ original: null, preview: null });
  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    mode: 'classic' as 'classic' | 'high-contrast' | 'soft'
  });
  const [tempSettings, setTempSettings] = useState({
    brightness: 100,
    contrast: 100
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当设置改变时更新预览
  useEffect(() => {
    const updatePreview = async () => {
      if (images.original && !isProcessing) {
        setIsProcessing(true);
        try {
          const result = await convertToGrayscale(
            images.original,
            settings.mode,
            settings.brightness,
            settings.contrast
          );
          setImages(prev => ({ ...prev, preview: result }));
        } catch (error) {
          console.error('处理图片时出错:', error);
        }
        setIsProcessing(false);
      }
    };

    const timer = setTimeout(updatePreview, 100);
    return () => clearTimeout(timer);
  }, [settings, images.original]);

  // 初始化临时设置
  useEffect(() => {
    setTempSettings({
      brightness: settings.brightness,
      contrast: settings.contrast
    });
  }, [settings.brightness, settings.contrast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages({
          original: dataUrl,
          preview: dataUrl
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages({
          original: dataUrl,
          preview: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    console.log('触发文件选择');
    if (fileInputRef.current) {
      console.log('文件输入框存在');
      fileInputRef.current.click();
    } else {
      console.log('文件输入框不存在');
    }
  };

  const handleDownload = () => {
    if (images.preview) {
      downloadImage(images.preview, '黑白图片.jpg');
    }
  };

  const handleReselect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 处理滑块拖动结束
  const handleSliderChange = (type: 'brightness' | 'contrast', value: number) => {
    setTempSettings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // 处理滑块拖动结束，更新实际设置
  const handleSliderCommit = (type: 'brightness' | 'contrast') => {
    setSettings(prev => ({
      ...prev,
      [type]: tempSettings[type]
    }));
  };

  // 处理模式切换
  const handleModeChange = (mode: typeof settings.mode) => {
    // 根据不同模式设置默认值
    const defaultSettings = {
      classic: { brightness: 100, contrast: 100 },
      'high-contrast': { brightness: 110, contrast: 130 },
      soft: { brightness: 90, contrast: 80 }
    };

    const newSettings = defaultSettings[mode];
    setSettings({
      ...settings,
      mode,
      brightness: newSettings.brightness,
      contrast: newSettings.contrast
    });
    setTempSettings(newSettings);
  };

  return (
    <BasePage>
      <div className="max-w-5xl mx-auto px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          onClick={e => e.stopPropagation()}
        />
        
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">黑白转换</h2>
          <p className="text-sm text-gray-600 mb-6">
            将彩色图片转换为黑白效果。支持多种转换模式，包括经典黑白、高对比度、柔和等效果，可调整亮度和对比度。
          </p>

          {/* 图片上传和预览区域 */}
          <div className="mb-6">
            {!images.original ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-3 text-sm text-gray-600">
                  点击或拖拽图片到此处
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* 原图 */}
                <div className="relative group">
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">原图</div>
                  <img
                    src={images.original || ''}
                    alt="Original"
                    className="w-full h-[400px] object-contain rounded-lg bg-gray-50 transition-all duration-300"
                  />
                  <button 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer rounded-lg"
                    onClick={triggerFileInput}
                    type="button"
                  >
                    <span className="text-white text-sm bg-black/50 px-3 py-1.5 rounded-lg">更换图片</span>
                  </button>
                </div>
                {/* 预览图 */}
                <div className="relative overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">预览图</div>
                  <img
                    src={images.preview || ''}
                    alt="Preview"
                    className="w-full h-[400px] object-contain rounded-lg bg-gray-50 transition-all duration-300"
                    style={{
                      opacity: isProcessing ? 0.5 : 1,
                      filter: isProcessing ? 'blur(2px)' : 'none',
                    }}
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300"
                    style={{
                      opacity: isProcessing ? 1 : 0,
                      visibility: isProcessing ? 'visible' : 'hidden',
                    }}
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[rgb(79,70,228)] border-t-transparent"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 控制面板 */}
          <div className="space-y-4">
            {/* 转换模式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                转换模式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['classic', 'high-contrast', 'soft'].map((mode) => (
                  <button
                    key={mode}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      settings.mode === mode
                        ? 'bg-[rgb(79,70,228)] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${(!images.original || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleModeChange(mode as typeof settings.mode)}
                    disabled={!images.original || isProcessing}
                  >
                    {mode === 'classic' ? '经典黑白' : mode === 'high-contrast' ? '高对比度' : '柔和'}
                  </button>
                ))}
              </div>
            </div>

            {/* 亮度和对比度调节 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  亮度 ({tempSettings.brightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={tempSettings.brightness}
                  onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
                  onMouseUp={() => handleSliderCommit('brightness')}
                  onTouchEnd={() => handleSliderCommit('brightness')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200"
                  style={{ opacity: !images.original || isProcessing ? 0.5 : 1 }}
                  disabled={!images.original || isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  对比度 ({tempSettings.contrast}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={tempSettings.contrast}
                  onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
                  onMouseUp={() => handleSliderCommit('contrast')}
                  onTouchEnd={() => handleSliderCommit('contrast')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200"
                  style={{ opacity: !images.original || isProcessing ? 0.5 : 1 }}
                  disabled={!images.original || isProcessing}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-2.5 py-1 text-xs font-medium text-white bg-[rgb(79,70,228)] rounded-lg hover:bg-[rgb(79,70,228)]/90 transition-all duration-200 disabled:opacity-50"
                onClick={handleDownload}
                disabled={!images.original || isProcessing || !images.preview}
              >
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Grayscale; 