import React from 'react';
import { useDrag } from 'react-dnd';
import { WatermarkConfig } from '../../pages/tools/image/Watermark';

interface WatermarkEditorProps {
  config: WatermarkConfig;
  isActive: boolean;
  onChange: (config: Partial<WatermarkConfig>) => void;
}

/**
 * 水印编辑器组件
 * 用于编辑单个水印的属性
 */
const WatermarkEditor: React.FC<WatermarkEditorProps> = ({
  config,
  isActive,
  onChange,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'watermark',
    item: { type: config.type, id: config.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="space-y-4">
        {/* 文字内容 */}
        {config.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              水印文字
            </label>
            <input
              type="text"
              value={config.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-main"
            />
          </div>
        )}

        {/* 图片上传 */}
        {config.type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              水印图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    onChange({ content: event.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="watermark-image"
            />
            <label
              htmlFor="watermark-image"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              {config.content ? (
                <img
                  src={config.content}
                  alt="水印图片"
                  className="h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <p className="mt-1 text-sm text-gray-600">
                    点击上传水印图片
                  </p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* 字体设置 */}
        {config.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                字体大小
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={config.fontSize}
                onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.fontSize}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                字体颜色
              </label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-full h-10 p-1 rounded-lg"
              />
            </div>
          </>
        )}

        {/* 通用设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            不透明度
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.opacity * 100}
            onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">
            {Math.round(config.opacity * 100)}%
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            旋转角度
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={config.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">
            {config.rotation}°
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            缩放比例
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={config.scale * 100}
            onChange={(e) => onChange({ scale: Number(e.target.value) / 100 })}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">
            {Math.round(config.scale * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkEditor; 