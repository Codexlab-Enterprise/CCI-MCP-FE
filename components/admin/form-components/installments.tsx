import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDisplayDate } from "@/utils/date";

import InstallmentTable from "./installment-table";

interface InstallmentsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleContinue: () => void;
  handleBack: () => void;
  handleSubmitClick: () => void;
  handleSelectionChange: (key: string, value: any) => void;
  filterInstallmentOpn: any;
  totalAmount: number;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}
const Installments: React.FC<InstallmentsProps> = ({
  formData,
  handleContinue,
  handleBack,
  handleSubmitClick,
  handleChange,
  totalAmount,
}) => {
  const handleInstallmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      handleChange(e);

      return;
    }

    const numValue = parseInt(value);

    if (numValue < 1) {
      return;
    }

    handleChange(e);
  };

  return (
    <div>
      <div className="lg:max-h-[86dvh] no-scrollbar overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Payment Plan</h2>
        <p className="text-gray-500 mb-6">
          Select your preferred number of installments.
        </p>

        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="installments">Number of Installments*</Label>
              <Input
                id="installments"
                className="w-full"
                disabled={formData.status !== "draft"}
                min={1}
                name="installments"
                placeholder="Enter number of installments"
                type="number"
                value={formData.installments || ""}
                onChange={handleInstallmentChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dateOfInstallment">First Install. Date*</Label>
              <Input
                id="dateOfInstallment"
                className="w-full"
                disabled={formData.status !== "draft"}
                name="dateOfInstallment"
                placeholder="Select first installment date"
                value={formatDisplayDate(formData.received_date, "")}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.status == "draft" &&
            formData.installmentDetails &&
            formData.installmentDetails.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Installment Schedule
                </h3>
                <div className="flex gap-2 items-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Total Amount: {totalAmount}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  All installments will be due in January or July based on your
                  selected start date
                </p>

                <InstallmentTable
                  installmentDetails={formData.installmentDetails}
                />
              </div>
            )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100"
            onClick={handleBack}
          >
            Back
          </button>
          <div className="flex gap-2">
            {formData.status == "complete" && (
              <button
                className="border text-gray-600 px-4 py-1 rounded-md hover:bg-gray-100"
                onClick={handleSubmitClick}
              >
                Save
              </button>
            )}
            <button
              onClick={handleContinue}
              className="bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-600/50 hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Installments;
