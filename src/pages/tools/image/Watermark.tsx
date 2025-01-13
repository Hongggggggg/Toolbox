import React, { useState, useCallback } from 'react';

/**
 * 水印配置接口
 */
export interface WatermarkConfig {
  /** 水印内容 */
  content: string;
  /** 字体大小 */
  fontSize: number;
  /** 不透明度 */
  opacity: number;
}

const Watermark: React.FC = () => {
  // 状态管理
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    content: '',
    fontSize: 24,
    opacity: 0.7,
  });
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null);

  // 图片上传处理
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 更新水印
  const updateWatermark = useCallback((config: Partial<WatermarkConfig>) => {
    setWatermark(prev => ({ ...prev, ...config }));
  }, []);

  // 导出图片
  const exportImage = useCallback(() => {
    if (!selectedImage || !watermark.content) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 设置水印样式
      ctx.font = `${watermark.fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${watermark.opacity})`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // 计算水印位置（右下角，留出边距）
      const padding = 20;
      const x = canvas.width - padding;
      const y = canvas.height - padding;

      // 绘制水印
      ctx.fillText(watermark.content, x, y);

      // 导出图片
      const link = document.createElement('a');
      link.download = 'watermarked-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }, [selectedImage, watermark]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:pl-64">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">添加水印</h1>
          <p className="mt-1 text-sm text-gray-500">为图片添加文字水印，支持自定义大小和透明度</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：图片上传和预览区域 */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              {selectedImage ? (
                <div className="p-4">
                  <div className="bg-gray-50 rounded-lg overflow-hidden min-h-[500px] flex items-center justify-center">
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="预览图"
                        className="max-w-[800px] max-h-[500px] object-contain"
                      />
                      {watermark.content && (
                        <div
                          className="absolute bottom-5 right-5 text-white"
                          style={{
                            fontSize: `${watermark.fontSize}px`,
                            opacity: watermark.opacity,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {watermark.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex flex-col items-center justify-center w-full h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-2">拖放图片到此处，或点击上传</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-white text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      选择图片
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：水印控制面板 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">水印设置</h3>
              <div className="space-y-4">
                {/* 水印文字 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    水印文字
                  </label>
                  <input
                    type="text"
                    value={watermark.content}
                    onChange={(e) => updateWatermark({ content: e.target.value })}
                    placeholder="请输入水印文字"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-light focus:border-primary-main transition-colors"
                  />
                </div>

                {/* 字体大小 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    字体大小
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={watermark.fontSize}
                    onChange={(e) => updateWatermark({ fontSize: Number(e.target.value) })}
                    className="w-full accent-primary-main"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {watermark.fontSize}px
                  </div>
                </div>

                {/* 不透明度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    不透明度
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={watermark.opacity * 100}
                    onChange={(e) => updateWatermark({ opacity: Number(e.target.value) / 100 })}
                    className="w-full accent-primary-main"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(watermark.opacity * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 导出按钮 */}
            {selectedImage && watermark.content && (
              <button
                onClick={exportImage}
                className="w-full py-2.5 bg-primary-main text-white text-sm font-medium rounded-md hover:bg-primary-hover transition-colors"
              >
                导出图片
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watermark; 