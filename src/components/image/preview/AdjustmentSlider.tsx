import React from 'react';

interface AdjustmentSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const AdjustmentSlider = ({ label, value, onChange }: AdjustmentSliderProps) => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="200"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default AdjustmentSlider;