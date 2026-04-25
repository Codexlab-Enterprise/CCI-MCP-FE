import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { getCategoryByMemberID } from "@/api/category";
import { getMemberType } from "@/api/member-type";
import SmartAutocomplete from "@/components/elements/SmartAutocomplete";
import { countries } from "@/data";

interface MemberShipDetailsProps {
  currentStep: number;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSelectionChange: (key: string, value: any) => void;
  handleContinue: () => void;
  handleContrySelection: (key: string | null) => void;
  setTotalAmount: React.Dispatch<React.SetStateAction<number>>;
  handleBack: () => void;
  type: string;
  handleSubmitClick: () => void;
  access: string;

  // handleNationalityChange:(key: string, value: any)=>void;
}
const MembershipDetails: React.FC<MemberShipDetailsProps> = ({
  access,
  formData,
  setFormData,
  handleChange,
  handleSelectionChange,
  handleContinue,
  handleBack,
  handleSubmitClick,
  type,
  setTotalAmount,
  currentStep,
  handleContrySelection,
}) => {
  const [memberSearch, setMemberSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [memberType, setMemberType] = useState([]);
  const [category, setCategory] = useState([]);
  const [memberTypeLoading, setMemberTypeLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const countryOptions = React.useMemo(
    () =>
      countries.map((country) => ({
        key: country.key,
        value: country.key,
        label: country.label,
      })),
    [countries],
  );
  const fetchMembershipType = async (value?: string) => {
    setMemberTypeLoading(true);

    try {
      const res = await getMemberType(
        {
          query: `search=${value || ""}`,
        },
        access,
      );

      setMemberType(
        res?.data?.items?.map((item: any) => {
          return {
            value: item.ID,
            label: `${item.Name}`,
          };
        }),
      );
    } finally {
      setMemberTypeLoading(false);
    }
  };

  const fetchCategories = async (id: any) => {
    setCategoryLoading(true);

    try {
      const res = await getCategoryByMemberID(id, categorySearch);

      setCategory(
        res?.data?.data?.map((item: any) => {
          return {
            value: item.C_ID,
            label: `${item.Name}`,
            price: item.Price,
          };
        }),
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  //       let selectedMembership = memberType?.length > 0
  //   ? memberType.find((item: any) => (item?.id == formData.subType?.id || item?.id == formData.subType))
  //   : null;

  // let selectedCategory = category?.length > 0
  //   ? category.find((item: any) => (item?.id == formData.type?.id || item?.id == formData.type))
  //   : null;

  //       useEffect(() => {
  //   if(formData.type!==null){
  //     fetchCategories(formData.type);
  //   }
  // },[formData.type])

  useEffect(() => {
    if (currentStep == 1) {
      fetchMembershipType();
    }
  }, [currentStep]);

  // },[])

  useEffect(() => {
    if (type == "add") {
    } else {
      if (formData.subType != undefined) {
        setSelectedMembershipType({
          value: formData.subType,
          label: formData.subTypeName,
        });
      }
      if (formData.type != undefined) {
        setSelectedCategory({
          value: formData.type,
          label: formData.typeName,
        });
      }
    }
  }, []);


  useEffect(() => {
  }, [selectedMembershipType]);


  const [_document, setDocumentObject] = useState<Document | null>(null);

  useEffect(() => {
    setDocumentObject(document);
  }, []);

  return (
    <div>
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-0">Choose Membership</h2>
        <p className="text-gray-500 mb-3">Please provide membership details.</p>
      </div>
      <div className="mb-2">
        {/* <Input
          name="McbNo"
          variant="bordered"
          // variant='out'
          type="text"
          //Note : MCB No and MCP no are same just lable has changed
          label="MCP No."
          value={formData.McbNo}
          onChange={handleChange}
          // isRequired={true}
        /> */}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* {type!=='edit'&&( */}
        <>
          <Combobox
            items={memberType}
            value={
              (selectedMembershipType?.value ?? formData.subType?.value) ||
              null
            }
            loading={memberTypeLoading}
            disabled={memberTypeLoading}
            placeholder="Select membership…"
            searchPlaceholder="Search membership types…"
            searchValue={memberSearch}
            onSearchChange={(q) => {
              setMemberSearch(q);
              fetchMembershipType(q);
            }}
            onChange={(_value, option) => {
              setSelectedMembershipType(option);
              handleSelectionChange("subType", option);
              if (option?.value) fetchCategories(option.value);
            }}
          />
          <Combobox
            items={category}
            value={
              (selectedCategory?.value ?? formData.type?.value) || null
            }
            loading={categoryLoading}
            disabled={categoryLoading || !formData.subType}
            placeholder="Select category…"
            searchPlaceholder="Search categories…"
            searchValue={categorySearch}
            onSearchChange={(q) => {
              setCategorySearch(q);
              if (formData.subType?.value) {
                fetchCategories(formData.subType.value);
              }
            }}
            onChange={(_value, option) => {
              setSelectedCategory(option);
              handleSelectionChange("type", option);
            }}
          />
        </>
      </div>
      <div>
        <div className="mb-2 flex flex-col gap-1.5">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) =>
              handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
            }
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-3 w-full">
          <SmartAutocomplete
            items={countryOptions}
            label="Country"
            placeholder="Search and select your country..."
            selectedKey={formData.country}
            onSelectionChange={handleContrySelection}
            className="w-full"
            description="Search for your country"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="pinCode">Pincode</Label>
            <Input
              id="pinCode"
              className="w-full"
              name="pinCode"
              placeholder="Pincode Eg.401200"
              type="number"
              value={formData.pinCode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100"
          onClick={handleBack}
        >
          Back
        </button>
        <div className="flex gap-2">
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
          {/* <button onClick={handleSubmitClick} className='text-gray-600 border py-2 px-4 rounded-md hover:bg-gray-100'>
              Save as draft
            </button> */}
          <button
            onClick={handleContinue}
            disabled={memberTypeLoading || categoryLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-600/50 hover:bg-blue-700 "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipDetails;
