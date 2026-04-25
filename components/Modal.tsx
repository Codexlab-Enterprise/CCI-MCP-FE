import React, { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  content: ReactNode;
  title?: string;
  footerContent?: ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const ModalComponent: React.FC<ModalProps> = ({
  footerContent,
  title,
  isOpen,
  setIsOpen,
  content,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div>{content}</div>
        {footerContent && <DialogFooter>{footerContent}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default ModalComponent;
