"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { DateValue } from "@heroui/react";

import PersonalInfo from "./form-components/personal-info";
import MembershipDetails from "./form-components/membership-details";
import Installments from "./form-components/installments";
import Confirmation from "./form-components/confirmation";
import ViewForm from "./form-components/view-form";

import FormLayout from "@/layouts/form-layout";
import { generateID, getPrimaryMembers } from "@/api/members";
import { installmentOptions } from "@/data";

/* --------------------------------------------
 * Types
 * ------------------------------------------- */

type LabelValue = { id: string; label: string };

export interface InstallmentItem {
  number?: number;
  amount: number;
  dueDate?: string;
  month?: string;
  year?: number;
  date: string; // yyyy-MM-dd
}

export interface FormData {
  firstName: string;
  midName: string;
  email: string;
  phone: string;
  gender: string;
  lastname: string;
  installments: number | string;
  address: string;
  typeName?: string;
  type: LabelValue | null; // category
  associatedMember: LabelValue | string | null;
  pinCode: string;
  country: string;
  date: Date | string | DateValue; // DOB
  memberShipId: string;
  nationality: string;
  secondarCode: LabelValue | string | null;
  proposalCode: LabelValue | string | null;
  subTypeName?: string;
  subType: LabelValue | null; // member type
  McbNo: string;
  dateOfInstallment: string | Date; // user-chosen start
  installmentDetails: InstallmentItem[];
  image?: File | string;
  amount?: number;
  received_date?: string | Date; // form received date
  firstInstallmentDate?: string;
  status: string;
}

interface MembersFormProps {
  title: string;
  type?: "add" | "edit" | "view";
  description: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleSubmit?: (formData) => Promise<any> | void;
  memberId?: string | null; // for edit/view
}

/* --------------------------------------------
 * Utilities
 * ------------------------------------------- */

// Debounce hook for search inputs
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

// Safe cookie access
function getAccessTokenFromCookie(key = "user"): string {
  try {
    const raw = Cookies.get(key);

    if (!raw) return "";
    const parsed = JSON.parse(raw);

    return parsed?.accessToken || "";
  } catch {
    return "";
  }
}

// Normalize Date | string | DateValue → JS Date or null
function toDate(d: Date | string | DateValue | undefined | null): Date | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === "string") {
    const parsed = new Date(d);

    return isNaN(parsed.getTime()) ? null : parsed;
  }
  // DateValue from @internationalized/date
  try {
    // Convert DateValue to JS Date in local timezone (YYYY-MM-DD)
    const y = d.year;
    const m = d.month - 1; // zero-based
    const day = d.day;
    const js = new Date(y, m, day);

    return isNaN(js.getTime()) ? null : js;
  } catch {
    return null;
  }
}

// Format to yyyy-MM-dd
function fmt(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");

  return `${y}-${m}-${d}`;
}

// Age in whole years
function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;

  return years;
}

// Create fixed semi-annual schedule: first = selected date; second = next Jan/Jul; then +6 months
// function generateFixedInstallmentSchedule(
//   startDate: Date,
//   count: number,
//   total: number
// ): InstallmentItem[] {
//   const per = Math.floor(total / count);
//   const remainder = total % count;

//   const items: InstallmentItem[] = [];

//   // 1. First installment on startDate
//   items.push({
//     amount: per + (count > 0 ? remainder : 0),
//     date: fmt(startDate),
//   });

//   let current = new Date(startDate);

//   // 2. Generate remaining installments on Jan 31 or Jul 31
//   for (let i = 1; i < count; i++) {
//     let year = current.getFullYear();
//     let month = current.getMonth() + 1; // 1-based month

//     let next: Date;

//     if (month <= 1) {
//       // If start before Feb → next is 31 Jan same year
//       next = new Date(year, 0, 31);
//     } else if (month <= 7) {
//       // If start before Aug → next is 31 Jul same year
//       next = new Date(year, 6, 31);
//     } else {
//       // Otherwise → next Jan 31 next year
//       next = new Date(year + 1, 0, 31);
//     }

