import React from "react";

import InstallmentTable from "./installment-table";

interface Props {
  formData: any;
  handleBack: () => void;
  handleContinue: () => void;
  totalAmount: number;
  type: string;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
const Confirmation: React.FC<Props> = ({
  formData,
  setFormData,
  totalAmount,
  handleBack,
  handleContinue,
  type,
}) => {
  return (
    <div className="lg:max-h-[86dvh] lg:overflow-y-scroll no-scrollbar">
      <h2 className="text-xl font-semibold mb-0">Confirm Your Details</h2>
      <p className="text-gray-500 mb-2">
        Please review your information before submitting.
      </p>

      <div className="space-y-4 mb-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Personal Information
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="text-sm font-medium">{formData.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="text-sm font-medium">{formData.lastname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium">
                {formData.phone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="text-sm font-medium">
                {formData.country || "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Associated member ID</p>
              <p className="text-sm font-medium">{formData.associatedMember}</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">Payment Plan</h3>
          <div className="mt-1">
            <p className="text-sm text-gray-500">Number of Installments</p>
            <p className="text-sm font-medium mb-2">
              {formData.installments === "1"
                ? "Pay in full"
                : `${formData.installments} Installments (January/July)`}
            </p>

            {formData.status === "draft" &&
              formData.installmentDetails &&
              formData.installmentDetails.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Installment Schedule
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Total Amount: {totalAmount}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    All installments will be due in January or July based on
                    your selected start date
                  </p>

                  {/* <div className="space-y-4 max-h-80 w-full lg:w-[60vw] justify-self-center relative overflow-y-scroll border rounded-lg bg-white/50">
                  <div className="grid grid-cols-3 lg:grid-cols-5 sticky bg-white/80 backdrop-blur-sm  top-0 gap-2 font-medium text-sm border-b px-10  py-2">
                    <div className="col-span-1">#</div>
                    <div className="col-span-1 lg:col-span-2">Due</div>
                   
                    <div className="col-span-1 lg:col-span-2">Amount</div>
                  </div>
                  
                  {formData.installmentDetails.map((installment:any, index) => {
                    const formattedAmount = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(installment.amount);
                    // console.log((installment))

                    // const dueDate = new Date(installment.dueDate);
                    // const monthName = dueDate.toLocaleString('default', { month: 'long' });
                    
                    return (
                      <div key={index} className={cn("grid grid-cols-3 lg:grid-cols-5 gap-2 px-10 pb-4 text-sm", index!== formData.installmentDetails.length-1 && 'border-b' )}>
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-1 lg:col-span-2">{`${installment?.month}, ${installment?.year}`}</div>
                       
                        <div className="col-span-1 lg:col-span-2">{formattedAmount}</div>
                      </div>
                    );
                  })}
                </div> */}
                  <InstallmentTable
                    installmentDetails={formData.installmentDetails}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 "
          onClick={handleBack}
        >
          Back
        </button>
        <div className="flex gap-2">
          {/* <button onClick={handleSubmitClick} className='text-gray-600 border py-2 px-4 rounded-md hover:bg-gray-100'>
              Save as draft
            </button> */}
          <button
            onClick={handleContinue}
            // disabled={!formData.subType || !formData.type || loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-600/50 hover:bg-blue-700 "
          >
            {type === "edit" ? "Update" : "Add"} Members
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
