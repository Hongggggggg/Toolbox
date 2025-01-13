import React, { useCallback, useState } from 'react';
import { OCRProcessorProps, OCRResult } from '../../../types/ocr';

/**
 * OCR处理组件
 * 负责处理OCR识别和显示结果
 */
export const OCRProcessor: React.FC<OCRProcessorProps> = ({
  file,
  preview,
  isProcessing,
  setIsProcessing,
  ocrResult,
  setOcrResult,
  setError,
}) => {
  // 添加本地状态用于管理复制成功提示
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  /**
   * 处理OCR识别
   */
  const handleOCR = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const startTime = Date.now();
      
      // 调用后端OCR接口
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OCR处理失败');
      }

      if (!data.blocks || !Array.isArray(data.blocks)) {
        throw new Error('OCR返回数据格式错误');
      }

      const processingTime = Date.now() - startTime;

      // 处理OCR结果
      const result: OCRResult = {
        blocks: data.blocks.map((block: any) => {
          try {
            return {
              text: String(block.text || ''),
              confidence: Number(block.confidence || 0),
              box: {
                x: Number(block.box[0] || 0),
                y: Number(block.box[1] || 0),
                width: Number(block.box[2] - block.box[0] || 0),
                height: Number(block.box[3] - block.box[1] || 0),
              },
            };
          } catch (e) {
            console.error('解析文本块数据失败:', e);
            return null;
          }
        }).filter(Boolean),
        fullText: data.blocks
          .map((block: any) => block.text)
          .filter(Boolean)
          .join('\n'),
        processingTime,
      };

      if (result.blocks.length === 0) {
        throw new Error('未能识别出任何文字');
      }

      setOcrResult(result);
    } catch (err) {
      console.error('OCR处理错误:', err);
      setError(err instanceof Error ? err.message : '处理过程中发生错误，请重试');
      setOcrResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [file, setError, setIsProcessing, setOcrResult]);

  /**
   * 复制文本到剪贴板
   */
  const handleCopyText = async () => {
    if (!ocrResult?.fullText) return;

    try {
      await navigator.clipboard.writeText(ocrResult.fullText);
      // 显示复制成功提示
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      setError('复制文本失败，请手动复制');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">识别结果</h3>
        <div className="space-x-2">
          {!isProcessing && !ocrResult && (
            <button
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOCR}
              disabled={isProcessing}
            >
              开始识别
            </button>
          )}
          {ocrResult && (
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
              onClick={handleCopyText}
            >
              复制文本
            </button>
          )}
        </div>
      </div>

      {/* 状态提示 */}
      {copySuccess && (
        <div className="mb-4 p-2.5 rounded-lg text-sm bg-green-50 text-green-600">
          复制成功
        </div>
      )}

      <div className="relative min-h-[400px] border border-gray-200 rounded-lg">
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">正在识别中...</p>
            </div>
          </div>
        ) : ocrResult ? (
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>识别用时：{(ocrResult.processingTime / 1000).toFixed(2)}秒</span>
                <span>识别文本块：{ocrResult.blocks.length}个</span>
              </div>
              <div className="relative h-[400px]">
                <div className="relative w-full h-full">
                  <img
                    src={preview}
                    alt="OCR结果"
                    className="w-full h-full object-contain rounded-lg ocr-result-image"
                  />
                  {/* 绘制识别框 */}
                  <div className="absolute inset-0">
                    {ocrResult.blocks.map((block, index) => {
                      // 获取图片实际显示尺寸
                      const imgElement = document.querySelector('.ocr-result-image') as HTMLImageElement;
                      if (!imgElement) return null;

                      const displayWidth = imgElement.clientWidth;
                      const displayHeight = imgElement.clientHeight;
                      const naturalWidth = imgElement.naturalWidth;
                      const naturalHeight = imgElement.naturalHeight;

                      // 计算缩放比例
                      const scaleX = displayWidth / naturalWidth;
                      const scaleY = displayHeight / naturalHeight;
                      const scale = Math.min(scaleX, scaleY);

                      // 计算图片在容器中的实际位置
                      const imageWidth = naturalWidth * scale;
                      const imageHeight = naturalHeight * scale;
                      const offsetX = (displayWidth - imageWidth) / 2;
                      const offsetY = (displayHeight - imageHeight) / 2;

                      // 计算文本框的位置和大小
                      const x = block.box.x * scale + offsetX;
                      const y = block.box.y * scale + offsetY;
                      const width = block.box.width * scale;
                      const height = block.box.height * scale;

                      return (
                        <div
                          key={index}
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 group"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                          }}
                        >
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
                            <div className="bg-white text-xs px-2 py-1 rounded shadow-lg border border-gray-200">
                              <div>置信度：{(block.confidence * 100).toFixed(1)}%</div>
                              <div className="max-w-xs truncate">{block.text}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">识别文本</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {ocrResult.fullText}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p className="text-sm">点击"开始识别"按钮开始OCR识别</p>
          </div>
        )}
      </div>
    </div>
  );
}; 