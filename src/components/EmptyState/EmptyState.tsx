import React from "react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({ icon, children }) => {
  return (
    <div
      className="
        flex flex-col items-center justify-center gap-3
        p-6 rounded-xl
        border border-gray-200 dark:border-gray-700
        bg-gray-50 dark:bg-gray-800/40
        text-gray-700 dark:text-gray-300
        shadow-inner shadow-gray-300/40 dark:shadow-gray-900/40
        hover:shadow-md dark:hover:shadow-lg
        hover:shadow-gray-300/60 dark:hover:shadow-black/60
        transition-all duration-500
        animate-fade-in
      "
    >
      {icon && (
        <div className="text-5xl opacity-70 animate-fade-in-slow">
          {icon}
        </div>
      )}

      <div
        className="
          text-center
          text-base sm:text-lg
          italic
          leading-relaxed
          animate-fade-in
        "
      >
        {children}
      </div>
    </div>
  );
};

export default EmptyState;