//     // If next installment is still <= current, push to the next slot
//     if (next <= current) {
//       if (next.getMonth() === 0) {
//         next = new Date(next.getFullYear(), 6, 31); // July
//       } else {
//         next = new Date(next.getFullYear() + 1, 0, 31); // Next Jan
//       }
//     }

//     items.push({
//       amount: per,
//       date: fmt(next),
//     });

//     current = next;
//   }

//   return items;
// }

function generateFixedInstallmentSchedule(
  startDate: Date,
  count: number,
  total: number,
): InstallmentItem[] {
  const per = Math.floor(total / count);
  const remainder = total % count;

  const items: InstallmentItem[] = [];

  // 1. First installment on startDate
  items.push({
    amount: per + (count > 0 ? remainder : 0),
    date: fmt(startDate),
  });

  let current = new Date(startDate);

  // 2. Generate remaining installments on Jan 31 or Jul 31
  for (let i = 1; i < count; i++) {
    let year = current.getFullYear();
    let month = current.getMonth(); // 0-based month

    let next: Date;

    // For the FIRST installment after start, apply special skipping rules
    if (i === 1) {
      if (month >= 10) {
        // Nov or Dec
        next = new Date(year + 1, 6, 31); // July next year
      } else if (month >= 4 && month <= 5) {
        // May or Jun
        next = new Date(year + 1, 0, 31); // Jan next year
      } else {
        // Use normal logic for other months
        if (month <= 0) {
          // Jan
          next = new Date(year, 0, 31);
        } else if (month <= 6) {
          // Feb-Jul
          next = new Date(year, 6, 31);
        } else {
          // Aug-Dec
          next = new Date(year + 1, 0, 31);
        }
      }

      // Check if the selected date is the same as the upcoming installment
      // If so, skip to the next installment period
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();

      if (
        next.getMonth() === 0 &&
        startMonth === 0 &&
        next.getFullYear() === startYear
      ) {
        // Skip January installment if start date is in January
        next = new Date(startYear, 6, 31); // Go to July same year
      } else if (
        next.getMonth() === 6 &&
        startMonth === 6 &&
        next.getFullYear() === startYear
      ) {
        // Skip July installment if start date is in July
        next = new Date(startYear + 1, 0, 31); // Go to January next year
      }
    } else {
      // For subsequent installments, use alternating Jan/Jul logic
      if (current.getMonth() === 0) {
        // January
        next = new Date(current.getFullYear(), 6, 31); // July same year
      } else {
        // July
        next = new Date(current.getFullYear() + 1, 0, 31); // Jan next year
      }
    }

    items.push({
      amount: per,
      date: fmt(next),
    });

    current = next;
  }

  return items;
}
/* --------------------------------------------
 * Component
 * ------------------------------------------- */

