import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { cn } from "@heroui/theme";
import { format, formatDate } from "date-fns";
import { debounce } from "lodash";
import {
  Calendar,
  CreditCard,
  Download,
  EyeIcon,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@heroui/react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import axios from "axios";
import { I18nProvider } from "@react-aria/i18n";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import TransactionTable from "./transaction-table";

import api from "@/utils/axios";
import {
  addtransaction,
  assignballet,
  delete_transaction,
  exportInstallmentData,
  getInstallments,
  gettrnsactions,
  interestCalculate,
  refreshCalculateInterest,
  splitInstallment,
  update_transaction,
  updateInstallments,
} from "@/api/members";
import SelectField from "@/components/SelectField";

interface Props {
  formData: any;
  access: any;
  age: number;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
const ViewForm: React.FC<Props> = ({
  formData,
  setFormData,
  access,
  currentStep,
  setCurrentStep,
  age,
}) => {
  const [transactionData, setTransactionData] = useState({
    tId: "",
    amount: "",
    date: "",
    mode: "Cash",
    installment_no: "",
    txnType: "",
    paymentStatus: "",
  });
  const [paidAmount, setPaidAmount] = useState(0);

  const [isTrnSubmitting, setIsTrnSubmitting] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  const [isAddTrnModalOpen, setIsAddTrnModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any>([]);
  const [installmentSummary, setInstallmentSummary] = useState<any>(null);
  const [isAssignBelletOpen, setIsAssignBelletOpen] = useState(false);
  const [belletDate, setBelletDate] = useState<any>(null);
  const [permanentmembershipId, setpermanentMembershipId] = useState("");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState<any[]>([]);
  const [selectedInstallmentNo, setSelectedInstallmentNo] = useState<
    number | null
  >(null);

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splits, setSplits] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
  const [selectedInstallmentForSplit, setSelectedInstallmentForSplit] = useState<any>(null);

  const [paidDates, setPaidDates] = useState<{ [key: string]: string }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paidDates");
      const savedDates = saved ? JSON.parse(saved) : {};

      // Merge with API dates, but prioritize API dates
      const apiDates: { [key: string]: string } = {};

      formData.installmentDetails?.forEach((installment: any) => {
        if (installment.paid_Date_FromApi) {
          apiDates[installment.id] = installment.paid_Date_FromApi;
        }
      });

      return { ...savedDates, ...apiDates };
    }

    return {};
  });

  const getAvailableInstallments = () => {
    return formData.installmentDetails.filter((installment: any) =>
      installment.TotalOutstanding > 0
    );
  };

  const handleAssignBellet = async () => {
    // Validate inputs
    if (!permanentmembershipId || !belletDate) {
      toast.error("Please fill all fields");

      return;
    }

    const payload = {
      secondry_membership_ID: formData.memberShipId, // Your existing ID
      secondary_permanent_id: permanentmembershipId, // User input
      ballet_date: belletDate.toString(), // Convert to string
    };

    const toastId = toast.loading("Assigning bellet...");

    try {
      const res = await assignballet(payload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Bellet assigned successfully!", { id: toastId });

        setIsAssignBelletOpen(false);
        setBelletDate(null);
        setpermanentMembershipId("");
        window.location.reload();
      } else {
        toast.error(res.data?.message || "Failed to assign bellet", {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error("Error assigning bellet:", error);
      toast.error(error.response?.data?.message || "Error assigning bellet", {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    if (formData.installmentDetails) {
      const apiDates: { [key: string]: string } = {};

      formData.installmentDetails.forEach((installment: any) => {
        if (installment.paid_Date_FromApi) {
          apiDates[installment.id] = installment.paid_Date_FromApi;
        }
      });

      setPaidDates((prev) => ({ ...prev, ...apiDates }));
    }
  }, [formData.installmentDetails]);

  // const fetchInstallments = async () => {
  //   const res = await getInstallments(access, formData.memberShipId);

  //   console.log("mapped installments", res.data.summary.Receipt_No_Series);

  //   if (res.status === 200 && Array.isArray(res.data.data)) {
  //     const mappedInstallments = res.data.data.map((item: any) => {
  //       const date = item.Installment_date
  //         ? new Date(item.Installment_date)
  //         : null;

  //       return {
  //         month: date ? date.toLocaleString("default", { month: "long" }) : "",
  //         year: date ? date.getFullYear() : "",
  //         amount: Number(item.Installment_amount) || 0,
  //         Installment_amount: Number(item.Installment_amount) || 0,
  //         id: item.ID,
  //         status: item.Installment_status,
  //         interest_amt: item.interest_amount,
  //         total_amount_payable: item.total_amount_due,
  //         Gst_On_Interest: item.gst_on_interest,
  //         CGst_On_Interest: Math.round(
  //           Math.max(0, Number(item.gst_on_interest || 0)) / 2,
  //         ),
  //         SGst_On_Interest: Math.round(
  //           Math.max(0, Number(item.gst_on_interest || 0)) / 2,
  //         ),
  //         due_mth: item.overdue_months,
  //         interest_rate: (item.overdue_months || 0) * 1.5,
  //         Receipt_No: item.transaction_id,
  //         calInterestDate: item.cal_interest_date,
  //         Paid_Date: item.paid_date,
  //         paid_Date_FromApi: item.interest_calculation_date,
  //         Pending_amount: Math.max(
  //           0,
  //           Number(item.total_amount_due ?? item.Installment_amount) -
  //           Number(item.transaction_amount || 0),
  //         ),
  //         Paid_amount: Number(item.transaction_amount),
  //       };
  //     });

  //     setFormData((prev: any) => ({
  //       ...prev,
  //       installmentDetails: mappedInstallments,
  //     }));

  //     setInstallmentSummary(res.data.summary);
  //     console.log(res.data.summary);
  //   }
  // };

  const fetchInstallments = async () => {
    const res = await getInstallments(access, formData.memberShipId);

    console.log("API response", res.data);

    if (res.status === 200 && Array.isArray(res.data.data.rows)) {
      const mappedInstallments = res.data.data.rows.map((item: any) => {
        const dueDate = item.DueDate ? new Date(item.DueDate) : null;

        return {
          InstallmentId: item.InstallmentId,
          Label: item.Label,
          DueDate: item.DueDate,
          AmountDue: Number(item.AmountDue) || 0,
          Status: item.Status,
          PaidInFullDate: item.PaidDate,
          LastInterestCalcDate: item.LastInterestCalcDate,
          CalculatedAsOf: item.CalculatedAsOf,
          PrincipalPaid: Number(item.PrincipalPaid) || 0,
          PrincipalOutstanding: Number(item.PrincipalOutstanding) || 0,
          InterestAccrued: Number(item.InterestAccrued) || 0,
          InterestPaid: Number(item.InterestPaid) || 0,
          InterestOutstanding: Number(item.InterestOutstanding) || 0,
          GSTAccrued: Number(item.GSTAccrued) || 0,
          GSTPaid: Number(item.GSTPaid) || 0,
          GSTOutstanding: Number(item.GSTOutstanding) || 0,
          TotalOutstanding: Number(item.TotalOutstanding) || 0,
          IsOverdue: item.IsOverdue || false,
          MonthsProrated: Number(item.MonthsProrated) || 0,
          MonthsRounded: Number(item.MonthsRounded) || 0,
          InterestPctOfPrincipal: Number(item.InterestPctOfPrincipal) || 0,

          // For backward compatibility with existing code
          month: dueDate ? dueDate.toLocaleString("default", { month: "long" }) : "",
          year: dueDate ? dueDate.getFullYear() : "",
          id: item.InstallmentId,
          Installment_amount: Number(item.AmountDue) || 0,
          interest_amt: Number(item.InterestAccrued) || 0,
          total_amount_payable: Number(item.TotalOutstanding) || 0,
          Gst_On_Interest: Number(item.GSTAccrued) || 0,
          CGst_On_Interest: Math.round(Math.max(0, Number(item.GSTAccrued || 0)) / 2),
          SGst_On_Interest: Math.round(Math.max(0, Number(item.GSTAccrued || 0)) / 2),
          due_mth: item.MonthsRounded || 0,
          interest_rate: item.InterestPctOfPrincipal || 0,
          Receipt_No: item.Status === "PAID" ? `REC-${item.InstallmentId}` : null,
          calInterestDate: item.LastInterestCalcDate,
          Paid_Date: item.PaidInFullDate,
          Pending_amount: Number(item.TotalOutstanding) || 0,
          Paid_amount: Number(item.PrincipalPaid) || 0,
        };
      });

      setFormData((prev: any) => ({
        ...prev,
        installmentDetails: mappedInstallments,
      }));

      // If you still need summary data, you might need to calculate it
      const summary = calculateSummary(mappedInstallments);
      setInstallmentSummary(summary);
      console.log("Summary values", summary)
    }
  };

  // Helper function to calculate summary from installments
  const calculateSummary = (installments: any[]) => {
    const totalPaid = installments.reduce((sum, item) => sum + item.PrincipalPaid, 0);
    const totalOutstanding = installments.reduce((sum, item) => sum + item.TotalOutstanding, 0);
    const totalInterest = installments.reduce((sum, item) => sum + item.InterestAccrued, 0);
    const totalGST = installments.reduce((sum, item) => sum + item.GSTAccrued, 0);

    return {
      totalPaid,
      totalOutstanding,
      totalInterest,
      totalGST,
      totalInstallments: installments.length,
      paidInstallments: installments.filter(item => item.Status === "PAID").length,
      pendingInstallments: installments.filter(item => item.Status === "PENDING").length,
    };
  };


const fetchExportData = async () => {
  try {
    if (!formData.memberShipId) {
      console.error("No membership ID provided");
      return;
    }

    console.log("Fetching export data for:", formData.memberShipId);
    const response = await exportInstallmentData(formData.memberShipId);

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    
    // xlsx download logic
    if (response.status === 200 && response.data instanceof Blob) {
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `statement-${formData.memberShipId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    
    setExportData(response.data);
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
  }
};

  const addTransaction = async () => {
    setIsTrnSubmitting(true);
    if (transactionData.amount > formData.amount) {
      setIsTrnSubmitting(false);

      return toast.error("Amount cannot be greater than total amount");
    }
    const _transaction = {
      memberId: formData.memberShipId,
      txnDate: transactionData.date,
      mode: transactionData.mode,
      amount: transactionData.amount,
      refNo: transactionData.tId,
      installmentId: transactionData.installment_no,
      txnType: transactionData.txnType,
      // paymentStatus: transactionData.paymentStatus,
    };
    // })

    const toastId = toast.loading("Adding transaction...");
    const res = await addtransaction(_transaction);

    console.log("transacttion response", res);
    if (res?.status == 200) {
      toast.success(res?.data?.message, { id: toastId });
      setIsAddTrnModalOpen(false);
      fetchtrnsactions();
      fetchInstallments();
      setIsTrnSubmitting(false);
      setTransactionData({
        tId: "",
        amount: "",
        date: "",
        mode: "Cash",
        installment_no: "",
        txnType: "",
        paymentStatus: "",
      });
    } else {
      toast.error("Error adding transaction");
      setIsTrnSubmitting(false);
    }
    // consttransactions.push({amount:'',tId:'', date:'', mode:''});
    // setTransactions([...transactions,{amount:'',tId:'', date:''}])
  };

  const updateTransaction = async (transactionId: string, updatedData: any) => {
    setIsTrnSubmitting(true);
    const toastId = toast.loading("Updating transaction...");

    try {
      // Format the payload according to your API requirements
      const payload = {
        memberId: formData.memberShipId,
        txnDate: updatedData.txnDate,
        mode: updatedData.mode,
        amount: updatedData.amount,
        refNo: updatedData.refNo,
        // installmentId: updatedData.installment_no,
        txnType: updatedData.txnType,
      };

      // Make API call to update transaction using axios
      const res = await update_transaction(transactionId, payload);

      if (res.status === 200) {
        toast.success("Transaction updated successfully", { id: toastId });
        fetchtrnsactions(); // Refresh the transactions list
        fetchInstallments(); // Refresh the installments
      } else {
        toast.error("Failed to update transaction", { id: toastId });
      }
    } catch (error: any) {
      console.error("Update transaction error:", error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error updating transaction",
        { id: toastId },
      );
    } finally {
      setIsTrnSubmitting(false);
    }
  };
  // Handle amount change with debouncing
  const debouncedAmountUpdate = debounce(async (installmentId: number, newAmount: number) => {
    try {
      const response = await updateInstallments(installmentId, { amount: newAmount });

      if (response.status === 200) {
        toast.success('Amount updated successfully');
        await fetchInstallments();
      } else {
        toast.error('Failed to update amount');
        // await fetchInstallments();
      }
    } catch (error) {
      console.error('Error updating amount:', error);
      toast.error('Error updating amount');
      // await fetchInstallments();
    }
  }, 1000); // 1 second delay

  const handleAmountChange = (installmentId: number, newAmount: number) => {
    // Update local state immediately
    setFormData((prev: any) => ({
      ...prev,
      installmentDetails: prev.installmentDetails.map((inst: any) =>
        inst.InstallmentId === installmentId
          ? { ...inst, AmountDue: newAmount }
          : inst
      )
    }));

    // Debounced API call
    debouncedAmountUpdate(installmentId, newAmount);
  };

  // Optional: Handle amount change on blur instead of every keystroke
  const handleAmountBlur = async (installmentId: number, newAmount: number) => {
    if (newAmount <= 0) {
      toast.error('Amount must be greater than 0');
      await fetchInstallments(); // Refresh to get original value
      return;
    }

    await handleAmountChange(installmentId, newAmount);
  };

  // Handle due date change
  const handleDueDateChange = async (installmentId: number, date: any | null) => {
    if (!date) return;

    try {
      const dueDate = date.toString(); // Format: YYYY-MM-DD

      // Update local state immediately
      setFormData((prev: any) => ({
        ...prev,
        installmentDetails: prev.installmentDetails.map((inst: any) =>
          inst.InstallmentId === installmentId
            ? { ...inst, DueDate: `${dueDate}T00:00:00.000Z` }
            : inst
        )
      }));

      // Call API to update due date
      const response = await updateInstallments(installmentId, { dueDate: `${dueDate}T00:00:00.000Z` });

      if (response.status === 200) {
        toast.success('Due date updated successfully');
        await fetchInstallments();
      } else {
        toast.error('Failed to update due date');
        await fetchInstallments();
      }
    } catch (error) {
      console.error('Error updating due date:', error);
      toast.error('Error updating due date');
      await fetchInstallments();
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    setIsTrnSubmitting(true);
    const toastId = toast.loading("Deleting transaction...");

    try {
      // DELETE request
      const res = await delete_transaction(transactionId);

      if (res.status === 200) {
        toast.success("Transaction deleted successfully", { id: toastId });
        fetchtrnsactions(); // Refresh the transactions list
        fetchInstallments(); // Refresh installments if needed
      } else {
        toast.error("Failed to delete transaction", { id: toastId });
      }
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error deleting transaction",
        { id: toastId },
      );
    } finally {
      setIsTrnSubmitting(false);
    }
  };

  const calculateInterest = async () => {
    try {
      const secondaryMembershipId = formData.memberShipId;

      // Prepare installment data with paid dates
      const installmentData = formData.installmentDetails.map(
        (installment: any) => ({
          installment_no: installment.Installment_no, // or whatever field has the installment number
          interest_calculation_date: paidDates[installment.id] || null, // get the selected date for this installment
        }),
      );

      const response = await api.post(
        "/installment/applyInterest",
        {
          secondaryMembershipId,
          installments: installmentData, // add installments array to payload
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      fetchInstallments();
      console.log("Interest calculation successful:", response.data);
      toast.success("Interest calculated successfully!");
    } catch (error) {
      console.error("Error calculating interest:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized - Please login again");
        } else {
          toast.error(
            error.response?.data?.message ||
            "Error calculating interest. Please try again.",
          );
        }
      } else {
        toast.error("Error calculating interest. Please try again.");
      }
    }
  };



 const handleInstallmentExport = async () => {
    const toastId = toast.loading("Exporting...");

    try {
      // Use the correct path that matches your rewrite rule
      const apiUrl = `${process.env.NEXT_PUBLIC_INSTALLMENT}/members/${formData.memberShipId}/statement`;
      // const apiUrl = `https://t9hxsxql-3505.inc1.devtunnels.ms/v1/uploadfile/export/secondary-data?membershipId=${formData.memberShipId}`;

      // console.log("Generated API URL:", apiUrl);
      // console.log(
      //   "Full URL after rewrite should be:",
      //   `${process.env.NEXT_PUBLIC_API_URL_2}${apiUrl}`
      // );
      // console.log("Form Data memberShipId:", formData.memberShipId);

      // 1. Make the API request with proper headers, response type, and query parameter
      const response = await axios({
        method: "get",
        url: apiUrl,
        responseType: "blob", // Important for file downloads
        headers: {
          Authorization: `Bearer ${access}`,
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        data: {}, // Empty payload since we're using query params
      });

      // 2. Create a download link for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `member_${formData.memberShipId}_statement.xlsx`
      );

      // 3. Trigger the download
      document.body.appendChild(link);
      link.click();

      // 4. Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);

      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized - Please login again", { id: toastId });
        } else {
          toast.error(error.response?.data?.message || "Export failed", {
            id: toastId,
          });
        }
      } else {
        toast.error("Failed to export members", { id: toastId });
      }
    }
  };

  const fetchtrnsactions = async () => {
    try {
      const res = await gettrnsactions(access, formData.memberShipId);

      if (res?.data?.ok && Array.isArray(res.data.data)) {
        const mappedtransctions = res.data.data.map((item: any) => ({
          id: item.TxnId,
          amount: item.Amount,
          tId: item.RefNo,
          mode: item.Mode,
          date: format(new Date(item.TxnDate), "yyyy-MM-dd"),
          txnType: item.TxnType,
          principalPaid: item.PrincipalPaid,
          interestPaid: item.InterestPaid,
          gstPaid: item.GSTPaid,
          notes: item.Notes,
          createdAt: item.CreatedAt,

          installment_no: item.InstallmentLabel, // You might need to adjust this
          installment_status: "Paid", // Assuming all fetched transactions are paid
          installmentId: item.InstallmentId
        }));

        console.log("mapped transactions", mappedtransctions);
        setTransactions(mappedtransctions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  const handleTransactionChange = (field: any, value: string) => {
    // const updatedTransactions = [...transactions];
    console.log("field", field, value);

    setTransactionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // const handleAmountChange = (value: number, index: number) => {
  //   const numericValue = Number(value); // or parseFloat(value)

  //   setFormData((prev) => ({
  //     ...prev,
  //     installmentDetails: prev.installmentDetails.map((item, i) =>
  //       i === index ? { ...item, amount: numericValue } : item,
  //     ),
  //   }));
  // };

  const handleDateChange = async (installmentId: number, date: any) => {
    if (!date) return;

    try {
      // Format date to YYYY-MM-DD for API call
      const asOfDate = date.toString(); // This will be in YYYY-MM-DD format

      // Update local state immediately for better UX
      setPaidDates(prev => ({
        ...prev,
        [installmentId]: `${asOfDate}T00:00:00.000Z` // Convert to ISO string format
      }));

      // Call interest update API
      const interestResponse = await interestCalculate(installmentId, asOfDate);

      if (interestResponse.status === 200) {
        // Refresh installments data to get updated interest calculations
        await fetchInstallments();

        // Show success message
        toast.success(`Interest calculated successfully for ${asOfDate}`);
      } else {
        // Revert local state if API call fails
        setPaidDates(prev => {
          const newState = { ...prev };
          delete newState[installmentId];
          return newState;
        });
        toast.error('Failed to calculate interest');
      }

    } catch (error) {
      console.error('Error updating interest calculation:', error);

      // Revert local state on error
      setPaidDates(prev => {
        const newState = { ...prev };
        delete newState[installmentId];
        return newState;
      });

      toast.error('Error calculating interest');
    }
  };

  const refreshInterest = async () => {
    try {

      const interestResponse = await refreshCalculateInterest(formData.memberShipId);
      if (interestResponse.status === 200) {

        await fetchInstallments();

        toast.success(`Interest Calculation Refreshed successfully`);
      } else {
        // Revert local state if API call fails
        toast.error('Failed to Refresh interest Calculation');
      }

    } catch (error) {
      toast.error('Error Refreshing Calculation interest');
    }
  };

  const handleViewReceipts = (installment: any) => {
    try {

      const installmentNo = installment.id;


      // setSelectedInstallmentNo(installmentNo);

      // Filter transactions for this specific installment number
      const filteredReceipts = transactions
        .filter(
          (transaction: any) => transaction.installmentId === installmentNo,
        )
        .map((transaction: any) => ({

          receiptNo: transaction.tId,
          transactionDate: transaction.date,
          transactionAmount: transaction.amount,
          paymentMethod: transaction.mode,
          installmentNo: transaction.installment_no,
        }
        ));
      console.log("transactions", transactions)

      setSelectedReceipts(filteredReceipts);
      setIsReceiptModalOpen(true);
    } catch (error) {
      console.error("Error loading receipts:", error);
      toast.error("Error loading receipt details");
    }
  };

  useEffect(() => {
    if (formData.memberShipId) {
      fetchInstallments();
    }
  }, [formData.memberShipId]);
  useEffect(() => {
    if (formData.memberShipId) {
      fetchtrnsactions();
    }
  }, [formData.memberShipId]);
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const totalPaid = transactions
        // .filter((inst: any) => inst.status.toLowerCase() === "paid")
        .reduce((acc: number, inst: any) => acc + Number(inst.amount || 0), 0);

      setPaidAmount(totalPaid);
      console.log("totalPaid", totalPaid);
    }
  }, [transactions]);

  // Replace the handleOpenSplitModal function with this:
  const handleOpenSplitModal = () => {
    const availableInstalls = getAvailableInstallments();
    setAvailableInstallments(availableInstalls);

    if (availableInstalls.length === 0) {
      toast.error("No unpaid installments available to split");
      return;
    }

    // Auto-select the first available installment
    const firstInstallment = availableInstalls[0];
    setSelectedInstallmentForSplit(firstInstallment);

    // Initialize splits with the selected installment data
    const initialSplits = [
      {
        dueDate: firstInstallment.Paid_Date || "",
        amountDue: Math.round(firstInstallment.Installment_amount),
        label: `${firstInstallment.month}-${firstInstallment.year} (A)`
      }
    ];

    setSplits(initialSplits);
    setIsSplitModalOpen(true);
  };

  const addSplit = () => {
    if (selectedInstallmentForSplit) {
      const splitCount = splits.length + 1;
      const newSplit = {
        dueDate: "",
        amountDue: 0,
        label: `${selectedInstallmentForSplit.month}-${selectedInstallmentForSplit.year} (${String.fromCharCode(64 + splitCount)})`
      };
      setSplits([...splits, newSplit]);
    }
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      const newSplits = splits.filter((_, i) => i !== index);
      // Update labels
      const updatedSplits = newSplits.map((split, i) => ({
        ...split,
        label: `${selectedInstallmentForSplit.month}-${selectedInstallmentForSplit.year} (${String.fromCharCode(65 + i)})`
      }));
      setSplits(updatedSplits);
    }
  };

  // Add this function to update a split
  const updateSplit = (index: number, field: string, value: any) => {
    const newSplits = [...splits];

    if (field === 'dueDate') {
      // Handle DateValue object from HeroUI DatePicker
      if (value && typeof value === 'object' && 'year' in value) {
        // Convert DateValue to YYYY-MM-DD string format
        const dateString = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
        newSplits[index] = {
          ...newSplits[index],
          [field]: dateString
        };
      } else if (typeof value === 'string') {
        // It's already a string (from native input)
        newSplits[index] = {
          ...newSplits[index],
          [field]: value
        };
      }
    } else {
      // For other fields
      newSplits[index] = {
        ...newSplits[index],
        [field]: value
      };
    }

    setSplits(newSplits);
  };

  const handleSplitInstallment = async () => {
    if (!selectedInstallmentForSplit) {
      toast.error("Please select an installment to split");
      return;
    }

    // Validate splits
    const totalAmount = splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0);
    const originalAmount = Math.round(selectedInstallmentForSplit.Installment_amount);

    if (totalAmount !== originalAmount) {
      toast.error(`Total split amount (${totalAmount}) must equal original amount (${originalAmount})`);
      return;
    }

    if (splits.some(split => !split.dueDate)) {
      toast.error("All splits must have a due date");
      return;
    }

    const toastId = toast.loading("Splitting installment...");

    try {
      // Prepare the payload according to API requirements
      const payload = {
        splits: splits.map(split => ({
          dueDate: split.dueDate, // Already in YYYY-MM-DD format from native input
          amountDue: Number(split.amountDue),
          label: split.label
        }))
      };

      console.log("Split payload:", payload);

      // Call the API to save the splits
      const response = await splitInstallment(selectedInstallmentForSplit.id, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Installment split successfully!", { id: toastId });
        setIsSplitModalOpen(false);

        // Reset form state
        setSplits([]);
        setSelectedInstallmentForSplit(null);
        setAvailableInstallments([]);

        // Refresh installments after splitting
        fetchInstallments();
        fetchtrnsactions(); // Refresh transactions if needed
      } else {
        throw new Error(response.data?.message || "Failed to split installment");
      }

    } catch (error: any) {
      console.error("Error splitting installment:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error("Unauthorized - Please login again", { id: toastId });
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid split data", { id: toastId });
      } else if (error.response?.status === 404) {
        toast.error("Installment not found", { id: toastId });
      } else {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Error splitting installment",
          { id: toastId }
        );
      }
    }
  };

  const handleInstallmentChange = (installment: any) => {
    setSelectedInstallmentForSplit(installment);

    // Reset splits for the new selected installment
    const initialSplits = [
      {
        dueDate: installment.Paid_Date || "",
        amountDue: Math.round(installment.Installment_amount),
        label: `${installment.month}-${installment.year} (A)`
      }
    ];

    setSplits(initialSplits);
  };







  return (
    <div className="">
      <div className="sticky top-0 overflow-hidden z-20 bg-transparent  shadow-sm flex gap-10 lg:items-center lg:flex-row flex-col justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {formData.firstName} {formData.midName} {formData.lastname}
            </h2>
            <p className="text-gray-600">Member ID: {formData.memberShipId}</p>
            {formData?.received_date != "" && (
              <p className="text-gray-600">
                Form Received on:{" "}
                {formatDate(new Date(formData.received_date), "dd-MM-yyyy")}
              </p>
            )}
          </div>
          <div className="flex gap-5 items-center" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-lg"
            color={currentStep === 0 ? "primary" : "default"}
            startContent={<User size={16} />}
            variant={currentStep === 0 ? "solid" : "flat"}
            onPress={() => {
              setCurrentStep(0);
              const element = document.getElementById("personal");

              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Personal Info
          </Button>
          <Button
            className="rounded-lg"
            color={currentStep === 1 ? "primary" : "default"}
            startContent={<CreditCard size={16} />}
            variant={currentStep === 1 ? "solid" : "flat"}
            onPress={() => {
              setCurrentStep(1);
              const element = document.getElementById("installments");

              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
              fetchInstallments();
              fetchtrnsactions();
            }}
          >
            Installments
          </Button>
          <Button
            className="rounded-lg bg-green-600 text-white"
            startContent={<Download size={16} />}
            onPress={fetchExportData}
          >
            Export Statements
          </Button>
          {/* <Button
            // onPress={} 
            startContent={<MailIcon size={16} />}
            className="rounded-lg bg-yellow-600 text-white"
          >
            Reminder
          </Button> */}

          {/* Bellet button only visible if fully paid  */}
          {installmentSummary?.totalOutstanding === 0 && (
            <>
              <Button
                className="bg-blue-600 rounded-lg text-white"
                onPress={() => setIsAssignBelletOpen(true)}
              >
                {formData.secondaryPermaentID
                  ? "Update Bellet"
                  : "Assign Bellet"}
              </Button>

              <Modal
                isOpen={isAssignBelletOpen}
                onOpenChange={setIsAssignBelletOpen}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Assign Bellet
                      </ModalHeader>
                      <ModalBody>
                        <I18nProvider locale="en-IN">
                          <DatePicker
                            showMonthAndYearPickers
                            className="w-full"
                            label="Bellet Date"
                            maxValue={today(getLocalTimeZone())}
                            value={belletDate}
                            onChange={setBelletDate}
                          />
                        </I18nProvider>

                        <Input
                          className="w-full"
                          label="Membership ID"
                          placeholder="Membership ID"
                          value={permanentmembershipId}
                          onValueChange={setpermanentMembershipId}
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleAssignBellet}>
                          Assign
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          )}
        </div>
      </div>

      <div className="max-h-[75vh] overflow-y-auto no-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{formData.amount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {installmentSummary?.totalPaid
                    ? `₹${installmentSummary.totalPaid.toLocaleString("en-IN")}`
                    : "₹0"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {installmentSummary?.totalOutstanding === 0
                    ? "Status"
                    : "Pending Amount"}
                </p>
                {installmentSummary?.totalOutstanding === 0 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      Fully Paid
                    </p>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      ✓
                    </span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-amber-600">
                    ₹
                    {installmentSummary?.totalOutstanding?.toLocaleString(
                      "en-IN",
                    ) || "0"}
                  </p>
                )}
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${installmentSummary?.totalOutstanding === 0
                  ? "bg-green-100"
                  : "bg-amber-100"
                  }`}
              >
                <Calendar
                  className={`h-5 w-5 ${installmentSummary?.totalOutstanding === 0
                    ? "text-green-600"
                    : "text-amber-600"
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* )} */}
        {/* Personal Information Section */}
        <div
          className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden"
          id="personal"
        >
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <User size={16} /> Gender
                </p>
                <p className="text-base font-medium">{formData.gender}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar size={16} /> Date of Birth
                </p>
                <p className="text-base font-medium">
                  {new Date(formData.date.toString()).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-base font-medium">{String(age)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Nationality</p>
                <p className="text-base font-medium">{formData.nationality}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail size={16} /> Email
                </p>
                <p className="text-base font-medium">{formData.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone size={16} /> Phone
                </p>
                <p className="text-base font-medium">{formData.phone}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin size={16} /> Address
                </p>
                <p className="text-base font-medium">
                  {formData.address || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Country</p>
                <p className="text-base font-medium">{formData.country}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Pincode</p>
                <p className="text-base font-medium">
                  {formData.pinCode || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">MCP No</p>
                <p className="text-base font-medium">
                  {formData.McbNo || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Membership Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Associated Member
                  </p>
                  <p className="text-base font-medium">
                    {formData.associatedMember || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Secondary Code
                  </p>
                  <p className="text-base font-medium">
                    {formData.secondarCode || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Proposal Code
                  </p>
                  <p className="text-base font-medium">
                    {formData.proposalCode || "N/A"}
                  </p>
                </div>

                {formData.secondaryPermaentID &&
                  formData.secondaryPermaentID !== "N/A" && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">
                        Membership ID
                      </p>
                      <p className="text-base font-medium">
                        {formData.secondaryPermaentID}
                      </p>
                    </div>
                  )}

                {formData.balletDate && formData.balletDate !== "N/A" && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Bellet Date
                    </p>
                    <p className="text-base font-medium">
                      {formatDate(new Date(formData.balletDate), "dd-MM-yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-96 w-full" id="installments">
          <div className="overflow-y-auto pb-10">
            {formData.installmentDetails && (
              <div className="mt-6">
                {/* Header + Summary always visible */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Installment Schedule
                  </h3>
                </div>

                <div className=" w-full justify-between flex mb-2 ">
                  <p className="text-sm text-gray-500">
                    All installments will be due in January or July based on
                    your selected start date
                  </p>
                  {/* <Button
                    className="bg-blue-500 text-white place-content-center"
                    onPress={calculateInterest}
                  >
                    Calculate Interest
                  </Button> */}


                  <div className="flex gap-1">
                    <Button
                      className="bg-blue-500 text-white place-content-center"
                      onPress={handleOpenSplitModal}
                    >
                      Split Installments
                    </Button>
                    {/* <Button
                      color="primary"
                      onPress={refreshInterest}
                    >
                      Refresh Interest
                    </Button> */}
                  </div>

                </div>

                {/* Table */}
                <div className=" max-w-[99%] max-h-[70vh] sticky overflow-x-auto border rounded-lg bg-white/50">
                  <table className="  text-sm  text-left border-collapse ">
                    <thead className="bg-gray-100  text-gray-700 text-sm font-medium sticky top-0 z-20 ">
                      <tr>
                        <th className="px-2 py-3 border-b w-12">#</th>
                        <th className="px-2 py-3 border-b w-28 whitespace-normal">
                          Installment Due
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Date
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Receipt No.
                        </th>
                        <th className="px-2 py-3 border-b text-center w-26 whitespace-normal">
                          Amount (₹)
                        </th>
                        <th className="px-2 py-3 border-b text-center w-32 whitespace-normal">
                          No of Months
                        </th>
                        <th className="px-2 py-3 border-b text-center w-20 whitespace-normal">
                          Int. Rate
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Interest Amt.
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          CGST On Int
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          SGST On Int
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          GST On Int
                        </th>
                        {/* <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Total Amt.
                        </th> */}
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Paid Amt.
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Pending Amt.
                        </th>
                        <th className="px-2 py-3 border-b text-center w-28 whitespace-normal">
                          Interest Calculation Date
                        </th>
                        <th className="px-2 py-3 border-b text-center w-24 whitespace-normal">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.installmentDetails.length > 0 ? (
                        formData.installmentDetails.map(
                          (installment: any, index: number) => {
                            // Get current year
                            const currentYear = new Date().getFullYear();
                            // Check if this installment is for the current year
                            const isCurrentYear =
                              installment.year == currentYear;
                            // console.log(installment);

                            return (
                              <tr
                                key={index}
                                className={cn(
                                  "border-b last:border-none",
                                  isCurrentYear && "bg-blue-50 border-l-4 border-l-blue-500",
                                )}
                              >
                                <td className="px-2 py-3 text-center">
                                  {/* {installment.InstallmentId} */}
                                  {/* {index + 1} */}
                                  {installment.Label}
                                </td>

                                <td className="px-2 py-3 text-center">
                                  <I18nProvider locale="en-IN">
                                    <DatePicker
                                      isDisabled={installment.Status === "PAID"}
                                      showMonthAndYearPickers
                                      className="w-full"

                                      value={parseDate(installment.DueDate.split("T")[0])}
                                      onChange={(date) => handleDueDateChange(installment.InstallmentId, date)}
                                    />
                                  </I18nProvider>
                                  {isCurrentYear && (
                                    <span className=" inline-flex items-center px-2 py-0.5  text-xs font-medium bg-blue-100">

                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center whitespace-nowrap">
                                  {installment.PaidInFullDate
                                    ? format(new Date(installment.PaidInFullDate), "dd-MM-yyyy")
                                    : "--"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {installment.Status === "PAID" || installment.Status === "PARTIAL" ? (
                                    <div className="justify-self-center">
                                      <button
                                        className="cursor-pointer hover:bg-blue-200 transition-colors rounded-full"
                                        onClick={() => handleViewReceipts(installment)}
                                      >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                          <EyeIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                      </button>
                                    </div>
                                  ) : (
                                    "--"
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <input
                                    className={cn(
                                      "border border-gray-300 rounded-xl px-2 py-1 text-center w-32",
                                      isCurrentYear && "bg-white border-blue-300",
                                      installment.PrincipalPaid === installment.AmountDue && "border-green-500"
                                    )}
                                    type="number"
                                    value={Math.round(installment.AmountDue)}
                                    onChange={(e) => {
                                      // Update local state only for immediate UI feedback
                                      const value = Number(e.target.value);
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        installmentDetails: prev.installmentDetails.map((inst: any) =>
                                          inst.InstallmentId === installment.InstallmentId
                                            ? { ...inst, AmountDue: value }
                                            : inst
                                        )
                                      }));
                                    }}
                                    onBlur={(e) => {
                                      // const newAmount = Number(e.target.value);
                                      // const originalAmount = Math.round(installment.AmountDue);

                                      // // Only call API if amount actually changed and is valid
                                      // if (newAmount !== originalAmount && newAmount > 0) {
                                        handleAmountChange(installment.InstallmentId, Number(e.target.value));
                                      // } else if (newAmount <= 0) {
                                      //   toast.error('Amount must be greater than 0');
                                      //   // Revert to original amount locally
                                      //   setFormData((prev: any) => ({
                                      //     ...prev,
                                      //     installmentDetails: prev.installmentDetails.map((inst: any) =>
                                      //       inst.InstallmentId === installment.InstallmentId
                                      //         ? { ...inst, AmountDue: originalAmount }
                                      //         : inst
                                      //     )
                                      //   }));
                                      // }
                                    }}
                                  />
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {installment.MonthsRounded || "0"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {installment.InterestPctOfPrincipal
                                    ? `${installment.InterestPctOfPrincipal}%`
                                    : "--"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full  font-medium",
                                      installment.InterestPaid === installment.InterestAccrued && installment.InterestAccrued
                                        ? "bg-green-100 text-green-800"
                                        : ""
                                    )}
                                  >
                                    {installment.InterestAccrued
                                      ? `₹${installment.InterestAccrued}`
                                      : "--"}
                                  </span>
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {installment.GSTAccrued
                                    ? `₹${Math.round(installment.GSTAccrued / 2)}`
                                    : "--"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {installment.GSTAccrued
                                    ? `₹${Math.round(installment.GSTAccrued / 2)}`
                                    : "--"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full  font-medium",
                                      installment.GSTPaid === installment.GSTAccrued && installment.GSTAccrued
                                        ? "bg-green-100 text-green-800"
                                        : ""
                                    )}
                                  >
                                    {installment.GSTAccrued
                                      ? `₹${installment.GSTAccrued}`
                                      : "--"}
                                  </span>
                                </td>
                                {/* <td className="px-2 py-3 text-center">
                                  {installment.TotalOutstanding
                                    ? `₹${installment.TotalOutstanding}`
                                    : "--"}
                                </td> */}
                                <td className="px-2 py-3 text-center">
                                  {installment.PrincipalPaid
                                    ? `₹${installment.PrincipalPaid+(installment?.InterestPaid??0)+(installment?.GSTPaid??0)}`
                                    : "--"}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                      installment.TotalOutstanding > 0
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800",
                                    )}
                                  >
                                    {installment.TotalOutstanding
                                      ? `₹${installment.TotalOutstanding}`
                                      : "₹0"}
                                  </span>
                                </td>

                                <td className="px-2 py-3 text-center">
                                  <I18nProvider locale="en-IN">
                                    <DatePicker
                                      isDisabled={installment.Status === "PAID"}
                                      showMonthAndYearPickers
                                      className="w-full"
                                      maxValue={today(getLocalTimeZone())}
                                      value={
                                        paidDates[installment.InstallmentId]
                                          ? parseDate(paidDates[installment.InstallmentId].split("T")[0])
                                          :(installment.LastInterestCalcDate?parseDate(installment.LastInterestCalcDate.split("T")[0]):( installment.CalculatedAsOf
                                            ? parseDate(installment.CalculatedAsOf.split("T")[0])
                                            : null))
                                      }
                                      onChange={(date) => handleDateChange(installment.InstallmentId, date)}
                                    />
                                  </I18nProvider>
                                </td>

                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                      installment.Status === "PAID"
                                        ? "bg-green-100 text-green-800"
                                        : installment.Status === "PENDING"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800",
                                    )}
                                  >
                                    {installment.Status}
                                  </span>
                                </td>
                              </tr>
                            );
                          },
                        )
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          No installments available
                        </div>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-700 font-medium">
                  Paid Installments
                </p>
                <p className="text-xl font-bold">
                  {/* {exportData?.summary?.["Receipt No Series"] || "C"} */}
                  {installmentSummary?.paidInstallments}/{installmentSummary?.totalInstallments}
                  {/* {exportData?.header?.CodeLine?.substring(0, 1) || "A"} */}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">
                  Total Paid Amount
                </p>
                <p className="text-xl font-bold">
                  ₹{paidAmount}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 font-medium">
                  Total Interest
                </p>
                <p className="text-xl font-bold">
                  {installmentSummary?.totalInterest
                    ? `₹${installmentSummary.totalInterest.toLocaleString("en-IN")}`
                    : "₹0"}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">
                  GST on Interest
                </p>
                <p className="text-xl font-bold">
                  {installmentSummary?.totalGST
                    ? `₹${installmentSummary.totalGST.toLocaleString("en-IN")}`
                    : "₹0"}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-red-700 font-medium">
                  Total Payable
                </p>
                <p className="text-xl font-bold">
                  {installmentSummary?.totalOutstanding
                    ? `₹${installmentSummary.totalOutstanding.toLocaleString("en-IN")}`
                    : "₹0"}
                </p>
              </div>
            </div>
            {/* Transactions section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
          </div> */}
              <div className="p-6">
                <TransactionTable
                  addTransaction={addTransaction}
                  deleteTransaction={deleteTransaction}
                  handleTransactionChange={handleTransactionChange}
                  isAddTrnModalOpen={isAddTrnModalOpen}
                  isTrnSubmitting={isTrnSubmitting}
                  membershipId={formData.memberShipId}
                  setIsAddTrnModalOpen={setIsAddTrnModalOpen}
                  transactionData={transactionData}
                  transactions={transactions}
                  updateTransaction={updateTransaction}
                  access={access}
                  totalPayable={installmentSummary?.Total_Payable || 0}
                  installments={getAvailableInstallments()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {currentStep === 0 && ( */}

      <Modal
        isOpen={isReceiptModalOpen}
        size="lg"
        onOpenChange={setIsReceiptModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Receipt Details - Installment {selectedInstallmentNo}
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="space-y-3">
                  {selectedReceipts.map((receipt, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            Receipt: {receipt.receiptNo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date:{" "}
                            {format(
                              new Date(receipt.transactionDate),
                              "dd-MM-yyyy",
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          ₹{receipt.transactionAmount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>


      {/* Split Installment Modal */}
      <Modal
        isOpen={isSplitModalOpen}
        size="2xl"
        onOpenChange={setIsSplitModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Split Installment
              </ModalHeader>
              <ModalBody className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Installment Selection Dropdown */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="block text-sm font-medium text-gray-700 mb-2">
                      Select Installment to Split
                    </div>

                    <SelectField
                      label="Select Installment to Split"
                      value={selectedInstallmentForSplit ? new Set([String(selectedInstallmentForSplit.id)]) : new Set()}
                      onChange={(keys) => {
                        console.log("Selected keys:", keys);
                        const selectedKey = Array.from(keys)[0];
                        console.log("Selected key:", selectedKey);

                        if (selectedKey) {
                          const selected = availableInstallments.find(
                            (inst: any) => String(inst.id) === String(selectedKey)
                          );
                          console.log("Found installment:", selected);

                          if (selected) {
                            handleInstallmentChange(selected);
                          }
                        } else {
                          setSelectedInstallmentForSplit(null);
                          setSplits([]);
                        }
                      }}
                      options={availableInstallments.map((installment: any) => ({
                        key: String(installment.id), // Convert to string
                        label: `${installment.month} ${installment.year}`
                      }))}
                      className="w-full"
                      disabled={availableInstallments.length === 0}
                      isRequired
                    />


                    {availableInstallments.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No unpaid installments available to split
                      </p>
                    )}

                  </div>

                  {selectedInstallmentForSplit && (
                    <>

                      {splits.map((split, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-700">{split.label}</h4>
                            {splits.length > 1 && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => removeSplit(index)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <I18nProvider locale="en-IN">
                              <DatePicker
                                showMonthAndYearPickers
                                label="Due Date"
                                className="w-full"
                                // value={split.dueDate ? parseDate(split.dueDate) : null}
                                onChange={(date) => updateSplit(index, 'dueDate', date)}
                              />
                            </I18nProvider>

                            <Input
                              label="Amount Due (₹)"
                              type="number"
                              // value={split.amountDue.toString()}
                              onValueChange={(value) => updateSplit(index, 'amountDue', Number(value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        onPress={addSplit}
                        variant="bordered"
                        startContent={<Plus size={16} />}
                        className="w-full"
                      >
                        Add Another Split
                      </Button>

                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Split Total:</span>
                          <span className="font-bold">
                            ₹{splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Original Amount:</span>
                          <span className="text-sm">
                            ₹{Math.round(selectedInstallmentForSplit.Installment_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Difference:</span>
                          <span className={`text-sm ${splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0) ===
                            Math.round(selectedInstallmentForSplit.Installment_amount)
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}>
                            ₹{splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0) -
                              Math.round(selectedInstallmentForSplit.Installment_amount)}
                          </span>
                        </div>
                        {splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0) !==
                          Math.round(selectedInstallmentForSplit.Installment_amount) && (
                            <p className="text-red-500 text-xs mt-2">
                              Total split amount must equal original amount
                            </p>
                          )}
                      </div>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSplitInstallment}
                  isDisabled={
                    !selectedInstallmentForSplit ||
                    splits.reduce((sum, split) => sum + (Number(split.amountDue) || 0), 0) !==
                    Math.round(selectedInstallmentForSplit.Installment_amount) ||
                    splits.some(split => !split.dueDate)
                  }
                >
                  Split Installment
                </Button>

              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewForm;
