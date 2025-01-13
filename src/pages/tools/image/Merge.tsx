import React, { useState, useRef, useEffect } from 'react';
import BasePage from '../../../components/layout/BasePage';
import { mergeImages, downloadImage } from '../../../utils/imageProcessing';

interface ImageItem {
  id: string;
  url: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

type AlignType = 'start' | 'center' | 'end';

const Merge = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    gap: 0,
    padding: 0,
    direction: 'vertical' as 'horizontal' | 'vertical',
    align: 'start' as AlignType
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 常量定义
  const MAX_FILE_COUNT = 20;  // 最大文件数量
  const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 最大文件大小（5MB）
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];  // 允许的文件类型

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return '不支持的文件类型，请上传 JPG、PNG 或 WebP 格式的图片';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `图片大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  // 实时预览
  useEffect(() => {
    const updatePreview = async () => {
      if (images.length === 0) {
        setMergedImage(null);
        return;
      }

      setIsProcessing(true);
      try {
        // 计算每张图片的位置
        let currentX = 0;
        let currentY = 0;
        let totalWidth = 0;
        let totalHeight = 0;

        // 第一次遍历计算总宽高
        images.forEach(img => {
          if (settings.direction === 'horizontal') {
            totalWidth += img.originalWidth;
            totalHeight = Math.max(totalHeight, img.originalHeight);
          } else {
            totalWidth = Math.max(totalWidth, img.originalWidth);
            totalHeight += img.originalHeight;
          }
        });

        // 第二次遍历计算位置
        const positions = images.map(img => {
          let x = 0;
          let y = 0;

          if (settings.direction === 'horizontal') {
            // 横向排列时的垂直对齐
            switch (settings.align) {
              case 'start':
                y = 0;
                break;
              case 'center':
                y = (totalHeight - img.originalHeight) / 2;
                break;
              case 'end':
                y = totalHeight - img.originalHeight;
                break;
            }
            x = currentX;
            currentX += img.originalWidth + settings.gap;
          } else {
            // 纵向排列时的水平对齐
            switch (settings.align) {
              case 'start':
                x = 0;
                break;
              case 'center':
                x = (totalWidth - img.originalWidth) / 2;
                break;
              case 'end':
                x = totalWidth - img.originalWidth;
                break;
            }
            y = currentY;
            currentY += img.originalHeight + settings.gap;
          }

          return {
            url: img.url,
            position: { x, y }
          };
        });

        const result = await mergeImages(
          positions,
          {
            gap: settings.gap,
            padding: settings.padding,
            backgroundColor: '#FFFFFF'
          }
        );
        setMergedImage(result);
      } catch (error) {
        console.error('合并图片时出错:', error);
      }
      setIsProcessing(false);
    };

    if (images.length > 0) {
      const timer = setTimeout(updatePreview, 100);
      return () => clearTimeout(timer);
    }
  }, [images, settings]);

  const processNewImages = (files: File[]) => {
    setError(null);

    // 检查文件总数是否超出限制
    if (images.length + files.length > MAX_FILE_COUNT) {
      setError(`最多只能上传 ${MAX_FILE_COUNT} 张图片`);
      return;
    }

    // 验证每个文件
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
    }

    const newImages = files.map(file => {
      return new Promise<ImageItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: img.src,
              width: img.width,
              height: img.height,
              originalWidth: img.width,
              originalHeight: img.height
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(results => {
      setImages(prev => [...prev, ...results]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processNewImages(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processNewImages(files);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDownload = () => {
    if (mergedImage) {
      downloadImage(mergedImage, 'merged.jpg');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedItem];
    newImages.splice(draggedItem, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <BasePage>
      <div className="max-w-5xl mx-auto px-4 py-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          onClick={e => e.stopPropagation()}
        />
        
        {/* 标题 */}
        <div className="text-center mb-3">
          <h2 className="text-xl font-semibold text-gray-900">图片拼接</h2>
          <p className="text-sm text-gray-500 mt-1">将多张图片拼接成一张大图</p>
        </div>

        <style>{`
          input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 24px;
            background: transparent;
            margin: 0;
            padding: 0;
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: linear-gradient(to right, #4F46E5 var(--range-progress), #E5E7EB var(--range-progress));
            border-radius: 2px;
            border: none;
          }

          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #4F46E5;
            border-radius: 50%;
            border: none;
            margin-top: -6px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          input[type="range"]::-moz-range-track {
            width: 100%;
            height: 4px;
            background: linear-gradient(to right, #4F46E5 var(--range-progress), #E5E7EB var(--range-progress));
            border-radius: 2px;
            border: none;
          }

          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #4F46E5;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            background: #6366F1;
            transform: scale(1.1);
          }

          input[type="range"]::-moz-range-thumb:hover {
            background: #6366F1;
            transform: scale(1.1);
          }

          input[type="range"]:focus {
            outline: none;
          }
        `}</style>

        <div className="grid grid-cols-2 gap-4">
          {/* 左侧：布局设置和上传区域 */}
          <div className="space-y-4">
            {/* 布局设置 */}
            <div className="bg-white rounded-xl p-5">
              <h3 className="text-base font-medium text-gray-900 mb-3">布局设置</h3>
              <div className="space-y-4">
                {/* 排列方向 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排列方向</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={`p-2 text-sm rounded-lg border ${
                        settings.direction === 'horizontal'
                          ? 'border-[#4F46E5] bg-[#F5F3FF] text-[#4F46E5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, direction: 'horizontal' }))}
                    >
                      横向排列
                    </button>
                    <button
                      className={`p-2 text-sm rounded-lg border ${
                        settings.direction === 'vertical'
                          ? 'border-[#4F46E5] bg-[#F5F3FF] text-[#4F46E5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, direction: 'vertical' }))}
                    >
                      纵向排列
                    </button>
                  </div>
                </div>

                {/* 对齐方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {settings.direction === 'horizontal' ? '垂直对齐' : '水平对齐'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={`p-2 text-sm rounded-lg border ${
                        settings.align === 'start'
                          ? 'border-[#4F46E5] bg-[#F5F3FF] text-[#4F46E5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, align: 'start' }))}
                    >
                      左对齐
                    </button>
                    <button
                      className={`p-2 text-sm rounded-lg border ${
                        settings.align === 'center'
                          ? 'border-[#4F46E5] bg-[#F5F3FF] text-[#4F46E5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, align: 'center' }))}
                    >
                      居中
                    </button>
                    <button
                      className={`p-2 text-sm rounded-lg border ${
                        settings.align === 'end'
                          ? 'border-[#4F46E5] bg-[#F5F3FF] text-[#4F46E5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, align: 'end' }))}
                    >
                      右对齐
                    </button>
                  </div>
                </div>

                {/* 间距设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片间距</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.gap}
                    onChange={(e) => setSettings(prev => ({ ...prev, gap: parseInt(e.target.value) }))}
                    className="w-full"
                    style={{ '--range-progress': `${settings.gap}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0px</span>
                    <span>{settings.gap}px</span>
                    <span>100px</span>
                  </div>
                </div>

                {/* 内边距设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内边距</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.padding}
                    onChange={(e) => setSettings(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                    className="w-full"
                    style={{ '--range-progress': `${settings.padding}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0px</span>
                    <span>{settings.padding}px</span>
                    <span>100px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="h-px bg-gray-200 my-3 mx-5"></div>

            {/* 上传区域和图片列表 */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-base font-medium text-gray-900">上传图片</h3>
                {images.length > 0 && (
                  <span className="text-sm text-gray-500">{images.length} 张图片</span>
                )}
              </div>

              {/* 上传区域 */}
              <div
                className={`border-2 border-dashed border-gray-200 hover:border-[#4F46E5] hover:bg-[#F5F3FF]/50 transition-all duration-200 cursor-pointer rounded-lg ${
                  images.length === 0 ? 'p-6' : 'p-4'
                }`}
                onClick={triggerFileInput}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className={`text-gray-400 mb-2 ${images.length === 0 ? 'w-12 h-12' : 'w-8 h-8'}`}
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
                  <p className={`font-medium text-gray-900 ${images.length === 0 ? 'text-sm' : 'text-xs'}`}>
                    点击或拖拽上传图片
                  </p>
                  <p className={`text-gray-500 mt-1 ${images.length === 0 ? 'text-xs' : 'text-xs'}`}>
                    支持多选上传，{MAX_FILE_COUNT} 张以内，每张不超过 {MAX_FILE_SIZE / 1024 / 1024}MB
                  </p>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900">预览效果</h3>
                {mergedImage && (
                  <button
                    className="text-sm text-[#4F46E5] hover:text-[#6366F1]"
                    onClick={handleDownload}
                    disabled={isProcessing}
                  >
                    下载图片
                  </button>
                )}
              </div>
              <div className="relative min-h-[500px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col p-4">
                {mergedImage ? (
                  <>
                    <div className="relative group mb-4">
                      <img
                        src={mergedImage}
                        alt="合并预览"
                        className="max-w-full max-h-[400px] rounded-lg mx-auto"
                        style={{ filter: isProcessing ? 'blur(2px)' : 'none' }}
                      />
                      <button
                        className="absolute top-2 right-2 bg-black/50 text-white text-xs p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={() => setMergedImage(null)}
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* 预览区的图片列表 */}
                    <div className="border-t border-gray-200 pt-4 mt-auto">
                      <div className="text-sm text-gray-500 mb-2">拖拽调整顺序</div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group shrink-0 w-20 h-20 cursor-move"
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <img
                              src={image.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <div className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200">
                                {index + 1}
                              </div>
                              <button
                                className="bg-black/50 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={() => handleRemoveImage(image.id)}
                                type="button"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-lg transition-colors duration-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 absolute inset-0 flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                    <p className="text-sm">上传图片后预览效果</p>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <div className="text-sm text-gray-500">处理中...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Merge; 