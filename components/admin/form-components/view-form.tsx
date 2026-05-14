import { format } from "date-fns";
import { debounce } from "lodash";
import {
  Calendar as CalendarIcon,
  CreditCard,
  Download,
  EyeIcon,
  FileText,
  Globe,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Trash2,
  User,
  Users,
  Wallet,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import TransactionTable from "./transaction-table";

import api from "@/utils/axios";
import { calculateDetailedAge, formatDisplayDate } from "@/utils/date";
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
  const transactionSubmitLockRef = useRef(false);

  const [isAddTrnModalOpen, setIsAddTrnModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any>([]);
  const [installmentSummary, setInstallmentSummary] = useState<any>(null);
  const [isInstallmentLoading, setIsInstallmentLoading] = useState(false);
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
  //   }
  // };

  const fetchInstallments = async () => {
    setIsInstallmentLoading(true);

    try {
      const res = await getInstallments(access, formData.memberShipId);

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

        const summary = calculateSummary(mappedInstallments);
        setInstallmentSummary(summary);
      }
    } catch (error) {
      toast.error("Failed to load installment schedule");
    } finally {
      setIsInstallmentLoading(false);
    }
  };

  // Helper function to calculate summary from installments
  const calculateSummary = (installments: any[]) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const toDueDate = (value: any) => {
      if (!value) return null;

      const parsed = new Date(value);

      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const totalPaid = installments.reduce(
      (sum, item) => sum + item.PrincipalPaid,
      0,
    );
    const totalOutstanding = installments.reduce(
      (sum, item) => sum + item.TotalOutstanding,
      0,
    );
    const outstandingTillDate = installments.reduce((sum, item) => {
      const dueDate = toDueDate(item.DueDate);

      if (!dueDate || dueDate > today) return sum;

      return sum + Math.max(0, Number(item.TotalOutstanding) || 0);
    }, 0);
    const totalInterest = installments.reduce(
      (sum, item) => sum + item.InterestAccrued,
      0,
    );
    const totalGST = installments.reduce((sum, item) => sum + item.GSTAccrued, 0);

    return {
      totalPaid,
      totalOutstanding,
      outstandingTillDate,
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
      return;
    }

    const response = await exportInstallmentData(formData.memberShipId);

    
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
  }
};

  const addTransaction = async () => {
    if (transactionSubmitLockRef.current) return;

    transactionSubmitLockRef.current = true;
    setIsTrnSubmitting(true);

    if (Number(transactionData.amount) > Number(formData.amount)) {
      toast.error("Amount cannot be greater than total amount");
      setIsTrnSubmitting(false);
      transactionSubmitLockRef.current = false;

      return;
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

    const toastId = toast.loading("Adding transaction...");

    try {
      const res = await addtransaction(_transaction);
      const successMessage =
        res?.data?.message ||
        res?.data?.data?.message ||
        "Transaction added successfully";

      if (res?.status == 200) {
        toast.success(successMessage, { id: toastId });
        setIsAddTrnModalOpen(false);
        fetchtrnsactions();
        fetchInstallments();
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
        toast.error("Error adding transaction", { id: toastId });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error adding transaction",
        { id: toastId },
      );
    } finally {
      setIsTrnSubmitting(false);
      transactionSubmitLockRef.current = false;
    }
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
      const successMessage =
        res?.data?.message ||
        res?.data?.data?.message ||
        "Transaction updated successfully";

      if (res.status === 200) {
        toast.success(successMessage, { id: toastId });
        fetchtrnsactions(); // Refresh the transactions list
        fetchInstallments(); // Refresh the installments
      } else {
        toast.error("Failed to update transaction", { id: toastId });
      }
    } catch (error: any) {
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
      toast.success("Interest calculated successfully!");
    } catch (error) {
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

      //   "Full URL after rewrite should be:",
      //   `${process.env.NEXT_PUBLIC_API_URL_2}${apiUrl}`
      // );

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

        setTransactions(mappedtransctions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    }
  };

  const handleTransactionChange = (field: any, value: string) => {
    // const updatedTransactions = [...transactions];

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

      setSelectedReceipts(filteredReceipts);
      setIsReceiptModalOpen(true);
    } catch (error) {
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







  const tabValue =
    currentStep === 1
      ? "installments"
      : currentStep === 2
        ? "transactions"
        : "overview";

  const handleTabChange = (next: string) => {
    if (next === "overview") {
      setCurrentStep(0);
    } else if (next === "installments") {
      setCurrentStep(1);
      fetchInstallments();
      fetchtrnsactions();
    } else {
      setCurrentStep(2);
    }
  };

  const isFullyPaid = installmentSummary?.totalOutstanding === 0;

  const fullName = [formData.firstName, formData.midName, formData.lastname]
    .filter(Boolean)
    .join(" ");
  const initials = [formData.firstName, formData.lastname]
    .filter(Boolean)
    .map((s: string) => s.charAt(0).toUpperCase())
    .join("") || "M";

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </p>
      <p className="text-sm font-medium text-foreground break-words">
        {value || "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-4 px-1 pb-10">
      {/* ── Header card ─────────────────────────────────────────── */}
      <Card className="sticky top-0 z-30 border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {initials}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold leading-tight">{fullName}</h2>
                {isFullyPaid ? (
                  <Badge variant="success">Fully Paid</Badge>
                ) : (
                  <Badge variant="warning">Outstanding</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <IdCard className="h-3.5 w-3.5" /> {formData.memberShipId}
                </span>
                {formData?.received_date && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" /> Received{" "}
                    {formatDisplayDate(formData.received_date)}
                  </span>
                )}
                {formData.category && (
                  <Badge variant="outline">{formData.category}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={fetchExportData}>
              <Download className="mr-2 h-4 w-4" /> Export Statement
            </Button>
            {isFullyPaid && (
              <Button onClick={() => setIsAssignBelletOpen(true)}>
                {formData.secondaryPermaentID
                  ? "Update Bellet"
                  : "Assign Bellet"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Amount
              </p>
              <p className="mt-1 text-2xl font-bold">
                ₹
                {Number(formData.amount || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Paid Amount
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                ₹
                {(installmentSummary?.totalPaid ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {isFullyPaid ? "Status" : "Pending Amount"}
              </p>
              {isFullyPaid ? (
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  Fully Paid
                </p>
              ) : (
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  ₹
                  {(installmentSummary?.totalOutstanding ?? 0).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isFullyPaid
                  ? "bg-emerald-100 dark:bg-emerald-950/40"
                  : "bg-amber-100 dark:bg-amber-950/40",
              )}
            >
              <CalendarIcon
                className={cn(
                  "h-5 w-5",
                  isFullyPaid
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-amber-600 dark:text-amber-300",
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <Tabs value={tabValue} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">
            <User className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="installments">
            <CreditCard className="mr-2 h-4 w-4" /> Installments
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="mr-2 h-4 w-4" /> Transactions
          </TabsTrigger>
        </TabsList>

        {/* ── Overview tab ────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              <InfoRow
                label="Gender"
                icon={<User className="h-3.5 w-3.5" />}
                value={formData.gender}
              />
              <InfoRow
                label="Date of Birth"
                icon={<CalendarIcon className="h-3.5 w-3.5" />}
                value={formatDisplayDate(formData.date)}
              />
              <InfoRow
                label="Age on Received"
                value={
                  calculateDetailedAge(
                    formData.date,
                    formData.received_date,
                  ) || ""
                }
              />
              <InfoRow
                label="Current Age"
                value={calculateDetailedAge(formData.date)}
              />
              <InfoRow
                label="Nationality"
                icon={<Globe className="h-3.5 w-3.5" />}
                value={formData.nationality}
              />
              <InfoRow
                label="Email"
                icon={<Mail className="h-3.5 w-3.5" />}
                value={formData.email}
              />
              <InfoRow
                label="Phone"
                icon={<Phone className="h-3.5 w-3.5" />}
                value={formData.phone}
              />
              <InfoRow
                label="Address"
                icon={<MapPin className="h-3.5 w-3.5" />}
                value={formData.address}
              />
              <InfoRow label="Country" value={formData.country} />
              <InfoRow label="Pincode" value={formData.pinCode} />
              <InfoRow label="MCP No" value={formData.McbNo} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Membership Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              <InfoRow
                label="Associated Member"
                icon={<Users className="h-3.5 w-3.5" />}
                value={formData.associatedMember}
              />
              <InfoRow
                label="Secondary Code"
                value={formData.secondarCode}
              />
              <InfoRow
                label="Proposal Code"
                value={formData.proposalCode}
              />
              {formData.secondaryPermaentID &&
                formData.secondaryPermaentID !== "N/A" && (
                  <InfoRow
                    label="Membership ID"
                    value={formData.secondaryPermaentID}
                  />
                )}
              {formData.balletDate && formData.balletDate !== "N/A" && (
                <InfoRow
                  label="Bellet Date"
                  value={formatDisplayDate(formData.balletDate)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Installments tab ─────────────────────────────────────── */}
        <TabsContent value="installments" className="space-y-4">
        <div className="min-h-96 w-full">
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
                      className="bg-blue-500 text-white hover:bg-blue-600 place-content-center"
                      onClick={handleOpenSplitModal}
                    >
                      Split Installments
                    </Button>
                  </div>

                </div>

                {/* Table */}
                <div className=" max-w-[99%] sticky overflow-x-auto border rounded-lg bg-white/50">
                  <table className="  text-sm  text-left border-collapse ">
                    <thead className="bg-gray-100  text-gray-700 text-sm font-medium sticky top-0 z-20 ">
                      <tr>
                        <th className="px-2 py-3 border-b w-12">#</th>
                        <th className="px-2 py-3 border-b w-36 whitespace-normal">
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
                        <th className="px-2 py-3 border-b text-center w-36 whitespace-normal">
                          Interest Calculation Date
                        </th>
                        <th className="px-2 py-3 border-b text-center w-24 whitespace-normal">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isInstallmentLoading ? (
                        <tr>
                          <td
                            className="px-2 py-10 text-center text-sm text-gray-500"
                            colSpan={15}
                          >
                            <div className="flex items-center justify-center gap-3">
                              <Spinner size="sm" />
                              <span>Loading installment schedule...</span>
                            </div>
                          </td>
                        </tr>
                      ) : formData.installmentDetails.length > 0 ? (
                        formData.installmentDetails.map(
                          (installment: any, index: number) => {
                            // Get current year
                            const currentYear = new Date().getFullYear();
                            // Check if this installment is for the current year
                            const isCurrentYear =
                              installment.year == currentYear;

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
                                  <DateField
                                    compact
                                    showShortcuts={false}
                                    disabled={installment.Status === "PAID"}
                                    value={installment.DueDate?.split("T")[0]}
                                    onChange={(d) =>
                                      handleDueDateChange(
                                        installment.InstallmentId,
                                        d,
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-3 text-center whitespace-nowrap">
                                  {formatDisplayDate(installment.PaidInFullDate)}
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
                                  <DateField
                                    compact
                                    showShortcuts={false}
                                    disabled={installment.Status === "PAID"}
                                    maxDate={new Date()}
                                    value={
                                      paidDates[installment.InstallmentId]
                                        ? paidDates[
                                            installment.InstallmentId
                                          ].split("T")[0]
                                        : installment.LastInterestCalcDate
                                          ? installment.LastInterestCalcDate.split(
                                              "T",
                                            )[0]
                                          : installment.CalculatedAsOf
                                            ? installment.CalculatedAsOf.split(
                                                "T",
                                              )[0]
                                            : ""
                                    }
                                    onChange={(d) =>
                                      handleDateChange(
                                        installment.InstallmentId,
                                        d,
                                      )
                                    }
                                  />
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
                        <tr>
                          <td
                            className="px-2 py-10 text-center text-gray-500"
                            colSpan={15}
                          >
                            No installments available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-700 font-medium">
                  Outstanding Till Date
                </p>
                <p className="text-xl font-bold">
                  {installmentSummary?.outstandingTillDate
                    ? `₹${installmentSummary.outstandingTillDate.toLocaleString("en-IN")}`
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
          </div>
        </div>
        </TabsContent>

        {/* ── Transactions tab ─────────────────────────────────────── */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Bellet Dialog (moved out of header) ──────────────────── */}
      <Dialog open={isAssignBelletOpen} onOpenChange={setIsAssignBelletOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Bellet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <DateField
              label="Bellet Date"
              value={belletDate}
              maxDate={new Date()}
              onChange={setBelletDate}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="permanent-membership-id">Membership ID</Label>
              <Input
                id="permanent-membership-id"
                className="w-full"
                placeholder="Membership ID"
                value={permanentmembershipId}
                onChange={(e) => setpermanentMembershipId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAssignBelletOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignBellet}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Receipt Details - Installment {selectedInstallmentNo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pb-2">
            {selectedReceipts.map((receipt, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Receipt: {receipt.receiptNo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {formatDisplayDate(receipt.transactionDate)}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    ₹{receipt.transactionAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>


      {/* Split Installment Modal */}
      <Dialog open={isSplitModalOpen} onOpenChange={setIsSplitModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Split Installment</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
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
                        const selectedKey = Array.from(keys)[0];

                        if (selectedKey) {
                          const selected = availableInstallments.find(
                            (inst: any) => String(inst.id) === String(selectedKey)
                          );

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
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeSplit(index)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <DateField
                              label="Due Date"
                              value={split.dueDate}
                              onChange={(d) =>
                                updateSplit(index, "dueDate", d)
                              }
                            />

                            <div className="flex flex-col gap-1.5">
                              <Label>Amount Due (₹)</Label>
                              <Input
                                type="number"
                                onChange={(e) =>
                                  updateSplit(
                                    index,
                                    "amountDue",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={addSplit}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus size={16} className="mr-2" />
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
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => setIsSplitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSplitInstallment}
              disabled={
                !selectedInstallmentForSplit ||
                splits.reduce(
                  (sum, split) => sum + (Number(split.amountDue) || 0),
                  0,
                ) !==
                  Math.round(
                    selectedInstallmentForSplit.Installment_amount,
                  ) ||
                splits.some((split) => !split.dueDate)
              }
            >
              Split Installment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewForm;
