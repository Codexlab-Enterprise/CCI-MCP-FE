import { FC, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  if (!isMounted) return <div className="w-6 h-6" />;

  const isLight = theme === "light";
  const onChange = () => setTheme(isLight ? "dark" : "light");

  return (
    <button
      type="button"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={onChange}
      className={cn(
        "px-px transition-opacity hover:opacity-80 cursor-pointer text-muted-foreground",
        className,
      )}
    >
      {isLight ? <MoonFilledIcon size={22} /> : <SunFilledIcon size={22} />}
    </button>
  );
};
