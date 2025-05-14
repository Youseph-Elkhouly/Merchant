import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 500 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M40 20h120v100H40z"
          fill="#FF4500"
        />
        <path
          d="M40 20c20 0 30 0 60 0s40 0 60 0c-10 20-20 30-60 30s-50-10-60-30z"
          fill="#FFFFFF"
        />
        <path
          d="M70 50l60 0"
          stroke="#FF4500"
          strokeWidth="40"
        />
      </g>
      <text
        x="180"
        y="95"
        fill="#FF4500"
        style={{
          fontSize: '80px',
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        MERCHANT
      </text>
    </svg>
  );
};

export default Logo; 