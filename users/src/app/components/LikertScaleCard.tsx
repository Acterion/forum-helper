import { agreementScale } from "@/static/scales";
import React from "react";

interface LikertScaleCardProps {
  label?: string;
  value: number | null;
  setValue: (value: number) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  checkboxes?: boolean;
  options?: Record<number, string>;
  required?: boolean;
}

// Helper function to parse markdown-style bold text
function parseMarkdownBold(text: string): React.ReactNode[] {
  if (!text) return [text];

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Remove the ** and make it bold
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

export default function LikertScaleCard({
  value,
  setValue,
  label,
  inputProps,
  checkboxes = true,
  options = agreementScale,
  required = false,
}: LikertScaleCardProps) {
  // Generate a unique name for this radio group
  const groupName = React.useMemo(() => `likert-${Math.random().toString(36).substr(2, 9)}`, []);

  if (checkboxes) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="mb-4">
          <span className="text-lg font-medium text-gray-800 leading-relaxed block">
            {parseMarkdownBold(label ?? "Level:")}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          {Object.entries(options).map(([level, labelText]) => {
            const numLevel = Number(level);
            const inputId = `${groupName}-${numLevel}`;
            return (
              <label
                key={`${numLevel}-${labelText}`}
                className="flex flex-col items-center space-y-2 cursor-pointer group">
                <input
                  type="radio"
                  id={inputId}
                  name={groupName}
                  value={numLevel}
                  checked={value === numLevel}
                  onChange={() => setValue(numLevel)}
                  className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required={required}
                  {...inputProps}
                />
                <span className="text-sm text-center text-gray-600 group-hover:text-gray-800 transition-colors duration-200 max-w-[80px] leading-tight">
                  {labelText}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mb-4">
        <span className="text-lg font-medium text-gray-800 leading-relaxed block">
          {parseMarkdownBold(label ?? "Level:")}
        </span>
      </div>
      <div className="px-2">
        <input
          type="range"
          min="1"
          max="5"
          value={value || 3} // default to center if no value
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full appearance-none h-2 bg-gray-200 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            WebkitAppearance: "none",
            backgroundSize: "auto", // Ensures no fill effect
          }}
          required={required}
          {...inputProps}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <span key={level} className="text-center font-medium">
              {level}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
