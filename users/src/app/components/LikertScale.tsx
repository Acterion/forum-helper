import React from 'react';

interface LikertScaleProps {
    label?: string;
    value: number | null;
    setValue: (value: number) => void;
}

export default function LikertScale({ value, setValue, label }: LikertScaleProps) {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <span className="font-semibold">{label ?? "Confidence Level:"}</span>
      <input
        type="range"
        min="1"
        max="5"
        value={value || 3} // default to center if no value
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full appearance-none h-1 bg-gray-200 rounded-full cursor-pointer"
        style={{
            WebkitAppearance: 'none',
            backgroundSize: 'auto', // Ensures no fill effect
          }}
      />
      <div className="flex justify-between text-sm text-gray-500">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level}>{level}</span>
        ))}
      </div>
    </div>
  );
}
