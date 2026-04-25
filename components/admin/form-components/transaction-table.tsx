import { Edit, Loader2, PlusCircle, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SelectField from "@/components/SelectField";
import ModalComponent from "@/components/Modal";
import { formatDisplayDate } from "@/utils/date";

interface Transaction {
  transactions: any[];
  handleTransactionChange: (key: string, value: any) => void;
  isAddTrnModalOpen: boolean;
  setIsAddTrnModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  transactionData: any;
  isTrnSubmitting: boolean;
  addTransaction: () => void;
  updateTransaction: (transactionId: string, updatedData: any) => void;
  deleteTransaction: (transactionId: string) => void;
  installments?: any;
  membershipId: string;
  access: string;
  totalPayable: number;
}

interface DateFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxDate?: Date;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  required,
  maxDate,
}) => {
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            readOnly
            className="cursor-pointer"
            value={dateValue ? format(dateValue, "yyyy-MM-dd") : ""}
            placeholder="Select date"
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateValue}
            captionLayout="dropdown"
            disabled={maxDate ? { after: maxDate } : undefined}
            onSelect={(d) => {
              onChange(d ? format(d, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const TransactionTable: React.FC<Transaction> = ({
  transactions,
  handleTransactionChange,
  isAddTrnModalOpen,
  setIsAddTrnModalOpen,
  transactionData,
  isTrnSubmitting,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  membershipId,
  installments,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState("Add Transaction");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingInstallments] = useState(false);

  useEffect(() => {
    if (!isAddTrnModalOpen) {
      setIsEditMode(false);
      setEditingTransaction(null);
      setModalTitle("Add Transaction");
    }
  }, [isAddTrnModalOpen]);

  const handleEditClick = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditMode(true);
    setModalTitle("Edit Transaction");
    setIsAddTrnModalOpen(true);

    handleTransactionChange("date", transaction.date);
    handleTransactionChange("amount", transaction.amount);
    handleTransactionChange("mode", transaction.mode);
    handleTransactionChange("tId", transaction.tId);
    handleTransactionChange(
      "installment_no",
      transaction.installment_no || "",
    );
    handleTransactionChange("txnType", transaction.txnType || "");
    handleTransactionChange(
      "installment_status",
      transaction.installment_status || "",
    );
  };

  const handleSaveEdit = () => {
    if (editingTransaction) {
      const formattedDate = transactionData.date
        ? new Date(transactionData.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const updatedData = {
        memberId: membershipId,
        txnDate: formattedDate,
        amount: Number(transactionData.amount),
        mode: transactionData.mode,
        refNo: transactionData.tId,
        txnType: transactionData.txnType,
      };

      updateTransaction(editingTransaction.id, updatedData);
      setIsAddTrnModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingTransaction(null);
    setModalTitle("Add Transaction");
    setIsAddTrnModalOpen(false);
    handleTransactionChange("date", "");
    handleTransactionChange("amount", "");
    handleTransactionChange("mode", "Cash");
    handleTransactionChange("tId", "");
    handleTransactionChange("installment_no", "");
    handleTransactionChange("txnType", "");
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      await updateTransaction(transactionToDelete.id, {
        _action: "delete",
      });
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const getInstallmentOptions = (installments: any[]) => {
    if (isLoadingInstallments) {
      return [{ key: "loading", label: "Loading installments..." }];
    }

    if (!installments || installments.length === 0) {
      return [{ key: "none", label: "No installments available" }];
    }

    return [
      { key: "select", label: "Select Installment" },
      ...installments.map((inst, index) => {
        const installmentNo = inst?.InstallmentId || index + 1;
        const installmentDate = inst?.DueDate || new Date();
        const pendingAmount = inst?.TotalOutstanding || 0;

        const formattedDate = formatDisplayDate(installmentDate);

        return {
          key: String(installmentNo),
          label: `${formattedDate} • ₹${Number(pendingAmount).toLocaleString()}`,
        };
      }),
    ];
  };

  return (
    <div>
      <div className="flex items-center mb-4 justify-between">
        <h2 className="text-xl font-medium text-gray-900">
          Transaction History
        </h2>

        <Button
          disabled={isTrnSubmitting}
          onClick={() => setIsAddTrnModalOpen(true)}
        >
          <PlusCircle size={16} className="mr-2" />
          Add Transaction
        </Button>

        <ModalComponent
          content={
            <div className="space-y-4">
              <DateField
                label="Date of transaction"
                required
                value={transactionData.date}
                maxDate={new Date()}
                onChange={(d) => handleTransactionChange("date", d)}
              />

              {!isEditMode && (
                <SelectField
                  isRequired
                  label="Installment"
                  options={getInstallmentOptions(installments)}
                  value={
                    new Set([String(transactionData.installment_no) || ""])
                  }
                  onChange={(selectedSet: Set<string>) => {
                    const selectedValue = Array.from(selectedSet)[0];

                    if (
                      selectedValue &&
                      selectedValue !== "select" &&
                      selectedValue !== "none" &&
                      selectedValue !== "loading"
                    ) {
                      handleTransactionChange("installment_no", selectedValue);
                    } else {
                      handleTransactionChange("installment_no", "");
                    }
                  }}
                />
              )}

              {!isEditMode && (
                <SelectField
                  isRequired
                  label="Payment Type"
                  options={["WHOLE", "PRINCIPAL", "INTEREST", "GST"]}
                  value={new Set([transactionData.txnType || ""])}
                  onChange={(selectedSet: Set<string>) =>
                    handleTransactionChange(
                      "txnType",
                      Array.from(selectedSet)[0],
                    )
                  }
                />
              )}

              <SelectField
                isRequired
                label="Mode"
                options={[
                  "Cash",
                  "Cheque",
                  "UPI",
                  "Debit Card",
                  "Credit Card",
                  "Net Banking",
                ]}
                value={new Set([transactionData.mode || ""])}
                onChange={(selectedSet: Set<string>) =>
                  handleTransactionChange("mode", Array.from(selectedSet)[0])
                }
              />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trn-amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="trn-amount"
                  className="w-full"
                  placeholder="Amount"
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) =>
                    handleTransactionChange("amount", e.target.value)
                  }
                />
              </div>

              {transactionData.mode !== "" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trn-tid">
                    Transaction ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="trn-tid"
                    className="w-full"
                    placeholder="Transaction ID"
                    value={transactionData.tId}
                    onChange={(e) =>
                      handleTransactionChange("tId", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          }
          footerContent={
            <>
              <Button
                variant="secondary"
                disabled={isTrnSubmitting}
                onClick={
                  isEditMode
                    ? handleCancelEdit
                    : () => setIsAddTrnModalOpen(false)
                }
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>

              {isEditMode ? (
                <Button
                  className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
                  disabled={
                    !transactionData.date ||
                    (!transactionData.tId &&
                      transactionData.mode !== "" &&
                      transactionData.mode !== "Cash") ||
                    !transactionData.amount ||
                    !transactionData.txnType ||
                    isTrnSubmitting
                  }
                  onClick={handleSaveEdit}
                >
                  {isTrnSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Update Transaction
                </Button>
              ) : (
                <Button
                  className="bg-green-600 font-semibold text-white hover:bg-green-700"
                  disabled={
                    !transactionData.date ||
                    (!transactionData.tId &&
                      transactionData.mode !== "" &&
                      transactionData.mode !== "Cash") ||
                    !transactionData.amount ||
                    !transactionData.txnType ||
                    isTrnSubmitting
                  }
                  onClick={addTransaction}
                >
                  {isTrnSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Transaction
                </Button>
              )}
            </>
          }
          isOpen={isAddTrnModalOpen}
          setIsOpen={setIsAddTrnModalOpen}
          title={modalTitle}
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 font-semibold rounded-t-xl">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Installment No
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Payment Mode
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Transaction Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.length <= 0 ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={7}>
                  No transactions available
                </td>
              </tr>
            ) : (
              transactions?.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {transaction.installment_no || ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDisplayDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ₹{transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.tId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {transaction.mode || ""}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {transaction.txnType || ""}
                    </span>
                  </td>
                  <td className="px-4 space-x-2 py-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditClick(transaction)}
                    >
                      <Edit size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalComponent
        content={
          <div>
            <h1 className="text-lg font-medium mb-2">
              Are you sure you want to delete this transaction?
            </h1>
          </div>
        }
        footerContent={
          <>
            <Button variant="secondary" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Delete
            </Button>
          </>
        }
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title="Delete Transaction"
      />
    </div>
  );
};

export default TransactionTable;
