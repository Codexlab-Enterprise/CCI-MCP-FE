import { cn } from "@heroui/theme";
import React from "react";
// import { cn } from 'tailwind-variants';

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
  // Define any props you want to pass to the Section component
}
const Section: React.FC<SectionProps> = ({ children, className }) => {
  return (
    <>
      <div className="gradient">
        <div className="main" />
        {/* <Image src="/images/hex.png" alt="logo" width={1000} height={1000} className="rounded absolute top-2 left-2"/> */}
      </div>
      <div
        className={cn(
          "p-0 sm:p-4 relative z-20 overflow-x-hidden overflow-y-auto pb-10 max-h-[90dvh] lg:max-h-screen ",
          className,
        )}
      >
        {/* You can add more structure or styling here if needed */}
        {/* Example: <h2 className="text-xl font-semibold">Section Title</h2> */}
        {children}
      </div>
    </>
  );
};

export default Section;
