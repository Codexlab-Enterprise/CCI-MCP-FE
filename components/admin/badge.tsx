import React from "react";

const Badge = ({
  label,
  isActive,
  color = "default",
  onClick,
}: {
  label: string;
  isActive: boolean;
  color?: "default" | "success" | "danger";
  onClick: () => void;
}) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors";

  const colorClasses = {
    default: {
      active: "bg-blue-500 text-white",
      inactive:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300",
    },
    success: {
      active: "bg-green-500 text-white",
      inactive:
        "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300",
    },
    danger: {
      active: "bg-red-500 text-white",
      inactive:
        "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300",
    },
  };

  return (
    <button
      className={`${baseClasses} ${isActive ? colorClasses[color].active : colorClasses[color].inactive}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Badge;
