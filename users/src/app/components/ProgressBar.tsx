interface ProgressBarProps {
    progress: number;
  }
  
  export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full"
          style={{ width: `${progress}%` }}/>
        <div className="absolute inset-0 flex items-center justify-center pl-3 text-xs font-medium text-gray-900">
          {Math.round(progress)}%
        </div>
      </div>
    );
  }
  