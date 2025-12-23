import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { cn } from "@heroui/theme";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface BreadCrumbsComponentProps {
  title: string;
  className?: string;
}

const BreadCrumbsComponent: React.FC<BreadCrumbsComponentProps> = ({
  title,
  className,
}) => {
  const router = useRouter();

  return (
    <>
      <Breadcrumbs
        className={cn("border rounded-lg p-2 mb-4 w-fit", className)}
      >
        <BreadcrumbItem onClick={() => router.back()}>
          <Home size={16} />
        </BreadcrumbItem>
        <BreadcrumbItem>{title}</BreadcrumbItem>
      </Breadcrumbs>
    </>
  );
};

export default BreadCrumbsComponent;
