import React from 'react';

export default function LoadingDots() {
  return (
    <span className="flex items-center space-x-1">
      <span className="animate-bounce dot">•</span>
      <span className="animate-bounce dot" style={{ animationDelay: '0.2s' }}>•</span>
      <span className="animate-bounce dot" style={{ animationDelay: '0.4s' }}>•</span>
    </span>
  );
}
