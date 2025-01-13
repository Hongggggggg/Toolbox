import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toolCategories, Tool, ToolCategory } from '../../data/tools';
import ToolCard from '../../components/tools/ToolCard';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  // 获取当前分类的工具
  const tools = useMemo(() => {
    const currentCategory = toolCategories.find((cat: ToolCategory) => cat.id === category);
    return currentCategory ? currentCategory.tools : [];
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:pl-64">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool: Tool) => (
            <ToolCard key={tool.path} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 