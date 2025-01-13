import React, { useState, useRef, useEffect } from 'react';
import BasePage from '../../../components/layout/BasePage';
import { extractSketch, downloadImage } from '../../../utils/imageProcessing';

interface ImageState {
  original: string | null;
  preview: string | null;
}

const Sketch = () => {
  const [images, setImages] = useState<ImageState>({ original: null, preview: null });
  const [settings, setSettings] = useState({
    threshold: 30,    // 边缘检测阈值
    thickness: 50,    // 线条粗细
    smoothing: 50     // 平滑度
  });
  const [tempSettings, setTempSettings] = useState({
    threshold: 30,
    thickness: 50,
    smoothing: 50
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当设置改变时更新预览
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      if (images.original && !isProcessing) {
        setIsProcessing(true);
        try {
          const result = await extractSketch(
            images.original,
            settings.threshold,
            settings.thickness,
            settings.smoothing
          );
          if (isMounted) {
            setImages(prev => ({ ...prev, preview: result }));
          }
        } catch (error) {
          console.error('处理图片时出错:', error);
        }
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(updatePreview, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [settings, images.original]);

  // 初始化临时设置
  useEffect(() => {
    setTempSettings({
      threshold: settings.threshold,
      thickness: settings.thickness,
      smoothing: settings.smoothing
    });
  }, [settings.threshold, settings.thickness, settings.smoothing]);

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
      downloadImage(images.preview, '线稿.jpg');
    }
  };

  // 处理滑块拖动
  const handleSliderChange = (type: keyof typeof settings, value: number) => {
    setTempSettings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // 处理滑块拖动结束，更新实际设置
  const handleSliderCommit = (type: keyof typeof settings) => {
    if (tempSettings[type] !== settings[type]) {
      setSettings(prev => ({
        ...prev,
        [type]: tempSettings[type]
      }));
    }
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">线稿提取</h2>
          <p className="text-sm text-gray-600 mb-6">
            从图片中提取线条轮廓，生成清晰的线稿效果。支持调整边缘检测阈值、线条粗细和平滑度。
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
            {/* 参数调节 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  边缘检测阈值 ({tempSettings.threshold}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.threshold}
                  onChange={(e) => handleSliderChange('threshold', Number(e.target.value))}
                  onMouseUp={() => handleSliderCommit('threshold')}
                  onTouchEnd={() => handleSliderCommit('threshold')}
                  onKeyUp={() => handleSliderCommit('threshold')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200 hover:bg-gray-300"
                  style={{
                    opacity: !images.original || isProcessing ? 0.5 : 1,
                    cursor: !images.original || isProcessing ? 'not-allowed' : 'pointer'
                  }}
                  disabled={!images.original || isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  线条粗细 ({tempSettings.thickness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.thickness}
                  onChange={(e) => handleSliderChange('thickness', Number(e.target.value))}
                  onMouseUp={() => handleSliderCommit('thickness')}
                  onTouchEnd={() => handleSliderCommit('thickness')}
                  onKeyUp={() => handleSliderCommit('thickness')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200 hover:bg-gray-300"
                  style={{
                    opacity: !images.original || isProcessing ? 0.5 : 1,
                    cursor: !images.original || isProcessing ? 'not-allowed' : 'pointer'
                  }}
                  disabled={!images.original || isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  平滑度 ({tempSettings.smoothing}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.smoothing}
                  onChange={(e) => handleSliderChange('smoothing', Number(e.target.value))}
                  onMouseUp={() => handleSliderCommit('smoothing')}
                  onTouchEnd={() => handleSliderCommit('smoothing')}
                  onKeyUp={() => handleSliderCommit('smoothing')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200 hover:bg-gray-300"
                  style={{
                    opacity: !images.original || isProcessing ? 0.5 : 1,
                    cursor: !images.original || isProcessing ? 'not-allowed' : 'pointer'
                  }}
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

export default Sketch; 