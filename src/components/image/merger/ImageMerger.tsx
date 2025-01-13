import React, { useState } from 'react';
import { Images, Plus, X } from 'lucide-react';

const ImageMerger = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <Images className="w-6 h-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">图片拼接</h2>
      </div>

      <div className="space-y-6">
        {/* 图片上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Plus className="w-12 h-12 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">添加图片</span>
            <span className="mt-1 text-xs text-gray-400">
              支持多选，可拖拽排序
            </span>
          </label>
        </div>

        {/* 图片预览区域 */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-w-1 aspect-h-1"
              >
                <img
                  src={image}
                  alt={`上传图片 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        {images.length > 1 && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setImages([])}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              清空
            </button>
            <button className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700">
              合并图片
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageMerger; 