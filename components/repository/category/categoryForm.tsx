import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const CategoryForm: React.FC<Props> = ({ onSubmit, id, isEdit }) => {
  const [membershipOptions, setMembershipOptions] = useState<
    MemberTypeOption[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.accessToken
    : null;

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      membership_type: "",
      price: "",
    },
  });

  const fetchMemberType = async () => {
    setMembershipLoading(true);

    try {
      const res = await getMemberType(
        { query: `search=${searchQuery}` },
        access,
      )
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
    } finally {
      setMembershipLoading(false);
    }
  };

  const fetchCategoryByID = async (id: string) => {
    setCategoryLoading(true);

    try {
      const res = await getCategoryByID(id)
        .then((res) => res)
        .catch((err) => err);

      if (res.status == 200) {
        let data = res?.data?.data;

        setValue("name", data.Name);
        setValue("membership_type", data.Membership_Type);
        setValue("price", data.Price);
      }
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberType();
  }, [searchQuery]);

  useEffect(() => {
    if (isEdit && id) {
      fetchCategoryByID(id);
    }
  }, [isEdit]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
            {errors.name?.message && (
              <p className="text-xs text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>
        )}
        rules={{ required: "Name is required" }}
      />

      <Controller
        control={control}
        name="membership_type"
        render={({ field }) => {
          let selected = membershipOptions.find(
            (item: any) => item.id == field.value,
          );

          return (
            <div>
              <SearchableDropdown
                errorMessage={errors.membership_type?.message as string}
                handleChange={(option) => {
                  field.onChange(option.id);
                }}
                id="id"
                isRequired={true}
                isLoading={membershipLoading}
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

      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">
              Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
            {errors.price?.message && (
              <p className="text-xs text-destructive">
                {errors.price.message as string}
              </p>
            )}
          </div>
        )}
        rules={{
          required: "Price is required",
          validate: (value) =>
            !isNaN(Number(value)) || "Price must be a number",
        }}
      />

      <Button
        className="flex justify-self-end"
        disabled={isSubmitting || categoryLoading}
        type="submit"
      >
        {(isSubmitting || categoryLoading) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isEdit ? "Update" : "Add"}
      </Button>
    </form>
  );
};

export default CategoryForm;
