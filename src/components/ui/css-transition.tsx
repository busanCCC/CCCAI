"use client";

import type * as React from "react";

type CSSTransitionProps = {
  show: boolean;
  enter?: string;
  children: React.ReactNode;
};

export function CSSTransition({ show, enter = "animate-fade-in", children }: CSSTransitionProps) {
  if (!show) return null;

  return <div className={enter}>{children}</div>;
}
