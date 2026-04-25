import React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import InstallmentTable from "./installment-table";

interface Props {
  formData: any;
  handleBack: () => void;
  handleContinue: () => void;
  loading?: boolean;
  totalAmount: number;
  type: string;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
const Confirmation: React.FC<Props> = ({
  formData,
  totalAmount,
  handleBack,
  handleContinue,
  loading = false,
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
          className="text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          onClick={handleBack}
        >
          Back
        </button>
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 text-white font-medium hover:bg-blue-700"
            disabled={loading}
            onClick={handleContinue}
          >
            {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
            {loading
              ? "Please wait..."
              : `${type === "edit" ? "Update" : "Add"} Members`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
