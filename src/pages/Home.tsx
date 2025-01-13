import React, { useState, useMemo } from 'react';
import { Tool, ToolCategory, toolCategories } from '../data/tools';
import ToolCard from '../components/tools/ToolCard';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // 获取所有工具
  const allTools = useMemo(() => {
    return toolCategories.flatMap((category: ToolCategory) => category.tools);
  }, []);

  // 根据搜索词过滤工具
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTools;
    }
    const query = searchQuery.toLowerCase().trim();
    return allTools.filter((tool: Tool) => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query)
    );
  }, [allTools, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:pl-64">
      <div className="max-w-7xl mx-auto px-4">
        {/* 搜索框 */}
        <div className="mb-8">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索工具..."
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-main transition-colors"
              />
              <div className="absolute left-3 inset-y-0 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: Tool) => (
            <ToolCard key={tool.path} {...tool} />
          ))}
        </div>

        {/* 无搜索结果提示 */}
        {searchQuery && filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到相关工具</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 