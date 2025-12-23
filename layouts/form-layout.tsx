import React from "react";
import { cn } from "@heroui/theme";

import BreadCrumbsComponent from "@/components/BreadCrumbsComponent";
import StepFormSidebar from "@/components/elements/StepFormSidebar";

interface Step {
  title: string;
  description: string;
}

interface FormLayoutProps {
  steps: Step[];
  currentStep: number;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isSidebarVisible?: boolean;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  extraContent?: React.ReactNode;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  description,
  steps,
  currentStep,
  setCurrentStep,
  children,
  className,
  isSidebarVisible = true,
  extraContent,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-y-auto lg:overflow-hidden max-h-[90dvh]  lg:max-h-[100dvh]",
        className,
      )}
    >
      {/* <div className="team-gradient" /> */}
      {/* <div className="main opacity-15" /> */}
      <div className="flex flex-col lg:flex-row lg:max-h-full overflow-y-auto relative">
        {/* <Image src="/images/hex.png" alt="logo" width={1000} height={1000} className="rounded absolute h-full w-full object-cover -scale-x-100 opacity-10 bottom-0 z-0 right-0" /> */}
        {/* Floating Sidebar */}

        <BreadCrumbsComponent
          className="block sm:hidden sm:my-0"
          title={title ?? ""}
        />
        {extraContent}

        {isSidebarVisible && (
          <StepFormSidebar
            currentStep={currentStep}
            description={description ?? ""}
            setCurrentStep={setCurrentStep}
            steps={steps}
            title={title ?? ""}
          />
        )}

        {/* Main Content */}
        <div className="relative p-1 lg:px-8 lg:pt-4 w-full" id="main-content">
          <BreadCrumbsComponent
            className="sm:block hidden"
            title={title ?? ""}
          />
          <div className=" mx-auto relative z-10  rounded-lg ">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
