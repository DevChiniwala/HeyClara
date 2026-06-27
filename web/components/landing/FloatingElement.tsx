"use client";

import { useRef, useState, useEffect } from "react";

interface FloatingElementProps {
  shape: "circle" | "hexagon" | "ring" | "dot-grid";
  size: number;
  color?: string;
  duration?: number;
  delay?: number;
  x: number;
  y: number;
  parallax?: number;
}

export default function FloatingElement({
  shape, size, color = "rgba(249, 115, 22, 0.08)",
  duration = 20, delay = 0, x, y, parallax = 0.02,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMouse = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`, top: `${y}%`,
    width: size, height: size,
    transform: `translate(${mouse.x * parallax}px, ${mouse.y * parallax}px)`,
    animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
    opacity: 0.5,
    pointerEvents: "none",
  };

  const center = size / 2;

  if (shape === "circle") {
    return (
      <div ref={ref} style={style}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={center * 0.8} fill="none" stroke={color} strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (shape === "hexagon") {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${center + center * 0.7 * Math.cos(a)},${center + center * 0.7 * Math.sin(a)}`;
    }).join(" ");
    return (
      <div ref={ref} style={style}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={pts} fill="none" stroke={color} strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (shape === "ring") {
    return (
      <div ref={ref} style={style}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={center * 0.6} fill="none" stroke={color} strokeWidth="0.5" />
          <circle cx={center} cy={center} r={center * 0.9} fill="none" stroke={color} strokeWidth="0.3" opacity="0.5" />
        </svg>
      </div>
    );
  }

  // dot-grid
  const dots: JSX.Element[] = [];
  const gap = size / 6;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={gap + col * gap} cy={gap + row * gap} r={1.5}
          fill={color}
        />
      );
    }
  }
  return (
    <div ref={ref} style={style}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots}
      </svg>
    </div>
  );
}
