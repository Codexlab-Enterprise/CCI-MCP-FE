import { cn } from "@heroui/theme";
import React from "react";
interface FormData {
  installmentDetails: {
    amount: number;
    dueDate: string;
  }[];
}
const InstallmentTable: React.FC<FormData> = ({ installmentDetails }) => {
  return (
    <>
      <div className="space-y-4 max-h-80 w-full lg:w-[60vw] justify-self-center relative overflow-y-scroll border rounded-lg bg-white/50 no-scrollbar">
        <div className="grid grid-cols-3 lg:grid-cols-5 sticky bg-white/80 backdrop-blur-sm  top-0 gap-2 font-medium text-sm border-b px-10  py-2">
          <div className="col-span-1">#</div>
          <div className="col-span-1 lg:col-span-2">Due</div>

          <div className="col-span-1 lg:col-span-2">Amount</div>
        </div>

        {installmentDetails.map((installment: any, index) => {
          const formattedAmount = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(installment.amount);

          return (
            <div
              key={index}
              className={cn(
                "grid grid-cols-3 lg:grid-cols-5 gap-2 px-10 pb-4 items-center text-sm",
                index !== installmentDetails.length - 1 && "border-b",
              )}
            >
              <div className="col-span-1">{index + 1}</div>
              <div className="col-span-1 lg:col-span-2">
                {new Date(installment.date).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <div className="col-span-1 lg:col-span-2">{formattedAmount}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default InstallmentTable;
