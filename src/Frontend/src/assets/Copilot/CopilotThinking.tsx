// Libraries
import React from 'react';

// Styles
import './CopilotThinking.css';


interface Parameters {
  width?: number;
  height?: number;
};

export const CopilotThinkingIcon = ({ width = 20, height = 20 }: Parameters) => (
  <div className="thinking-icon">
    <svg width={width} height={height} viewBox="0 0 300 300">
      <defs>
        <linearGradient id="gradient-fill" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="300" y2="0">
          <stop offset="0%">
            <animate attributeName="stop-color" values="#00E06B;#CB0255;#00E06B" dur="5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%">
            <animate attributeName="stop-color" values="#04AFC8;#8904C5;#04AFC8" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <clipPath id="clip">
          <rect className="square s1" x="0" y="0" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s2" x="100" y="0" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s3" x="200" y="0" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s4" x="0" y="100" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s5" x="200" y="100" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s6" x="0" y="200" rx="12" ry="12" height="90" width="90"></rect>
          <rect className="square s7" x="100" y="200" rx="12" ry="12" height="90" width="90"></rect>
        </clipPath>
      </defs>
      <rect className="gradient" clipPath="url('#clip')" height="300" width="300"></rect>
    </svg>
  </div>
);