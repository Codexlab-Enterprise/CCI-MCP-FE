import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";

interface Props {
  onSubmit: (data: any) => void;
  id?: string;
  data?: any;
  isEdit?: boolean;
}

const MembershipForm: React.FC<Props> = ({ onSubmit, isEdit, data, id }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: "" },
  });

  let filteredData =
    data && data.length > 0 && data?.find((item: any) => item.ID === id);

  console.log(data, id, filteredData);
  useEffect(() => {
    if (isEdit && filteredData) {
      setValue("name", filteredData.Name);
    }
  }, [isEdit, filteredData]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            isRequired
            label="Name"
            value={field.value}
            onValueChange={field.onChange} // HeroUI's change handler
          />
        )}
        rules={{ required: true }}
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

export default MembershipForm;
