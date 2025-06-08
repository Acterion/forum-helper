import { agreementScale } from "@/static/scales";
import React from "react";

interface LikertScaleProps {
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

export default function LikertScale({
  value,
  setValue,
  label,
  inputProps,
  checkboxes = true,
  options = agreementScale,
  required = false,
}: LikertScaleProps) {
  // Generate a unique name for this radio group
  const groupName = React.useMemo(() => `likert-${Math.random().toString(36).substr(2, 9)}`, []);

  if (checkboxes) {
    return (
      <div className="flex flex-col space-y-2 my-4 mb-12">
        <span className="font-semibold">{parseMarkdownBold(label ?? "Level:")}</span>
        <div className="flex justify-between">
          {Object.entries(options).map(([level, labelText]) => {
            const numLevel = Number(level);
            const inputId = `${groupName}-${numLevel}`;
            return (
              <label key={`${numLevel}-${labelText}`} className="flex flex-col items-center space-y-1">
                <input
                  type="radio"
                  id={inputId}
                  name={groupName}
                  value={numLevel}
                  checked={value === numLevel}
                  onChange={() => setValue(numLevel)}
                  className="cursor-pointer"
                  required={required}
                  {...inputProps}
                />
                <span className="text-xs text-center">{labelText}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <span className="font-semibold">{parseMarkdownBold(label ?? "Level:")}</span>
      <input
        type="range"
        min="1"
        max="5"
        value={value || 3} // default to center if no value
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full appearance-none h-1 bg-gray-200 rounded-full cursor-pointer"
        style={{
          WebkitAppearance: "none",
          backgroundSize: "auto", // Ensures no fill effect
        }}
        required={required}
        {...inputProps}
      />
      <div className="flex justify-between text-sm text-gray-500">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level}>{level}</span>
        ))}
      </div>
    </div>
  );
}
