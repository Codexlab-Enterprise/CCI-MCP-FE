import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}
const MetricCard: React.FC<MetricCardProps> = ({ children, title }) => {
  return (
    <Card className="py-1">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
    </Card>
  );
};

export default MetricCard;
