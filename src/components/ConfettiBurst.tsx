import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiBurstProps {
  trigger: boolean;
}

export function ConfettiBurst({ trigger }: ConfettiBurstProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 1500;
    const end = Date.now() + duration;

    const colors = ["#5B0E14", "#F1E194", "#ffffff", "#c0392b", "#f39c12"];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, [trigger]);

  return null;
}
