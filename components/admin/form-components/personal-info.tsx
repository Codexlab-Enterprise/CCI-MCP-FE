import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import api from "@/utils/axios";
import { countries } from "@/data";
import SmartAutocomplete from "@/components/elements/SmartAutocomplete";
import SelectField from "@/components/SelectField";
import { isValidEmail } from "@/utils/validation";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSelectionChange: (key: string, value: any) => void;
  type: string;
  age: number;
  access: string;
  primaryMembers: any[];
  isPrimaryMembersLoading?: boolean;
  handleContinue: () => void;
  handleBack: () => void;
  handleSubmitClick: () => void;
  error: any;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedMembers: any;
  setSelectedMembers: any;
}

const PersonalInfo: React.FC<Props> = ({
  formData,
  type,
  primaryMembers,
  setSearchQuery,
  handleChange,
  handleSelectionChange,
  setFormData,
  access,
  error,
  handleContinue,
  handleBack,
  handleSubmitClick,
  age,
  selectedMembers,
  setSelectedMembers,
  isPrimaryMembersLoading = false,
}) => {
  const [updateStateCounter, setUpdateStateCounter] = useState(0);
  const [selectedPrimary, setSelectedPrimary] = useState(
    selectedMembers.primary ?? null,
  );
  const [selectedSecondary, setSelectedSecondary] = useState(
    selectedMembers.secondary ?? null,
  );
  const [selectedProposal, setSelectedProposal] = useState(
    selectedMembers.proposal ?? null,
  );
  const [, setPrimaryMembersLoading] = useState(false);
  const [, setSecondaryMembersLoading] = useState(false);
  const [, setProposalMembersLoading] = useState(false);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const normalizeMemberCode = (value: unknown) =>
    value === null || value === undefined ? "" : String(value).trim();

  const toMemberOption = (member: any) => ({
    value: String(member?.strMemberCode ?? ""),
    label: `${member?.strMemberCode ?? ""}-${member?.strFullName ?? ""}`,
  });

  const countryOptions = React.useMemo(
    () =>
      countries.map((country) => ({
        key: country.key,
        value: country.key,
        label: country.label,
      })),
    [countries],
  );

  const handlePrimarySearchInput = (value: string) => {
    setSearchQuery(value);
  };

  const isEditing = React.useMemo(
    () => !!formData?.id || type === "edit",
    [formData?.id, type],
  );

  useEffect(() => {
    if (isEditing || formData.email.trim() == "") {
      setEmailError("");
      setPhoneError("");

      return;
    }

    const checkDuplicates = async () => {
      if (!formData?.email && !formData?.phone) return;

      setDuplicateCheckLoading(true);
      await Promise.all([
        formData.email
          ? checkDuplicateMember("email", formData.email)
          : Promise.resolve(false),
        formData.phone
          ? checkDuplicateMember("phone", formData.phone)
          : Promise.resolve(false),
      ]);
      setDuplicateCheckLoading(false);
    };

    const timeoutId = setTimeout(checkDuplicates, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.email, formData.phone, isEditing]);

  const checkDuplicateMember = async (field: string, value: string) => {
    if (field === "email" && !isValidEmail(formData.email)) {
      return;
    }

    return false;
  };

  const handleContinueWithValidation = async () => {
    setEmailError("");
    setPhoneError("");

    if (isEditing) {
      handleContinue();

      return;
    }

    setDuplicateCheckLoading(true);

    try {
      if (formData.email && isValidEmail(formData.email)) {
        handleContinue();
      }
    } catch (error) {
      toast.error("Error checking member existence");
    } finally {
      setDuplicateCheckLoading(false);
    }
  };

  const calculateDetailedAge = (dobString: string) => {
    if (!dobString) return "";

    try {
      const dob = new Date(dobString);
      const today = new Date();

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      let days = today.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        days += prevMonth.getDate();

        if (months < 0) {
          years--;
          months += 12;
        }
      }

      let ageString = "";

      if (years > 0) ageString += `${years} year${years !== 1 ? "s" : ""} `;
      if (months > 0) ageString += `${months} month${months !== 1 ? "s" : ""} `;
      if (days > 0 || ageString === "")
        ageString += `${days} day${days !== 1 ? "s" : ""}`;

      return ageString.trim();
    } catch (error) {
      return "";
    }
  };

  const [detailedAge, setDetailedAge] = useState("");

  useEffect(() => {
    if (formData.date && formData.date !== "") {
      const calculatedAge = calculateDetailedAge(formData.date);

      setDetailedAge(calculatedAge);
    } else {
      setDetailedAge("");
    }
  }, [formData.date]);

  const [_document, setDocumentObject] = useState<Document | null>(null);

  useEffect(() => {
    setDocumentObject(document);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        try {
          const formData = new FormData();

          formData.append("file", file);

          const response = api.post("/uploadfile/image", formData, {
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "multipart/form-data",
            },
          });

          toast.promise(response, {
            loading: "Uploading file...",
            success: (data: any) => {
              setFormData((prev: any) => ({
                ...prev,
                image: data.data.filename,
              }));

              return data.data.message || "File uploaded successfully!";
            },
            error: () => "Failed to upload file",
          });
        } catch (error) {
          toast.error("Failed to upload file");
        }
      }
    },
  });

  const handleNationalitySelection = (key: string | null) => {
    setFormData((prev: any) => ({
      ...prev,
      nationality: key || "",
    }));
  };

  const fetchPrimaryValue = async (id: string) => {
    const res = await api
      .get("/PrimaryMember/" + id + "")
      .then((res) => res)
      .catch((err) => err);

    if (res.status === 200) {
      if (res.data && res.data.items && res.data.items.length > 0) {
        return res.data.items[0];
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      let counter = 0;
      const updates: any = {};
      const associatedMember = normalizeMemberCode(formData.associatedMember);
      const secondaryCode = normalizeMemberCode(formData.secondarCode);
      const proposalCode = normalizeMemberCode(formData.proposalCode);

      if (associatedMember !== "") {
        setPrimaryMembersLoading(true);
        const primary: any = await fetchPrimaryValue(associatedMember);

        if (primary) {
          updates.primary = toMemberOption(primary);
          setSelectedPrimary(updates.primary);
        }
        setPrimaryMembersLoading(false);
        counter++;
      }

      if (secondaryCode !== "") {
        if (associatedMember !== "" && secondaryCode === associatedMember) {
          updates.secondary = updates.primary ? { ...updates.primary } : null;
        } else {
          setSecondaryMembersLoading(true);
          const secondary: any = await fetchPrimaryValue(secondaryCode);

          if (secondary) {
            updates.secondary = toMemberOption(secondary);
          }
          setSecondaryMembersLoading(false);
        }
        if (updates.secondary) {
          setSelectedSecondary(updates.secondary);
        }
        counter++;
      }

      if (proposalCode !== "") {
        if (associatedMember !== "" && proposalCode === associatedMember) {
          updates.proposal = updates.primary ? { ...updates.primary } : null;
        } else if (secondaryCode !== "" && proposalCode === secondaryCode) {
          updates.proposal = updates.secondary
            ? { ...updates.secondary }
            : null;
        } else {
          setProposalMembersLoading(true);
          const proposal: any = await fetchPrimaryValue(proposalCode);

          if (proposal) {
            updates.proposal = toMemberOption(proposal);
          }
          setProposalMembersLoading(false);
        }

        if (updates.proposal) {
          setSelectedProposal(updates.proposal);
        }

        counter++;
      }

      setSelectedMembers((prev: any) => ({
        ...prev,
        ...updates,
      }));

      setUpdateStateCounter((prev) => prev + counter);

      setPrimaryMembersLoading(false);
    };

    fetchData();
  }, [formData.associatedMember, formData.secondarCode, formData.proposalCode]);

  const today = new Date();

  const renderInput = (
    name: string,
    label: string,
    options: {
      type?: string;
      placeholder?: string;
      required?: boolean;
      error?: string;
    } = {},
  ) => (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name}>
        {label}
        {options.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        className={options.error ? "border-destructive" : ""}
        name={name}
        placeholder={options.placeholder}
        type={options.type ?? "text"}
        value={formData[name] ?? ""}
        onChange={handleChange}
      />
      {options.error && (
        <p className="text-xs text-destructive">{options.error}</p>
      )}
    </div>
  );

  return (
    <div className="overflow-x-hidden no-scrollbar pb-20 lg:max-h-[86dvh] overflow-y-auto">
      <div className="flex items-center gap-2 flex-col lg:flex-row w-full justify-between">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-0">Personal Details</h2>
          <p className="text-gray-500 mb-3">
            Please provide your personal information.
          </p>
        </div>
        <div className="flex right-0 items-center w-fit gap-2">
          <div
            {...getRootProps()}
            className="border-2 border-dashed lg:w-fit w-full border-gray-300 rounded-lg p-3 mb-2 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            {formData.image ? (
              <div className="flex flex-col group lg:flex-row relative items-center w-full justify-center">
                <img
                  alt="Preview"
                  className="w-20 h-20 lg:max-h-32 lg:w-24 object-contain"
                  src={`/api/uploadfile/image/${formData.image}`}
                />
                {formData.image && (
                  <button
                    className="text-xs absolute text-white bg-red-500 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev: any) => ({
                        ...prev,
                        image: undefined,
                      }));
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="lg:h-10 lg:w-[3.5rem] h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="lg:h-6 lg:w-6 h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">
                    Drag & drop photo here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center w-full flex-col gap-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          {renderInput("firstName", "First Name", {
            placeholder: "Enter first name",
            required: true,
          })}
          {renderInput("midName", "Middle Name", {
            placeholder: "Enter middle name",
          })}
          {renderInput("lastname", "Last Name", {
            placeholder: "Enter last name",
            required: true,
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <SelectField
            isRequired
            label="Gender"
            options={["Male", "Female"]}
            value={new Set([formData.gender])}
            onChange={(selectedSet: Set<string>) =>
              handleSelectionChange("gender", Array.from(selectedSet)[0] || "")
            }
          />

          {renderInput("phone", "Phone", {
            type: "number",
            placeholder: "Enter your phone",
            required: true,
            error: phoneError,
          })}
          {renderInput("email", "Email", {
            type: "email",
            placeholder: "Enter your email",
            required: true,
            error: emailError,
          })}

          <SmartAutocomplete
            isRequired
            items={countryOptions}
            label="Nationality"
            placeholder="Search and select your nationality..."
            selectedKey={formData.nationality}
            onSelectionChange={handleNationalitySelection}
            className="w-full"
            description="Search for your nationality"
          />

          <Combobox
            items={primaryMembers}
            value={selectedPrimary?.value ?? null}
            loading={isPrimaryMembersLoading}
            loadingText="Loading member data…"
            placeholder="Select Primary member…"
            searchPlaceholder="Search members…"
            onSearchChange={handlePrimarySearchInput}
            onChange={(_value, option) => {
              setSelectedPrimary(option);
              setSelectedMembers((prev: any) => ({ ...prev, primary: option }));
              handleSelectionChange("associatedMember", option?.value);
            }}
          />

          <Combobox
            items={primaryMembers}
            value={selectedSecondary?.value ?? null}
            loading={isPrimaryMembersLoading}
            loadingText="Loading member data…"
            placeholder="Select secondary code…"
            searchPlaceholder="Search members…"
            onSearchChange={handlePrimarySearchInput}
            onChange={(_value, option) => {
              setSelectedSecondary(option);
              setSelectedMembers((prev: any) => ({
                ...prev,
                secondary: option,
              }));
              handleSelectionChange("secondarCode", option?.value);
            }}
          />

          <Combobox
            items={primaryMembers}
            value={selectedProposal?.value ?? null}
            loading={isPrimaryMembersLoading}
            loadingText="Loading member data…"
            placeholder="Select proposal code…"
            searchPlaceholder="Search members…"
            onSearchChange={handlePrimarySearchInput}
            onChange={(_value, option) => {
              setSelectedProposal(option);
              setSelectedMembers((prev: any) => ({
                ...prev,
                proposal: option,
              }));
              handleSelectionChange("proposalCode", option?.value);
            }}
          />

          {renderInput("McbNo", "MCP No.")}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          <DateField
            label="Received Date"
            required
            value={formData.received_date}
            maxDate={today}
            onChange={(v) => handleSelectionChange("received_date", v)}
          />

          <div className="flex flex-col w-full">
            <DateField
              label="Date of birth"
              required
              value={formData.date}
              maxDate={today}
              fromYear={1925}
              toYear={today.getFullYear()}
              onChange={(v) => handleSelectionChange("date", v)}
            />
            {error != "" && (age < 10 || age > 21) && (
              <span className="text-red-600 text-xs">{error}</span>
            )}
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="text"
              value={detailedAge}
              placeholder="Age"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-10">
        {formData.status == "draft" && (
          <button
            className="border text-gray-600 px-4 py-1 rounded-md hover:bg-gray-100"
            onClick={handleSubmitClick}
          >
            Save as draft
          </button>
        )}
        {formData.status == "complete" && (
          <button
            className="border text-gray-600 px-4 py-1 rounded-md hover:bg-gray-100"
            onClick={handleSubmitClick}
          >
            Save
          </button>
        )}
        <button
          className="w-fit bg-blue-600 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-md"
          disabled={duplicateCheckLoading}
          onClick={handleContinueWithValidation}
        >
          {duplicateCheckLoading ? "Checking..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
