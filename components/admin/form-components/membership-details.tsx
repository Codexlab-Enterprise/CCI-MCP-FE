// import { getCategoryByMemberID } from '@/api/category';
import { Input, Textarea } from "@heroui/input";
import React, { useEffect, useState } from "react";
import Select from "react-select";

import { getCategoryByMemberID } from "@/api/category";
import { getMemberType } from "@/api/member-type";
import SmartAutocomplete from "@/components/elements/SmartAutocomplete";
import { countries } from "@/data";

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
    const res = await getMemberType({ query: `search=${value || ""}` }, access);

    console.log(
      res?.data?.items?.map((item: any) => {
        return {
          value: item.ID,
          label: item.Name,
        };
      }),
    );
    setMemberType(
      res?.data?.items?.map((item: any) => {
        return {
          value: item.ID,
          label: `${item.Name}`,
        };
      }),
    );
  };

  const fetchCategories = async (id: any) => {
    console.log("fetching cat");
    const res = await getCategoryByMemberID(id, categorySearch);

    console.log(
      res?.data?.data?.map((item: any) => {
        return {
          value: item.C_ID,
          label: item.Name,
        };
      }),
    );
    setCategory(
      res?.data?.data?.map((item: any) => {
        return {
          value: item.C_ID,
          label: `${item.Name}`,
          price: item.Price,
        };
      }),
    );
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
  // console.log('selectedCategory',formData.subType,memberType?.find((option) => option.value=== formData.subType), memberType);

  useEffect(() => {
    if (type == "add") {
    } else {
      console.log(formData);
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

  console.log("selectedCategory", selectedCategory, selectedMembershipType);

  useEffect(() => {
    console.log("selectedMembershipType", selectedMembershipType);
  }, [selectedMembershipType]);

  console.log("formData", formData);

  const [_document, setDocumentObject] = useState<Document | null>(null);

  useEffect(() => {
    setDocumentObject(document);
    console.log("formData ", formData);
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
          <Select
            isSearchable
            classNamePrefix="react-select"
            menuPortalTarget={_document?.body ?? null}
            options={memberType}
            placeholder="Select membership..."
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              // borderRadius: 0,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
            value={selectedMembershipType || formData.subType}
            onChange={(e) => {
              setSelectedMembershipType(e);
              handleSelectionChange("subType", e);
              fetchCategories(e.value);
            }}
          />
          <Select
            isSearchable
            classNamePrefix="react-select"
            menuPortalTarget={_document?.body ?? null}
            options={category}
            placeholder="Select category..."
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              // borderRadius: 0,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
            value={selectedCategory || formData.type}
            onChange={(e) => {
              console.log(e);
              setSelectedCategory(e);
              handleSelectionChange("type", e);
            }}
          />
        </>
      </div>
      <div>
        <Textarea
          className="rounded-xl focus:outline-none mb-2 focus:ring-2 focus:ring-blue-500"
          label="Address"
          name="address"
          type="text"
          variant="bordered"
          value={formData.address}
          // height={100}
          onChange={handleChange}
        />

        <div className="grid  lg:grid-cols-2 gap-3 w-full">
          <SmartAutocomplete
            items={countryOptions}
            label="Country"
            placeholder="Search and select your country..."
            selectedKey={formData.country}
            variant="bordered"
            onSelectionChange={handleContrySelection}
            className="w-full"
            // is={true}
            description="Search for your country"
          />

          <Input
            className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            label="Pincode"
            name="pinCode"
            placeholder="Pincode Eg.401200"
            type="number"
            value={formData.pinCode}
            variant="bordered"
            onChange={handleChange}
          />
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
            //   disabled={loading}
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
