import React, { useState, useRef, useEffect, useCallback } from 'react';
import BasePage from '../../../components/layout/BasePage';
import { splitIntoGrid, downloadImage } from '../../../utils/imageProcessing';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageState {
  original: string | null;
  grid: string[];
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const Grid = () => {
  const [images, setImages] = useState<ImageState>({ original: null, grid: [] });
  const [settings, setSettings] = useState({
    padding: 0,      // 内边距
    gap: 0,          // 图片间隙
    backgroundColor: '#FFFFFF', // 背景颜色
    gridType: '9',   // 九宫格或四宫格
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // 当设置改变时更新预览
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      if (images.original && !isProcessing && imageRef.current && completedCrop?.width && completedCrop?.height) {
        setIsProcessing(true);
        try {
          // 创建裁剪后的图片
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
          const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

          canvas.width = completedCrop.width * scaleX;
          canvas.height = completedCrop.height * scaleY;

          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            imageRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
          );

          const croppedImageUrl = canvas.toDataURL('image/jpeg');

          const result = await splitIntoGrid(
            croppedImageUrl,
            settings.gap,
            settings.padding,
            settings.backgroundColor,
            settings.gridType === '4' ? 2 : 3
          );
          if (isMounted) {
            setImages(prev => ({ ...prev, grid: result }));
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
  }, [settings, images.original, completedCrop]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages({
          original: dataUrl,
          grid: []
        });
        setCrop(undefined); // 重置裁剪区域
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
          grid: []
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    downloadImage(imageUrl, `${index + 1}.jpg`);
  };

  const handleDownloadAll = () => {
    images.grid.forEach((imageUrl, index) => {
      setTimeout(() => {
        downloadImage(imageUrl, `${index + 1}.jpg`);
      }, index * 100); // 每张图片下载间隔100ms
    });
  };

  return (
    <BasePage>
      <div className="max-w-7xl mx-auto px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          onClick={e => e.stopPropagation()}
        />
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">宫格切图</h2>
            <p className="text-sm text-gray-600 mb-6">
              将图片切割成九宫格或四宫格，适合社交媒体发布。支持调整内边距和背景颜色，让你的照片展示更加精美。
            </p>

            {/* 主要内容区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：上传和预览区域 */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">原图预览</h3>
                  {!images.original ? (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={triggerFileInput}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-gray-400"
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
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        点击或拖拽上传图片
                      </p>
                      <p className="text-xs text-gray-500">
                        支持 JPG、PNG 格式
                      </p>
                    </div>
                  ) : (
                    <div className="relative group rounded-lg overflow-hidden">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        className="rounded-lg"
                        circularCrop={false}
                      >
                        <img
                          ref={imageRef}
                          src={images.original}
                          alt="Original"
                          className="w-full rounded-lg"
                          onLoad={onImageLoad}
                          style={{ maxHeight: '500px', width: 'auto' }}
                        />
                      </ReactCrop>
                      <button 
                        className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={triggerFileInput}
                        type="button"
                      >
                        更换图片
                      </button>
                    </div>
                  )}
                </div>

                {/* 控制面板 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">参数设置</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          切图模式
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                            settings.gridType === '9'
                              ? 'bg-[rgb(79,70,228)] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => {
                            setSettings(prev => ({ ...prev, gridType: '9' }));
                            // 清空现有的网格图片，触发重新生成
                            setImages(prev => ({ ...prev, grid: [] }));
                          }}
                          disabled={!images.original || isProcessing}
                        >
                          九宫格
                        </button>
                        <button
                          className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                            settings.gridType === '4'
                              ? 'bg-[rgb(79,70,228)] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => {
                            setSettings(prev => ({ ...prev, gridType: '4' }));
                            // 清空现有的网格图片，触发重新生成
                            setImages(prev => ({ ...prev, grid: [] }));
                          }}
                          disabled={!images.original || isProcessing}
                        >
                          四宫格
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          内边距
                        </label>
                        <span className="text-xs text-gray-500">{settings.padding}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={settings.padding}
                        onChange={(e) => setSettings(prev => ({ ...prev, padding: Number(e.target.value) }))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity duration-200 hover:bg-gray-300"
                        style={{
                          opacity: !images.original || isProcessing ? 0.5 : 1,
                          cursor: !images.original || isProcessing ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!images.original || isProcessing}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          背景颜色
                        </label>
                        <span className="text-xs text-gray-500">{settings.backgroundColor}</span>
                      </div>
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-full h-8 rounded cursor-pointer"
                        style={{
                          opacity: !images.original || isProcessing ? 0.5 : 1,
                          cursor: !images.original || isProcessing ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!images.original || isProcessing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：宫格预览和下载 */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">宫格预览</h3>
                  {images.grid.length > 0 ? (
                    <div className={settings.gridType === '4' ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-3 gap-2'}>
                      {images.grid.map((imageUrl, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Grid ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
                            onClick={() => handleDownload(imageUrl, index)}
                            type="button"
                          >
                            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">下载</span>
                          </button>
                          <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400 mb-2"
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
                        <p className="text-sm text-gray-500">
                          {isProcessing ? '处理中...' : '上传图片后预览宫格效果'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 使用说明 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">使用说明</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[rgb(79,70,228)]">1.</span>
                      <span>上传图片后可以拖动选择需要裁剪的区域</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[rgb(79,70,228)]">2.</span>
                      <span>选择九宫格或四宫格模式，调整内边距和背景颜色</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[rgb(79,70,228)]">3.</span>
                      <span>可以单独下载每个格子的图片，或点击下方按钮一次性下载全部</span>
                    </li>
                  </ul>
                </div>

                {/* 下载全部按钮 */}
                {images.grid.length > 0 && (
                  <button
                    className="w-full bg-[rgb(79,70,228)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[rgb(79,70,228)]/90 transition-colors disabled:opacity-50"
                    onClick={handleDownloadAll}
                    disabled={isProcessing}
                  >
                    下载全部图片 ({settings.gridType === '4' ? '4' : '9'}张)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Grid; 