"use client";

import { useState, useEffect } from "react";

interface RandomValues {
  xOffset: number;
  duration: number;
  left: number;
}

export const FloatingMessages: React.FC<{ 
  delay?: number; 
  text?: string;
}> = ({ delay = 0, text = "" }) => {
  const [randomValues, setRandomValues] = useState<RandomValues | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRandomValues({
        xOffset: Math.random() * 30 - 15,
        duration: Math.random() * 10 + 15,
        left: Math.random() * 100,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!randomValues) return null;

  return (
    <div
      className="absolute flex items-center text-center blur-[0.6px] pointer-events-none animate-float-up"
      style={{ 
        left: `${randomValues.left}%`,
        animationDuration: `${randomValues.duration}s`,
        animationDelay: `${delay}s`,
        // @ts-expect-error CSS 변수
        '--x-offset': `${randomValues.xOffset}vw`,
      }}
    >
      <div className="text-sm">{text}</div>
    </div>
  );
};
