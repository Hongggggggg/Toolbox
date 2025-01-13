import React, { useState } from 'react';
import { Grid } from 'lucide-react';

const GridCropper = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <Grid className="w-6 h-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">九宫格切图</h2>
      </div>

      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <div className="p-3 bg-indigo-50 rounded-full mb-4">
              <Grid className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-600">点击上传图片</span>
            <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <img
            src={selectedImage}
            alt="预览图"
            className="w-full h-auto rounded-lg"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setSelectedImage(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              重新选择
            </button>
            <button className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700">
              生成九宫格
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCropper; 