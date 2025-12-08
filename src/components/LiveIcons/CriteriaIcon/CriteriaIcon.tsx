import { useEffect, useState } from "react";

const CriteriaIcon = ({ active = false }: { active?: boolean }) => {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setFlip((prev) => !prev), 7000);
    return () => clearInterval(interval);
  }, []);

  const coverGradient = active
    ? "url(#coverActive)"
    : "url(#coverInactive)";
  const pageGradient = active
    ? "url(#pageActive)"
    : "url(#pageInactive)";
  const outlineColor = active ? "#9fa8ff" : "#777";

  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
      <defs>
        {/* Градиенты обложки */}
        <linearGradient id="coverActive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b2bc7" />
          <stop offset="100%" stopColor="#241a8a" />
        </linearGradient>

        <linearGradient id="coverInactive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0e0e5" />
          <stop offset="100%" stopColor="#c8c8cc" />
        </linearGradient>

        {/* Градиенты страниц */}
        <linearGradient id="pageActive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c9d0ff" />
        </linearGradient>

        <linearGradient id="pageInactive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f1f4" />
        </linearGradient>

        {/* Лёгкая внутренняя тень страницы */}
        <linearGradient id="innerShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00000015" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Левая твёрдая обложка — премиум геометрия */}
      <path
        d="
          M4 3.5
          L11 3
          Q12 3 12 4
          L12 20
          Q12 21 11 21
          L4 20.5
          Q3 20.3 3 19.7
          L3 4.3
          Q3 3.7 4 3.5
          Z
        "
        fill={coverGradient}
        stroke={outlineColor}
        strokeWidth="0.6"
      />

      {/* Блик на обложке */}
      <path
        d="
          M4.5 4
          L10.5 4
          Q11 4 11 4.5
          L11 19.5
          Q11 20 10.5 20
          L4.5 19
          Z
        "
        fill="#ffffff15"
      />

      {/* Перелистывающая страница — теперь изогнутая */}
      <path
        d="
          M4.3 4.4
          C6 3.7 9.5 3.7 11.3 4.4
          V19.6
          C9.5 20.3 6 20.3 4.3 19.6
          Z
        "
        fill={pageGradient}
        style={{
          transformOrigin: "left center",
          transform: flip ? "rotateY(-160deg)" : "rotateY(0deg)",
          transition: "transform 0.8s cubic-bezier(.45,.05,.55,.95)"
        }}
      />

      {/* Правая страница с реалистичным изгибом */}
      <path
        d="
          M12 4
          C13 3.3 19 3.8 19 4.2
          V19.8
          C19 20.2 13 20.7 12 20
          Z
        "
        fill={pageGradient}
        stroke={outlineColor}
        strokeWidth="0.5"
      />

      {/* Корешок / тень между страницами */}
      <rect x="11.8" y="4" width="0.6" height="16" fill="url(#innerShadow)" />

      {/* Общий контур */}
      <rect
        x="3.5"
        y="3.5"
        width="16.5"
        height="17"
        rx="2"
        fill="none"
        stroke={outlineColor}
        strokeWidth="0.5"
      />
    </svg>
  );
};

export default CriteriaIcon;
