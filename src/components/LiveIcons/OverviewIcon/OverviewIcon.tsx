import { useEffect, useState } from "react";

type Props = {
  active?: boolean; // будет менять цвет
};

const OverviewIcon: React.FC<Props> = ({ active = false }) => {
  const [blink, setBlink] = useState(false);
  const [pulse, setPulse] = useState(1);

  // Моргание каждые 10 секунд
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 300);
    }, 10000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Пульсация зрачка каждые 5 секунд
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(0.8);
      setTimeout(() => setPulse(1), 500);
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <svg
      className={`w-6 h-6 ${active ? "text-white" : "text-gray-400 dark:text-gray-300"}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Верхнее веко */}
      <path
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7"
        className="transition-transform duration-300 ease-in-out"
        style={{
          transformOrigin: "center",
          transform: blink ? "scaleY(0.2)" : "scaleY(1)",
        }}
      />

      {/* Нижнее веко */}
      <path
        d="M2.458 12C3.732 16.057 7.523 19 12 19c4.477 0 8.268-2.943 9.542-7"
        className="transition-transform duration-300 ease-in-out"
        style={{
          transformOrigin: "center",
          transform: blink ? "scaleY(0.2)" : "scaleY(1)",
        }}
      />

      {/* Зрачок */}
      <circle
        cx="12"
        cy="12"
        r={blink ? 0 : 3 * pulse}
        fill="currentColor"
        className="transition-all duration-200"
      />
    </svg>
  );
};

export default OverviewIcon;
