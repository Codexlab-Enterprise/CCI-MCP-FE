import { cn } from "@heroui/theme";
import { Check } from "lucide-react";
import React from "react";
import { BiSolidCricketBall } from "react-icons/bi";
import Image from "next/image";
import Link from "next/link";
interface StepFormSidebarProps {
  currentStep: number;
  steps: { title: string; description: string }[];
  title: string;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  description: string;
}
const StepFormSidebar: React.FC<StepFormSidebarProps> = ({
  currentStep,
  setCurrentStep,
  steps,
  title,
  description,
}) => {
  return (
    <>
      <div className="sticky hidden lg:block left-2 top-0 z-10 bottom-0 border dark:border-gray-950 h-[97vh] rounded-lg w-96 bg-white dark:bg-black px-7 py-2 shadow-md">
        <div className="flex flex-col items-start gap-2 mb-4 relative">
          <Link className="" href={"/members"}>
            <Image
              alt="logo"
              className="rounded h-16 w-16 bottom-0 z-0 relative top-2 right-0"
              height={1000}
              src="/images/logo.png"
              width={1000}
            />
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <div className="">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex bg-transparent text-left flex-col cursor-pointer"
            >
              <div className="flex items-center ">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all flex items-center justify-center duration-300 ease-in-out",
                      index <= currentStep - 1
                        ? "bg-teal-600  text-white"
                        : "bg-teal-500/50 scale-90",
                      index === currentStep &&
                        "bg-teal-600  ring  text-white ring-teal-600",
                    )}
                  >
                    {index <= currentStep - 1 ? (
                      <Check className="w-4 h-4" />
                    ) : index === currentStep ? (
                      <>
                        <BiSolidCricketBall className="w-7 h-7" />
                      </>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Step title and description */}
                <div className="ml-4">
                  <h3
                    className={cn(
                      "text-sm font-medium",
                      index <= currentStep - 1
                        ? "text-teal-600"
                        : "text-gray-600",
                    )}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Vertical connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-10 w-[2px] ml-5",
                    index <= currentStep - 1 ? "bg-teal-600" : "bg-teal-500/30",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex lg:hidden pb-5 items-center justify-center">
        {steps.map((step, index) => (
          <div key={index} className="flex">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl transition-all flex items-center justify-center duration-300 ease-in-out",
                  index <= currentStep - 1
                    ? "bg-teal-600  text-white"
                    : "bg-teal-500/50 scale-90",
                  index === currentStep &&
                    "bg-teal-600  ring  text-white ring-teal-600",
                )}
              >
                {index <= currentStep - 1 ? (
                  <Check className="w-4 h-4" />
                ) : index === currentStep ? (
                  <>
                    <BiSolidCricketBall className="w-7 h-7" />
                  </>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p className="text-xs break-words text-center max-w-16 truncate">
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-7 h-1 rounded-full relative top-[1.2rem]",
                  index < currentStep - 1 ? "bg-teal-600" : "bg-teal-500/30",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default StepFormSidebar;
