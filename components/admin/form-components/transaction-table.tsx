import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { format } from "date-fns";
import { Edit, PlusCircle, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { I18nProvider } from "@react-aria/i18n";

import SelectField from "@/components/SelectField";
import ModalComponent from "@/components/Modal";
import { getSelectInstallment } from "@/api/members";

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
  access,
  installments,
  totalPayable
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState("Add Transaction");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [installments, setInstallments] = useState([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);

  // In your TransactionTable component, update the useEffect:
  // useEffect(() => {
  //   const fetchInstallments = async () => {
  //     setIsLoadingInstallments(true);
  //     try {
  //       const res = await getSelectInstallment(access, membershipId);

  //       if (res.status === 200) {
  //         // Handle different possible response structures
  //         let installmentsData = [];

  //         if (Array.isArray(res.data)) {
  //           // If response is directly an array
  //           installmentsData = res.data;
  //         } else if (res.data && typeof res.data === "object") {
  //           // If it's an object but not an array, try to extract any array
  //           const possibleArrays = Object.values(res.data).filter((val) =>
  //             Array.isArray(val),
  //           );

  //           if (possibleArrays.length > 0) {
  //             installmentsData = possibleArrays[0];
  //           }
  //         }

  //         setInstallments(installmentsData);
  //       } else {
  //         setInstallments([]);
  //       }
  //     } catch (error) {
  //       setInstallments([]);
  //     } finally {
  //       setIsLoadingInstallments(false);
  //     }
  //   };

  //   if (isAddTrnModalOpen && membershipId) {
  //     fetchInstallments();
  //   }
  // }, [isAddTrnModalOpen, membershipId, access]);

  useEffect(() => {
    console.log(
      "Current installment_no value:",
      transactionData.installment_no,
    );
    console.log(
      "Current installment_no as Set:",
      new Set([transactionData.installment_no || ""]),
    );
  }, [transactionData.installment_no]);

  // Reset modal when it closes
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

    // Pre-fill the form with transaction data
    handleTransactionChange("date", transaction.date);
    handleTransactionChange("amount", transaction.amount);
    handleTransactionChange("mode", transaction.mode);
    handleTransactionChange("tId", transaction.tId);
    handleTransactionChange("installment_no", transaction.installment_no || "");
    handleTransactionChange("txnType", transaction.txnType || "");
    handleTransactionChange("installment_status", transaction.installment_status || "");
  };

  // const handleSaveEdit = () => {
  //   if (editingTransaction) {
  //     const updatedData = {
  //       date: transactionData.date,
  //       amount: transactionData.amount,
  //       mode: transactionData.mode,
  //       tId: transactionData.tId,
  //       installment_no: transactionData.installment_no,
  //       txnType: transactionData.txnType,
  //       installment_status: transactionData.installment_status,
  //     };

  //     updateTransaction(editingTransaction.id, updatedData);
  //     setIsAddTrnModalOpen(false);
  //   }
  // };

  const handleSaveEdit = () => {
  if (editingTransaction) {
    // Format date to YYYY-MM-DD
    const formattedDate = transactionData.date 
      ? new Date(transactionData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const updatedData = {
      memberId: membershipId, 
      txnDate: formattedDate,
      amount: Number(transactionData.amount),
      mode: transactionData.mode,
      refNo: transactionData.tId,
      txnType: transactionData.txnType 
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
    // Reset form fields
    handleTransactionChange("date", "");
    handleTransactionChange("amount", "");
    handleTransactionChange("mode", "Cash");
    handleTransactionChange("tId", "");
    handleTransactionChange("installment_no", "");
    handleTransactionChange("txnType", "");
  };

  const openDeleteModal = (transaction: any) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      // Call updateTransaction with delete flag
      await updateTransaction(transactionToDelete.id, {
        _action: "delete",
      });
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const getInstallmentOptions = (installments: any[]) => {
    console.log("installments", installments);
    if (isLoadingInstallments) {
      return [{ key: "loading", label: "Loading installments..." }];
    }

    if (!installments || installments.length === 0) {
      return [{ key: "none", label: "No installments available" }];
    }

    return [
      { key: "select", label: "Select Installment" },
      ...installments.map((inst, index) => {
        const installmentNo =
          inst?.InstallmentId || index + 1;
        const installmentDate =
          inst?.DueDate ||  new Date();
        const pendingAmount =
          inst?.TotalOutstanding || 0;

        const formattedDate = format(new Date(installmentDate), "dd MMM yyyy");

        return {
          key: String(installmentNo), 
          label: `${formattedDate} • ₹${Number(
            pendingAmount,
          ).toLocaleString()}`,
        };
      }),
    ];
  };

  console.log("transaction", transactionData.installment_no);
  return (
    <div>
      <div className="flex items-center mb-4 justify-between">
        <h2 className="text-xl font-medium text-gray-900">
          Transaction History
        </h2>

        {/* {totalPayable > 0 && ( */}
        <Button
          color="primary"
          startContent={<PlusCircle size={16} />}
          onPress={() => setIsAddTrnModalOpen(true)}
          // isDisabled = {totalPayable == 0 }
        >
          Add Transaction
        </Button>
        {/* )} */}

        <ModalComponent
          content={
            <div className="space-y-4">
              <I18nProvider locale="en-IN">
                <DatePicker
                  isRequired
                  showMonthAndYearPickers
                  className="w-full"
                  label={"Date of transaction"}
                  maxValue={today(getLocalTimeZone())}
                  value={
                    transactionData.date && transactionData.date !== ""
                      ? parseDate(transactionData.date)
                      : null
                  }
                  onChange={(value) => {
                    handleTransactionChange("date", value.toString());
                  }}
                />
              </I18nProvider>

              {!isEditMode && <SelectField
                isRequired
                label="Installment"
                options={getInstallmentOptions(installments)}
                value={new Set([String(transactionData.installment_no) || ""])}
                onChange={(selectedSet: Set<string>) => {
                  const selectedValue = Array.from(selectedSet)[0];

                  if (
                    selectedValue &&
                    selectedValue !== "select" &&
                    selectedValue !== "none" &&
                    selectedValue !== "loading"
                  ) {
                    handleTransactionChange("installment_no", selectedValue); // already just the number
                  } else {
                    handleTransactionChange("installment_no", "");
                  }
                }}
              />}

              {/* <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  <span> Payment Type</span>
                  <span className="text-red-500">*</span>
                </div>

                <div className="flex gap-6">

                  <label className="inline-flex items-center cursor-pointer group">
                    <input
                      checked={transactionData.txnType === "interest"}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      name="payment_type"
                      type="radio"
                      value="interest"
                      onChange={(e) =>
                        handleTransactionChange("txnType", e.target.value)
                      }
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Interest
                    </span>
                  </label>


                  <label className="inline-flex items-center cursor-pointer group">
                    <input
                      checked={
                        transactionData.txnType === "installment_amount"
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      name="payment_type"
                      type="radio"
                      value="installment_amount"
                      onChange={(e) =>
                        handleTransactionChange("txnType", e.target.value)
                      }
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Installment Amount
                    </span>
                  </label>

                  
                  <label className="inline-flex items-center cursor-pointer group">
                    <input
                      checked={transactionData.txnType === "full"}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      name="payment_type"
                      type="radio"
                      value="full"
                      onChange={(e) =>
                        handleTransactionChange("txnType", e.target.value)
                      }
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Both
                    </span>
                  </label>
                </div>
              </div> */}

              {!isEditMode && <SelectField
              isRequired
              label="Payment Type"
              options={[
                "WHOLE",
                "PRINCIPAL",
                "INTEREST",
                "GST"
              ]}
               value={new Set([transactionData.txnType || ""])}
               onChange={(selectedSet: Set<string>) =>
                  handleTransactionChange("txnType", Array.from(selectedSet)[0])
                }
              />}

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

              <Input
                isRequired
                className="w-full"
                label="Amount"
                placeholder="Amount"
                type="number"
                value={transactionData.amount}
                onValueChange={(value) =>
                  handleTransactionChange("amount", value)
                }
              />

              {transactionData.mode !== "" && (
                <Input
                  isRequired
                  className="w-full"
                  label="Transaction ID"
                  placeholder="Transaction ID"
                  value={transactionData.tId}
                  onValueChange={(value) =>
                    handleTransactionChange("tId", value)
                  }
                />
              )}
            </div>
          }
          footerContent={
            <>
              <Button
                className="bg-gray-500 font-semibold text-white"
                startContent={<X size={16} />}
                variant="flat"
                onPress={
                  isEditMode
                    ? handleCancelEdit
                    : () => setIsAddTrnModalOpen(false)
                }
              >
                Cancel
              </Button>

              {isEditMode ? (
                <Button
                  className="bg-blue-600 font-semibold text-white"
                  isDisabled={
                    !transactionData.date ||
                    (!transactionData.tId &&
                      transactionData.mode !== "" &&
                      transactionData.mode !== "Cash") ||
                    !transactionData.amount ||
                    !transactionData.txnType ||
                    isTrnSubmitting
                  }
                  startContent={<Save size={16} />}
                  onPress={handleSaveEdit}
                >
                  Update Transaction
                </Button>
              ) : (
                <Button
                  className="bg-green-600 font-semibold text-white"
                  // isDisabled={
                  //   !transactionData.date ||
                  //   (!transactionData.tId &&
                  //     transactionData.mode !== "" &&
                  //     transactionData.mode !== "Cash") ||
                  //   !transactionData.amount ||
                  //   !transactionData.txnType ||
                  //   isTrnSubmitting
                  // }
                  startContent={<PlusCircle size={16} />}
                  onPress={addTransaction}
                >
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
                <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>
                  No transactions available
                </td>
              </tr>
            ) : (
              transactions?.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 ">
                    {transaction.installment_no || ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(transaction.date), "dd-MM-yyyy")}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ">
                      {transaction.txnType || ""}
                    </span>
                  </td>
                  <td className="px-4 space-x-2 py-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      startContent={<Edit size={14} />}
                      variant="flat"
                      onPress={() => handleEditClick(transaction)}
                      // isDisabled={transaction.installment_status === "Paid"}
                    />

                    {/* <Button 
                                        size="sm" 
                                        variant="flat" 
                                        onPress={() => openDeleteModal(transaction)}
                                        startContent={<Trash2 size={14} />}
                                    >
                                    </Button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Confirmation Modal */}
      <ModalComponent
        content={
          <div>
            <h1 className="text-lg font-medium mb-2">
              Are you sure you want to delete this transaction?
            </h1>
            {/* <p className="text-gray-600">This action cannot be undone.</p> */}
          </div>
        }
        footerContent={
          <>
            <Button
              className="bg-gray-500 font-semibold text-white"
              variant="flat"
              onPress={handleDeleteCancel}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 font-semibold text-white"
              isLoading={isDeleting}
              startContent={<Trash2 size={16} />}
              onPress={handleDeleteConfirm}
            >
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
