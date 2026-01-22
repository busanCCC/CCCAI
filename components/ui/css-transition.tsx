"use client";

import { useEffect, useState } from "react";

type CSSTransitionProps = {
  show: boolean;
  enter?: string;
  exit?: string;
  duration?: number;
  children: React.ReactNode;
};

export function CSSTransition({
  show,
  enter = "animate-fade-in",
  exit = "animate-fade-out",
  duration = 300,
  children,
}: CSSTransitionProps) {
  const [render, setRender] = useState(show);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (show) {
      setRender(true);
      setAnimClass(enter);
    } else {
      setAnimClass(exit);
      const timer = setTimeout(() => {
        setRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, enter, exit, duration]);

  if (!render) return null;

  return (
    <div
      className={`${animClass} ${!show ? "pointer-events-none" : ""}`}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !show) {
          setRender(false);
        }
      }}
    >
      {children}
    </div>
  );
}
