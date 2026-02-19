import { useState, useEffect } from 'react';

export default function AnimatedCounter({ value = 0, duration = 1500, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const num = typeof value === 'number' && !Number.isNaN(value) ? Math.max(0, Math.floor(value)) : 0;

  useEffect(() => {
    if (num <= 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const step = (ts) => {
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 2;
      const current = Math.floor(eased * num);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [num, duration]);

  return <>{display}{suffix}</>;
}
