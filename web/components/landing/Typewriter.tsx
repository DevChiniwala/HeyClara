"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export default function Typewriter({ text, speed = 50, delay = 500, className = "" }: TypewriterProps) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started || displayed >= text.length) return;
    const interval = setInterval(() => {
      setDisplayed((p) => Math.min(p + 1, text.length));
    }, speed);
    return () => clearInterval(interval);
  }, [started, displayed, text, speed]);

  return (
    <span className={className}>
      {text.slice(0, displayed)}
      {displayed < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}
