import { Card, CardBody, CardHeader } from "@heroui/card";
import React from "react";

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}
const MetricCard: React.FC<MetricCardProps> = ({ children, title }) => {
  return (
    <Card className="py-1">
      <CardBody>
        <CardHeader className="text-md font-semibold p-0 px-0 pb-3">
          {title}
        </CardHeader>
        {children}
      </CardBody>
    </Card>
  );
};

export default MetricCard;
