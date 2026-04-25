import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        )}
        rules={{ required: true }}
      />
      <Button
        className="flex justify-self-end"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update" : "Add"}
      </Button>
    </form>
  );
};

export default MembershipForm;
