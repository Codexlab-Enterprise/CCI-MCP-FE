import { Input } from "@heroui/input";
import { format } from "date-fns";
import React from "react";

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
  setFormData,
  handleContinue,
  handleBack,
  handleSubmitClick,
  handleSelectionChange,
  filterInstallmentOpn,
  handleChange,
  totalAmount,
}) => {
  console.log("installments", formData.installmentDetails);

  const handleInstallmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // console.log("testing new value", value)
    // if(value < 1){
    //   return;
    // }

    // Allow empty value for better UX
    if (value === "") {
      handleChange(e);

      return;
    }

    const numValue = parseInt(value);

    // Prevent negative numbers and 0
    if (numValue < 1) {
      return; // Don't update the state for invalid values
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
            {/* <SelectField
                label="Select Installments"
                disabled={formData.status!=="draft"}
                id="installments"
                value={new Set([String(formData.installments)])}
                onChange={(selectedSet: Set<string>) => handleSelectionChange("installments", Array.from(selectedSet)[0] || "")}
                options={filterInstallmentOpn.map((option) => {
                  return { key: option.key, label: option.label };
                })}
              /> */}

            <Input
              className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={formData.status !== "draft"}
              label="Number of Installments*"
              min={1}
              name="installments"
              placeholder="Enter number of installments"
              type="number"
              value={formData.installments || ""}
              variant="bordered"
              // onBlur={(e) => {
              //   // Set to minimum 1 if empty or invalid on blur
              //   if (!e.target.value || parseInt(e.target.value) < 1) {
              //     handleChange({
              //       ...e,
              //       target: {
              //         ...e.target,
              //        value : "1",
              //       },
              //     });
              //   }
              // }}
              onChange={handleInstallmentChange}
            />

            <Input
              // type="date"
              className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              isDisabled={formData.status !== "draft"}
              label="First Install. Date*"
              name="dateOfInstallment"
              placeholder="Select first installment date"
              value={
                typeof formData.received_date === "string"
                  ? format(formData.received_date, "dd-MM-yyyy")
                  : format(formData.received_date, "dd-MM-yyyy")
                    ? format(
                        formData.received_date.toISOString().slice(0, 10),
                        "dd-MM-yyyy",
                      )
                    : ""
              }
              variant="bordered"
              onChange={handleChange}
            />
          </div>

          {/* Installment breakdown */}
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
                  {/* <div className='flex gap-2'>
                {isEdit ? (
                  <>
                  
                  <button className='' onClick={()=>setIsEdit(false)}><Save className='h-5 text-green-600 w-5'/></button>
                  <button className='' onClick={()=>{setIsEdit(false); setTotalAmount(675000)}}><Trash className='h-5 text-red-600 w-5'/></button>
                  </>
                ):(

                  <button onClick={()=>setIsEdit(true)}><Edit className='h-5 text-blue-600 w-5'/></button>

                )}
                </div> */}
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
            {/* {formData.status=='draft' &&(
              <>
              
              <button onClick={handleSubmitClick} className='border text-gray-600 px-4  py-1 rounded-md hover:bg-gray-100'>
              Save as draft
            </button>
              </>
            )} */}
            {formData.status == "complete" && (
              <>
                <button
                  className="border text-gray-600 px-4  py-1 rounded-md hover:bg-gray-100"
                  onClick={handleSubmitClick}
                >
                  Save
                </button>
              </>
            )}
            <button
              onClick={handleContinue}
              // disabled={!formData.subType || !formData.type || loading}
              className="bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-600/50 hover:bg-blue-700 "
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
