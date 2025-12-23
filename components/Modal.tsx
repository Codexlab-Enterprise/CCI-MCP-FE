import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import React, { ReactNode } from "react";

interface ModalProps {
  // isFooter:boolean;
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
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{content}</ModalBody>
            <ModalFooter>{footerContent}</ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalComponent;