const MembersForm: React.FC<MembersFormProps> = ({
  formData,
  memberId = null,
  setFormData,
  handleSubmit,
  title,
  description,
  type = "add",
}) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [totalAmount, setTotalAmount] = useState<number>(formData.amount || 0);
  const [primaryMembers, setPrimaryMembers] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState({
    primary: null,
    secondary: null,
    proposal: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 450);

  const accessToken = useMemo(() => getAccessTokenFromCookie(), []);
  const dob = useMemo(() => toDate(formData.date), [formData.date]);
  const age = useMemo(() => calcAge(dob), [dob]);

  // filter installment options by age (original rule kept)
  const filteredInstallmentOpn = useMemo(() => {
    // if (age == null) return installmentOptions;

    // return age > 22
    //   ? [installmentOptions[0]]
    //   : installmentOptions.filter((opn) => age <= opn.forAge);
    return installmentOptions;
  }, [age]);

  // --- Handlers -------------------------------------------------------------

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const checked =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : undefined;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setFormData],
  );

  const handleSelectionChange = useCallback(
    (key: keyof FormData, value: any) => {
      // Keep your price-from-type behavior
      if (key === "type" && value?.price != null) {
        setTotalAmount(value.price);
        setFormData((prev) => ({
          ...prev,
          type: value.type,
          amount: value.price,
        }));
      }
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [setFormData],
  );

  const handleCountrySelection = useCallback(
    (key: string | null) =>
      setFormData((prev) => ({ ...prev, country: key || "" })),
    [setFormData],
  );

  // generate member ID only for 'add'
  const generateMemberID = useCallback(async () => {
    try {
      const res = await generateID();
      const id = res?.data?.id || "";

      if (id) {
        setFormData((prev) => ({ ...prev, memberShipId: id }));
      }
    } catch {}
  }, [setFormData]);

  // Centralized validation per-step
  const validateStep = useCallback((): boolean => {
    if (type === "view") return true;

    if (currentStep === 0) {
      if (!formData.firstName?.trim())
        return toast.error("First name is required"), false;
      if (!formData.lastname?.trim())
        return toast.error("Last name is required"), false;
      if (!formData.email?.trim())
        return toast.error("Email address is required"), false;
      if (!formData.phone?.trim())
        return toast.error("Phone number is required"), false;
      if (!dob) return toast.error("Date of birth is required"), false;
      if (!formData.nationality?.trim())
        return toast.error("Nationality is required"), false;
      if (!formData.received_date)
        return toast.error("Form received date is required"), false;
      // if (!formData.image) return toast.error('Profile image is required'), false;
      if (!formData.associatedMember)
        return toast.error("Primary member selection is required"), false;

      if (age == null || age < 10) {
        return toast.error("Age must be 10 years or older"), false;
      }
    }

    if (currentStep === 1) {
      const sub = formData.subType;
      const cat = formData.type;

      if (!sub) return toast.error("Please enter member type"), false;
      if (!cat) return toast.error("Please enter category"), false;
    }

    return true;
  }, [age, currentStep, dob, formData, type]);

  const handleContinue = useCallback(async () => {
    if (!validateStep()) return;

    if (currentStep === steps.length - 1) {
      // mark as complete and submit
      setFormData((p) => ({ ...p, status: "complete" }));
      if (handleSubmit) {
        try {
          setLoading(true);
          const promise = Promise.resolve(
            handleSubmit({ ...formData, status: "complete" }),
          );

          await toast.promise(promise, {
            loading: "Please wait...",
            success: (data: any) => {
              router.push("/members");

              return data?.data?.message || "Saved";
            },
            error: (err: any) => err?.response?.data?.error || "Failed",
          });
        } finally {
          setLoading(false);
        }
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, handleSubmit, router, setFormData, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  // --- Installment schedule generation -------------------------------------

//   useEffect(()=> {
//     console.log("instalmments", formData.installments);
//     const count = Number(formData.installments || 1);
//     console.log("installasldjflkjasdf", count)
//     if (count == 0 ){
//       setFormData((prev) => ({
//         ...prev, 
//         installments: 1
//       }))
//     }
//   }, [formData.installments]
// )


  useEffect(() => {
    if (type === "view") return;

    const count = Number(formData.installments || 1);
    const start = toDate(formData.received_date);
    const total = Number(totalAmount || 0);

    if (!count || !start || !total) return;

    const schedule = generateFixedInstallmentSchedule(start, count, total);

    setFormData((prev) => ({
      ...prev,
      installmentDetails: schedule,
      dateOfInstallment: fmt(start),
    }));
  }, [
    formData.installments,
    formData.dateOfInstallment,
    formData.received_date,
    totalAmount,
    type,
    setFormData,
  ]);

  // --- Primary members search (debounced + abortable) ----------------------

  const fetchPrimaryMembers = useCallback(
    async (query?: string, signal?: AbortSignal) => {
      if (!accessToken) {
        setPrimaryMembers([]);

        return;
      }

      try {
        const res = await getPrimaryMembers(accessToken, query, { signal });
        const list =
          res?.data?.items?.map((item: any) => ({
            value: item.strMemberCode,
            label: `${item.strMemberCode}-${item.strFullName}`,
          })) ?? [];

        setPrimaryMembers(list);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setPrimaryMembers([]);
        }
      }
    },
    [accessToken],
  );

  const handleSubmitClick = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);
      const res = await handleSubmit({ ...formData, status: "draft" });

      toast.promise(res, {
        loading: "Please wait...",
        success: (data: any) => {
          router.push("/members");

          return data?.data?.message || "Saved";
        },
        error: (err: any) => err?.response?.data?.error || "Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchPrimaryMembers(debouncedQuery, controller.signal);

    return () => controller.abort();
  }, [debouncedQuery, fetchPrimaryMembers]);

  // --- Initialize for "add" ------------------------------------------------

  useEffect(() => {
    if (type === "add") generateMemberID();
  }, [type, generateMemberID]);

  // keep totalAmount in sync with formData.amount (external changes)
  useEffect(() => {
    if (typeof formData.amount === "number") setTotalAmount(formData.amount);
  }, [formData.amount]);

  // --- Steps ---------------------------------------------------------------

  const steps =
    type === "view"
      ? [
          {
            title: "Personal Details",
            description: "Provide your personal information",
          },
          {
            title: "Edit Installments",
            description: "View and manage installments",
          },
        ]
      : [
          {
            title: "Personal Details",
            description: "Provide your personal information",
          },
          { title: "More Details", description: "Provide some more details" },
          { title: "Installments", description: "Select payment plan" },
          { title: "Confirmation", description: "Review your information" },
        ];

  const renderContent = useCallback(
    (step: number) => {
      if (type === "view") {
        return (
          <ViewForm
            access={accessToken}
            age={age ?? 0}
            currentStep={currentStep}
            formData={formData}
            setCurrentStep={setCurrentStep}
            setFormData={setFormData}
          />
        );
      }

      switch (step) {
        case 0:
          return (
            <PersonalInfo
              access={accessToken}
              age={age ?? 0}
              error={error}
              fetchPrimary={fetchPrimaryMembers}
              formData={formData}
              handleBack={handleBack}
              handleChange={handleChange}
              handleContinue={handleContinue}
              handleSelectionChange={handleSelectionChange}
              handleSubmitClick={handleSubmitClick}
              primaryMembers={primaryMembers}
              searchQuery={searchQuery}
              selectedMembers={selectedMembers}
              setFormData={setFormData}
              setSearchQuery={setSearchQuery}
              setSelectedMembers={setSelectedMembers}
              type={type}
            />
          );
        case 1:
          return (
            <MembershipDetails
              access={accessToken}
              currentStep={currentStep}
              formData={formData}
              handleBack={handleBack}
              handleChange={handleChange}
              handleContinue={handleContinue}
              handleContrySelection={handleCountrySelection}
              handleSelectionChange={handleSelectionChange}
              handleSubmitClick={handleSubmitClick}
              setFormData={setFormData}
              setTotalAmount={setTotalAmount}
              type={type}
            />
          );
        case 2:
          return (
            <Installments
              filterInstallmentOpn={filteredInstallmentOpn}
              formData={formData}
              handleBack={handleBack}
              handleChange={handleChange}
              handleContinue={handleContinue}
              handleSelectionChange={handleSelectionChange}
              handleSubmitClick={handleContinue}
              setFormData={setFormData}
              totalAmount={totalAmount}
            />
          );
        case 3:
          return (
            <Confirmation
              formData={formData}
              handleBack={handleBack}
              handleContinue={handleContinue}
              setFormData={setFormData}
              totalAmount={totalAmount}
              type={type}
            />
          );
        default:
          return null;
      }
    },
    [
      accessToken,
      age,
      currentStep,
      error,
      fetchPrimaryMembers,
      filteredInstallmentOpn,
      formData,
      handleBack,
      handleChange,
      handleContinue,
      handleCountrySelection,
      handleSelectionChange,
      primaryMembers,
      searchQuery,
      setFormData,
      setSearchQuery,
      totalAmount,
      type,
    ],
  );

  // --- Render --------------------------------------------------------------

  return type === "view" ? (
    <FormLayout
      className="lg:overflow-y-auto"
      currentStep={currentStep}
      description={description}
      isSidebarVisible={false}
      setCurrentStep={setCurrentStep}
      steps={steps}
      title={title}
    >
      {renderContent(currentStep)}
    </FormLayout>
  ) : (
    <FormLayout
      currentStep={currentStep}
      description={description}
      setCurrentStep={setCurrentStep}
      steps={steps}
      title={title}
    >
      <div className="h-full">{renderContent(currentStep)}</div>
    </FormLayout>
  );
};

export default MembersForm;
