// import { Modal } from '@heroui/react'
import React from "react";
import { Button } from "@heroui/button";
import { Trash } from "lucide-react";

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
  // const {onClose}=useDisclosure()
  return (
    <ModalComponent
      content={
        <div>
          <h1>Are you sure you want to delete this item?</h1>
        </div>
      }
      footerContent={
        <>
          <Button
            className="dark:bg-gray-950 bg-gray-500 font-semibold text-white dark:text-gray-500"
            variant="ghost"
            onPress={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="dark:bg-red-950 bg-red-500 font-semibold text-white dark:text-red-500"
            isLoading={false}
            onPress={handleDelete}
          >
            <Trash className="h-4 w-4" /> Delete
          </Button>
        </>
      }
      isOpen={open}
      setIsOpen={setOpen}
      title={`Delete This Item`}
    />
  );
};

export default DeleteModal;
