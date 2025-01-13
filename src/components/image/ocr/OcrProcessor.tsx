import React, { useState } from 'react';
import { FileText, Copy } from 'lucide-react';

interface OcrProcessorProps {
  image: string;
}

const OcrProcessor = ({ image }: OcrProcessorProps) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOcr = async () => {
    setIsProcessing(true);
    // TODO: 实现 OCR 处理逻辑
    setTimeout(() => {
      setRecognizedText('这是示例识别文本。实际使用时需要接入 OCR API。');
      setIsProcessing(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recognizedText);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">文字识别</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <img
            src={image}
            alt="待识别图片"
            className="w-full h-auto rounded-lg"
          />
          <button
            onClick={handleOcr}
            disabled={isProcessing}
            className={`mt-4 w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isProcessing ? '识别中...' : '开始识别'}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={recognizedText}
            onChange={(e) => setRecognizedText(e.target.value)}
            placeholder="识别结果将在这里显示..."
            className="w-full h-[300px] p-4 text-gray-700 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {recognizedText && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
              title="复制文本"
            >
              <Copy className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrProcessor; 