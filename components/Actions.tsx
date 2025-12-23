import { Button } from "@heroui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import React from "react";

interface ActionsProps {
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
  handleView: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  moreButtonCode?: React.ReactNode;
}
const Actions: React.FC<ActionsProps> = ({
  isView,
  isEdit,
  isDelete,
  handleDelete,
  handleEdit,
  handleView,
  moreButtonCode,
}) => {
  return (
    <div className="flex space-x-2">
      {isView && (
        <Button
          className="text-green-900 dark:text-green-200 px-0 w-fit bg-green-100 dark:bg-green-900"
          size="sm"
          onPress={handleView}
        >
          <Eye className="h-5 w-5" />
        </Button>
      )}
      {isEdit && (
        <Button
          className="dark:text-blue-200 text-blue-900  px-0 w-fit bg-blue-100 dark:bg-blue-900"
          size="sm"
          onPress={handleEdit}
        >
          <Pencil className="h-5 w-5" />
        </Button>
      )}
      {isDelete && (
        <Button
          className="text-red-900 dark:text-red-200 px-0 w-fit bg-red-100 dark:bg-red-900"
          size="sm"
          onPress={handleDelete}
        >
          <Trash className="h-5 w-5" />
        </Button>
      )}
      {moreButtonCode && moreButtonCode}
    </div>
  );
};

export default Actions;
