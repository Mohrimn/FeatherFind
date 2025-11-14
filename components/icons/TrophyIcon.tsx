import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21A7.97 7.97 0 0 1 12 20a7.97 7.97 0 0 1-1.03-1.79A1.03 1.03 0 0 0 10 17v-2.34" />
    <path d="M12 15V2.5A2.5 2.5 0 0 1 14.5 5V7" />
    <path d="M12 15V2.5A2.5 2.5 0 0 0 9.5 5V7" />
    <path d="M12 2v13" />
  </svg>
);