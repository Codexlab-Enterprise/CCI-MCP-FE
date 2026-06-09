import { Eye, Pencil, Trash } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface ActionsProps {
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
  handleView: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  moreButtonCode?: React.ReactNode;
}

const iconButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

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
    <div className="flex items-center gap-1.5">
      {isView && (
        <button
          type="button"
          aria-label="View"
          title="View"
          onClick={handleView}
          className={cn(
            iconButtonBase,
            "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60",
          )}
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      {isEdit && (
        <button
          type="button"
          aria-label="Edit"
          title="Edit"
          onClick={handleEdit}
          className={cn(
            iconButtonBase,
            "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/60",
          )}
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {isDelete && (
        <button
          type="button"
          aria-label="Delete"
          title="Delete"
          onClick={handleDelete}
          className={cn(
            iconButtonBase,
            "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60",
          )}
        >
          <Trash className="h-4 w-4" />
        </button>
      )}
      {moreButtonCode && moreButtonCode}
    </div>
  );
};

export default Actions;
