import React, { useState, useRef } from 'react';
import BasePage from '../../../components/layout/BasePage';
import { OCRProcessor } from '../../../components/image/ocr/OCRProcessor';
import { OCRResult } from '../../../types/ocr';
import { validateImageFile } from '../../../utils/fileValidation';

/**
 * OCR页面组件
 * 提供图片文字识别功能
 */
const OCR: React.FC = () => {
  // 状态管理
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  
  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理文件选择
   * @param e 文件选择事件
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件
    const validationError = validateImageFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setOcrResult(null);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  /**
   * 处理拖放文件
   * @param e 拖放事件
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    // 验证文件
    const validationError = validateImageFile(droppedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(droppedFile);
    setError(null);
    setOcrResult(null);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(droppedFile);
  };

  /**
   * 触发文件选择
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * 清除当前图片和结果
   */
  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setOcrResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <BasePage>
      <div className="max-w-5xl mx-auto px-4 py-2">
        {/* 标题区域 */}
        <div className="text-center mb-3">
          <h2 className="text-xl font-semibold text-gray-900">图片文字识别</h2>
          <p className="text-sm text-gray-500 mt-1">支持识别图片中的文字内容</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 左侧：上传区域 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-base font-medium text-gray-900">上传图片</h3>
                {file && (
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={handleClear}
                  >
                    清除
                  </button>
                )}
              </div>

              {/* 文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                onClick={e => e.stopPropagation()}
              />

              {/* 上传区域 */}
              <div
                className={`border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer rounded-lg ${
                  !file ? 'p-6' : 'p-4'
                }`}
                onClick={triggerFileInput}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative group h-[400px]">
                    <img
                      src={preview}
                      alt="预览图"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-2"
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
                    <p className="font-medium text-sm text-gray-900">
                      点击或拖拽上传图片
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      支持jpg、png、webp格式，大小不超过5MB
                    </p>
                  </div>
                )}
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：OCR处理组件 */}
          <div className="space-y-4">
            {file && preview && (
              <OCRProcessor
                file={file}
                preview={preview}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                ocrResult={ocrResult}
                setOcrResult={setOcrResult}
                setError={setError}
              />
            )}
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default OCR; 