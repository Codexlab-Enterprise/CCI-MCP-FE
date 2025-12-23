import { Input } from "@heroui/input";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Select from "react-select";
import { DatePicker } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

import api from "@/utils/axios";
import { countries } from "@/data";
import SmartAutocomplete from "@/components/elements/SmartAutocomplete";
import SelectField from "@/components/SelectField";
import { ismemberexists } from "@/api/members";
import { isValidEmail } from "@/utils/validation";
const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "55px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#000000" : "#dcdcdc",
    boxShadow: state.isFocused ? "0 0 0 1px black" : "black",
    paddingLeft: "0px",

    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    // backgroundColor: '#edf2f7',
    borderRadius: "9999px",
    padding: "",
    fontWeight: 500,
    color: "#2d3748",
    fontSize: "14px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3182ce"
      : state.isFocused
        ? "#ebf8ff"
        : "white",
    color: state.isSelected ? "white" : "#2d3748",
    // zIndex: 9999,
    borderRadius: "5px",
    padding: "6px 12px",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSelectionChange: (key: string, value: any) => void;
  // handleNationalityChange:(key: string, value: any)=>void;
  searchQuery: string;
  type: string;
  fetchPrimary: (search?: string) => void;
  age: number;
  access: string;
  primaryMembers: any[];
  handleContinue: () => void;
  handleBack: () => void;
  handleSubmitClick: () => void;
  error: any;

  // selectedPrimaryMember:any;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedMembers: any;
  setSelectedMembers: any;
}
const PersonalInfo: React.FC<Props> = ({
  formData,
  type,
  searchQuery,
  primaryMembers,
  fetchPrimary,
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
  const [primaryOptionLoading, setPrimaryMembersLoading] = useState(false);
  const [secondaryOptionLoading, setSecondaryMembersLoading] = useState(false);
  const [proposalOptionLoading, setProposalMembersLoading] = useState(false);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const countryOptions = React.useMemo(
    () =>
      countries.map((country) => ({
        key: country.key,
        value: country.key,
        label: country.label,
      })),
    [countries],
  );

const isEditing = React.useMemo(
  () => !!formData?.id || type === "edit",
  [formData?.id, type]
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
  if (field === "email" &&  !isValidEmail(formData.email))
    {
console.log("validate email", isValidEmail(formData.email))

return;
    }
  // if (isEditing || !value) {
  //   if (field === "email") setEmailError("");
  //   if (field === "phone") setPhoneError("");
  //   return false;
  // }
  // try {
  //   setDuplicateCheckLoading(true);
  //   const payload = { [field]: value };
  //   const res = await ismemberexists(payload);
  //   if (res.status === 200 && res.data.exists) {
  //     const msg = `Member with this already exists`;
  //     field === "email" ? setEmailError(msg) : setPhoneError(msg);
  //     toast.error(msg);
  //     return true;
  //   } else {
  //     field === "email" ? setEmailError("") : setPhoneError("");
      return false;
  //   }
  // } catch (e) {
  //   console.error("Error checking duplicate member:", e);
  //   return false;
  // } finally {
  //   setDuplicateCheckLoading(false);
  // }
};



const handleContinueWithValidation = async () => {
  setEmailError("");
  setPhoneError("");

console.log("validate email", isValidEmail(formData.email))

  if (isEditing) {
    handleContinue(); 
    return;
  }

  let hasDuplicate = false;
  setDuplicateCheckLoading(true);


  try {
    if (formData.email && isValidEmail(formData.email)) {
      
    //   const emailRes = await ismemberexists({ email: formData.email });

    //   if (emailRes.status === 200 && emailRes.data.exists) {
    //     setEmailError("Member with this email already exists");
    //     toast.error("Member with this email already exists");
    //     hasDuplicate = true;
    //   }
          handleContinue();

    }

    // if (formData.phone && !hasDuplicate) {
    //   const phoneRes = await ismemberexists({ phone: formData.phone });
    //   if (phoneRes.status === 200 && phoneRes.data.exists) {
    //     setPhoneError("Member with this phone already exists");
    //     toast.error("Member with this phone already exists");
    //     hasDuplicate = true;
    //   }
    // }

    // if (!hasDuplicate) 

  }
  
  catch (error) {
    console.error("Error checking duplicates:", error);
    toast.error("Error checking member existence");
  } finally {
    setDuplicateCheckLoading(false);
  }
};

  const calculateDetailedAge = (dobString) => {
    if (!dobString) return "";

    try {
      const dob = new Date(dobString);
      const today = new Date();

      // Calculate years
      let years = today.getFullYear() - dob.getFullYear();

      // Calculate months
      let months = today.getMonth() - dob.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      // Calculate days
      let days = today.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        // Get days in the previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        days += prevMonth.getDate();

        if (months < 0) {
          years--;
          months += 12;
        }
      }

      // Format the age string
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
    console.log("formData ", formData);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // setImage(URL.createObjectURL(file));
        try {
          // Create FormData and append the file
          const formData = new FormData();

          formData.append("file", file);

          // Upload the file
          const response = api.post("/uploadfile/image", formData, {
            headers: {
              Authorization: `Bearer ${access}`, // Include the access token if needed
              "Content-Type": "multipart/form-data",
            },
          });

          toast.promise(response, {
            loading: "Uploading file...",
            success: (data: any) => {
              setFormData((prev) => ({
                ...prev,
                image: data.data.filename, // Use the filename from the API response
              }));

              return data.data.message || "File uploaded successfully!";
            },
            error: (error) => {
              // throw new Error('File upload failed');
              return "Failed to upload file";
            },
          });

          // if (response.status !== 200) {
          //   throw new Error('File upload failed');
          // }

          // const result = await response.data;

          // Update form data with the filename from the response
          // setFormData(prev => ({
          //   ...prev,
          //   image: result.filename // Use the filename from the API response
          // }));

          // toast.success(result.message || 'File uploaded successfully!');
        } catch (error) {
          console.error("Error uploading file:", error);
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

  const fetchPrimaryValue = async (id) => {
    console.log("id", id);
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

      if (formData.associatedMember !== "") {
        setPrimaryMembersLoading(true);
        const primary: any = await fetchPrimaryValue(formData.associatedMember);

        if (primary) {
          updates.primary = {
            value: primary.strMemberCode,
            label: `${primary.strMemberCode}-${primary.strFullName}`,
          };
        }
        setPrimaryMembersLoading(false);

        if (updates.primary) {
          setSelectedPrimary(updates.primary);
        }
        counter++;
      }

      if (formData.secondarCode !== "") {
        if (
          formData.associatedMember !== "" &&
          formData.secondarCode == formData.associatedMember
        ) {
          updates.secondary = { ...updates.primary };
        } else {
          setSecondaryMembersLoading(true);
          const secondary: any = await fetchPrimaryValue(formData.secondarCode);

          if (secondary) {
            updates.secondary = {
              value: secondary.strMemberCode,
              label: `${secondary.strMemberCode}-${secondary.strFullName}`,
            };
          }
          setSecondaryMembersLoading(false);

          if (updates.secondary) {
            setSelectedSecondary(updates.secondary);
          }
        }
        counter++;
      }

      if (formData.proposalCode !== "") {
        if (
          formData.associatedMember !== "" &&
          formData.proposalCode == formData.associatedMember
        ) {
          updates.proposal = { ...updates.primary };
        } else if (
          formData.secondarCode !== "" &&
          formData.proposalCode == formData.secondarCode
        ) {
          updates.proposal = { ...updates.secondary };
        } else {
          setProposalMembersLoading(true);
          const proposal: any = await fetchPrimaryValue(formData.proposalCode);

          if (proposal) {
            updates.proposal = {
              value: proposal.strMemberCode,
              label: `${proposal.strMemberCode}-${proposal.strFullName}`,
            };
          }
          setProposalMembersLoading(false);

          if (updates.proposal) {
            setSelectedProposal(updates.proposal);
          }
          counter++;
        }
      }
      // Update selected members in one go
      setSelectedMembers((prev) => ({
        ...prev,
        ...updates,
      }));

      // Update counter safely
      setUpdateStateCounter((prev) => prev + counter);

      setPrimaryMembersLoading(false);
    };

    fetchData();
  }, [formData.associatedMember, formData.secondarCode, formData.proposalCode]);

  

  useEffect(() => {
    console.log("Proposal Code", selectedMembers.proposal);
    console.log("Associated Member", selectedMembers.primary);
    console.log("Secondry Code", selectedMembers.secondary);
  }, [selectedMembers]);

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
            className="border-2 border-dashed lg:w-fit w-full  border-gray-300 rounded-lg p-3 mb-2 text-center cursor-pointer hover:border-blue-500 transition-colors "
          >
            <input {...getInputProps()} />
            {formData.image ? (
              <div className="flex flex-col group lg:flex-row relative items-center w-full justify-center">
                <img
                  alt="Preview"
                  className=" w-20 h-20 lg:max-h-32  lg:w-24 object-contain"
                  src={`/api/uploadfile/image/${formData.image}`}
                />
                {/* {image} */}
                {formData.image && (
                  <button
                    className="text-xs absolute text-white bg-red-500 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity "
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({
                        ...prev,
                        image: undefined,
                      }));
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
                <div>
                  {/* <p className="text-xs text-gray-600 text-wrap truncate w-full">
                {typeof formData.image === 'string' 
                  ? 'Uploaded Image' r
                  : formData.image.name}
              </p> */}
                </div>
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
        {/* </div> */}
      </div>

      <div className="flex items-center w-full flex-col gap-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          <Input
            isRequired
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            label="First Name"
            name="firstName"
            placeholder="Enter first name"
            type="text"
            value={formData.firstName}
            variant="bordered"
            onChange={handleChange}
          />

          <Input
            isRequired
            className="w-full focus:outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
            label="Middle Name"
            name="midName"
            placeholder="Enter middle name"
            type="text"
            value={formData.midName}
            variant="bordered"
            onChange={handleChange}
          />

          <Input
            isRequired
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            label="Last Name"
            name="lastname"
            placeholder="Enter last name"
            type="text"
            value={formData.lastname}
            variant="bordered"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <SelectField
            isRequired
            className="rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            label="Gender"
            options={["Male", "Female"]}
            value={new Set([formData.gender])}
            onChange={(selectedSet: Set<string>) =>
              handleSelectionChange("gender", Array.from(selectedSet)[0] || "")
            }
          />

          <Input
            isRequired
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            errorMessage={phoneError}
            isInvalid={!!phoneError}
            label="Phone"
            name="phone"
            placeholder="Enter your phone"
            type="number"
            value={formData.phone}
            variant="bordered"
            onChange={handleChange}
          />

          <Input
            isRequired
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            errorMessage={emailError}
            isInvalid={!!emailError}
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={formData.email}
            variant="bordered"
            onChange={handleChange}
          />

          <SmartAutocomplete
            isRequired
            items={countryOptions}
            label="Nationality"
            placeholder="Search and select your nationality..."
            selectedKey={formData.nationality}
            variant="bordered"
            onSelectionChange={handleNationalitySelection}
            className="w-full"
            // is={true}
            description="Search for your natinality"
          />

          <Select
            isSearchable
            classNamePrefix="react-select"
            isLoading={selectedPrimary ? null : primaryOptionLoading}
            loadingMessage={() => "Loading member data..."}
            menuPortalTarget={_document?.body ?? null}
            options={primaryMembers}
            placeholder={
              primaryOptionLoading
                ? "Loading member data..."
                : "Select Primary member..."
            }
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
            value={selectedPrimary}
            onChange={(e) => {
              setSelectedPrimary(e);
              setSelectedMembers((prev) => ({ ...prev, primary: e }));
              handleSelectionChange("associatedMember", e?.value);
            }}
            onInputChange={(e) => {
              fetchPrimary(e);
            }}
          />

          <Select
            isSearchable
            classNamePrefix="react-select"
            isLoading={selectedSecondary ? null : secondaryOptionLoading}
            loadingMessage={() => "Loading member data..."}
            menuPortalTarget={_document?.body ?? null}
            options={primaryMembers}
            placeholder={
              secondaryOptionLoading
                ? "Loading member data..."
                : "Select secondary code..."
            }
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
            value={selectedSecondary}
            onChange={(e) => {
              setSelectedSecondary(e);
              setSelectedMembers((prev) => ({ ...prev, secondary: e }));
              handleSelectionChange("secondarCode", e?.value);
            }}
            onInputChange={(e) => {
              fetchPrimary(e);
            }}
          />

          <Select
            isSearchable
            classNamePrefix="react-select"
            isLoading={selectedProposal ? null : proposalOptionLoading}
            loadingMessage={() => "Loading member data..."}
            menuPortalTarget={_document?.body ?? null}
            options={primaryMembers}
            placeholder={
              proposalOptionLoading
                ? "Loading member data..."
                : "Select proposal code..."
            }
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
            value={selectedProposal}
            onChange={(e) => {
              setSelectedProposal(e);
              setSelectedMembers((prev) => ({ ...prev, proposal: e }));
              handleSelectionChange("proposalCode", e?.value);
            }}
            onInputChange={(e) => {
              fetchPrimary(e);
            }}
          />

          <Input
            label="MCP No."
            name="McbNo"
            //Note : MCB No and MCP no are same just lable has changed
            value={formData.McbNo}
            variant="bordered"
            // variant='out'
            type="text"
            onChange={handleChange}
            // isRequired={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          <I18nProvider locale="en-IN">
            <DatePicker
              isRequired
              showMonthAndYearPickers
              className="w-full"
              maxValue={today(getLocalTimeZone())}
              variant="bordered"
              onChange={(value) => {
                console.log(value.toString());
                handleSelectionChange("received_date", value.toString());
              }}
              label={"Received Date"}
              // locale="en-GB"
              value={
                formData.received_date && formData.received_date != ""
                  ? parseDate(formData.received_date)
                  : null
              }
            />
          </I18nProvider>

          <div className="flex flex-col w-full">
            <I18nProvider locale="en-IN">
              <DatePicker
                isRequired
                showMonthAndYearPickers
                className="w-full"
                label={"Date of birth"}
                maxValue={today(getLocalTimeZone())}
                value={
                  formData.date && formData.date != ""
                    ? parseDate(formData.date)
                    : null
                }
                variant="bordered"
                onChange={(value) => {
                  console.log(value.toString());
                  handleSelectionChange("date", value.toString());
                }}
              />
            </I18nProvider>

            {error != "" && (age < 10 || age > 21) && (
              <span className="text-red-600 text-xs">{error}</span>
            )}
          </div>

          <Input
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            label="Age"
            name="age"
            type="text"
            variant="bordered"
            value={detailedAge}
            // onChange={handleChange}
            placeholder="Age"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-10">
        {formData.status == "draft" && (
          <>
            <button
              className="border text-gray-600 px-4  py-1 rounded-md hover:bg-gray-100"
              onClick={handleSubmitClick}
            >
              Save as draft
            </button>
          </>
        )}
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
          className="w-fit bg-blue-600 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-md"
          disabled={duplicateCheckLoading}
          onClick={handleContinueWithValidation}
        >
          {duplicateCheckLoading ? "Checking..." : "Continue"}
        </button>
        {/* </button> */}
      </div>
    </div>
  );
};

export default PersonalInfo;

