import React from "react";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

import ModalComponent from "./Modal";

interface DeleteModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => void;
  isDeleting: boolean;
}
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  setOpen,
  handleDelete,
}) => {
  return (
    <ModalComponent
      content={
        <div>
          <h1>Are you sure you want to delete this item?</h1>
        </div>
      }
      footerContent={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </>
      }
      isOpen={open}
      setIsOpen={setOpen}
      title="Delete This Item"
    />
  );
};

export default DeleteModal;
