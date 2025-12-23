import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import SearchableDropdown from "@/components/elements/SearchNSelect";
import { getMemberType } from "@/api/member-type";
import { getCategoryByID } from "@/api/category";

interface Props {
  onSubmit: (data: any) => void;
  id?: string;
  data?: any;
  isEdit?: boolean;
  setSelectedId?: React.Dispatch<React.SetStateAction<string | null>>;
}

interface MemberTypeOption {
  id: string;
  label: string;
}

const CategoryForm: React.FC<Props> = ({
  onSubmit,
  id,
  isEdit,
  data,
  setSelectedId,
}) => {
  const [membershipOptions, setMembershipOptions] = useState<
    MemberTypeOption[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.accessToken
    : null;
  // const {onClose, }=useDisclosure();

  // const foundCategory = data && data.find((item: any) => item.C_ID === id);
  // const initialMembership = foundCategory
  //   ? { id: foundCategory.ID, label: foundCategory.MembershipType }
  //   : null;

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      membership_type: "",
      price: "",
    },
  });

  const fetchMemberType = async () => {
    const res = await getMemberType({ query: `search=${searchQuery}` }, access)
      .then((res) => res)
      .catch((err) => err);

    if (res.status === 200) {
      setMembershipOptions(
        res?.data?.items.map((item: any) => ({
          id: item.ID,
          label: item.Name,
        })),
      );
    }
  };

  const fetchCategoryByID = async (id: string) => {
    const res = await getCategoryByID(id)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      console.log(res?.data?.data);
      let data = res?.data?.data;

      setValue("name", data.Name);
      setValue("membership_type", data.Membership_Type);
      setValue("price", data.Price);
    } else {
      console.log(res?.response.data?.error);
    }
  };

  useEffect(() => {
    fetchMemberType();
  }, [searchQuery]);

  useEffect(() => {
    if (isEdit) {
      fetchCategoryByID(id);
    }
  }, [isEdit]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Name Field */}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            isRequired
            errorMessage={errors.name?.message as string}
            label="Name"
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
        rules={{ required: "Name is required" }}
      />

      {/* Membership Field */}
      <Controller
        control={control}
        name="membership_type"
        render={({ field }) => {
          console.log(field.value);
          let selected = membershipOptions.find(
            (item: any) => item.id == field.value,
          );

          console.log(selected, membershipOptions);

          return (
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership <span className="text-red-500">*</span>
            </label> */}
              <SearchableDropdown
                errorMessage={errors.membership_type?.message as string}
                handleChange={(option) => {
                  console.log(option.id);
                  field.onChange(option.id);
                }}
                id="id"
                isRequired={true}
                label="label"
                options={membershipOptions}
                placeholder="Search membership types..."
                query={searchQuery}
                selectedVal={selected}
                setQuery={setSearchQuery}
                title="Membership"
              />
            </div>
          );
        }}
        rules={{ required: "Membership is required" }}
      />

      {/* Price Field */}
      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <Input
            isRequired
            errorMessage={errors.price?.message as string}
            label="Price"
            type="number"
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
        rules={{
          required: "Price is required",
          validate: (value) =>
            !isNaN(Number(value)) || "Price must be a number",
        }}
      />

      <Button
        className="flex justify-self-end"
        color="primary"
        isLoading={isSubmitting}
        type="submit"
      >
        {isEdit ? "Update" : "Add"}
      </Button>
    </form>
  );
};

export default CategoryForm;
