import React from 'react';
import { Image, Wand2, Grid, FileText, Images } from 'lucide-react';
import { ImageTool } from '../../../types/image';

interface ImageToolbarProps {
  selectedTool: ImageTool;
  onToolSelect: (tool: ImageTool) => void;
}

const tools = [
  { id: 'basic' as const, icon: Image, label: '基础编辑' },
  { id: 'style' as const, icon: Wand2, label: '滤镜效果' },
  { id: 'grid' as const, icon: Grid, label: '九宫格' },
  { id: 'ocr' as const, icon: FileText, label: '文字识别' },
  { id: 'merge' as const, icon: Images, label: '图片拼接' },
];

const ImageToolbar = ({ selectedTool, onToolSelect }: ImageToolbarProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-wrap sm:flex-nowrap">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`flex-1 flex flex-col items-center py-4 px-6 space-y-2 transition-colors ${
              selectedTool === tool.id
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
            }`}
          >
            <tool.icon className="w-6 h-6" />
            <span className="text-sm font-medium">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageToolbar;