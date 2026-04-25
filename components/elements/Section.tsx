import React from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
}
const Section: React.FC<SectionProps> = ({ children, className }) => {
  return (
    <>
      <div className="gradient">
        <div className="main" />
      </div>
      <div
        className={cn(
          "p-0 sm:p-4 relative z-20 overflow-x-hidden overflow-y-auto pb-10 max-h-[90dvh] lg:max-h-screen",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};

export default Section;
