import React from 'react';

interface ImagePreviewProps {
  image: string;
}

const ImagePreview = ({ image }: ImagePreviewProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">图片预览</h2>
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={image}
          alt="预览图"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImagePreview;