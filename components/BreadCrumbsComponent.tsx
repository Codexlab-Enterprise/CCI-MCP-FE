import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
    <Breadcrumb className={cn("border rounded-lg p-2 mb-4 w-fit", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center transition-colors hover:text-foreground"
          >
            <Home size={16} />
          </button>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumbsComponent;
